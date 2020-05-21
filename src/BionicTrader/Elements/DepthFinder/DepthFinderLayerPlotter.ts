import * as bjs from 'babylonjs';
import { BaseTexture, Nullable } from 'babylonjs';
import { pngTwentyColorPalette } from "../../../../global/Assets";
import { GLSGColor } from '../../../Enums';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { Scene } from "../../../SceneGraph/Scene";
import { SolidParticleMaterial } from '../../../SceneGraph/SolidParticleMaterial';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { VectorFieldLayer } from '../../../SceneGraph/VectorFieldLayer';
import { VectorFieldPlotter } from '../../../SceneGraph/VectorFieldPlotter';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { DepthFinderRow } from './DepthFinderRow';

export class DepthFinderLayerPlotter extends VectorFieldPlotter
{
    public isResetting : boolean = false;
    public rowDepthMultiplier : number = 0;
    public maxCellHeight: number = 20;

    firstDraw : boolean = true;
    setParticlesRange : number = 0;
    particlesAdded : boolean = false;
    framesSinceParticlesAdded : number = 0;
    buildMeshNextFrame : boolean = false;
    currentCellIndex : number = 0;
    removeRowRequested : boolean = false;
    framesSinceRemoveRowRequest : number = 0;
    removeRowNextFrame : boolean = false;
    numCellsToRemove : number = 0;
    particleStore : Array<bjs.SolidParticle> = new Array<bjs.SolidParticle>();
    
    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public mesh: bjs.Mesh,
        public rowCount:number,
        public columnCount: number,
        public cellWidth: number,
        public cellHeight: number,
        public cellDepth: number,
        public cellMeshScaleFactor: number,
        public presenter : DepthFinderPresenter,
        public orderBookRig : bjs.TransformNode,
        public layerType : VectorFieldLayerType
    )
    {
        super(
            name,
            x,
            y,
            z,
            scene,
            mesh,
            rowCount, 
            columnCount,
            cellWidth,
            cellHeight,
            cellDepth,
            cellMeshScaleFactor,
            presenter
        );
        this.create();
    }

    async create()
    {
        super.create();

        let particleStoreSize = this.rowCount * this.columnCount;
        this.sps.addShape(this.meshBase,particleStoreSize,{ storage : this.particleStore as []});

        this.mesh.material = this.material;
        this.material.albedoColor = bjs.Color3.White();
        var texture = new bjs.Texture(pngTwentyColorPalette, this.scene.bjsScene);
        this.material.albedoTexture = texture;
        this.material.reflectionTexture =  this.scene.hdrTexture as Nullable<BaseTexture>;
        this.material.roughness = 0.05;
        this.material.metallic = 0.85;
        this.material.freeze();

        this.presenter.onAddedNewRow.subscribe(() => {
            this.addRow(this.presenter.getCurrentRow() as DepthFinderRow);
        });

        this.presenter.onRemovedLastRow.subscribe(( p, r ) => {
            this.removeRow(r);
        });
    }

    public reset()
    {
        this.isResetting = true;
    }

    protected onPreRender()
    {
        if (this.removeRowNextFrame)
        {
           let removedParticles : Array<bjs.SolidParticle> =  this.sps.removeParticles(0, this.numCellsToRemove-1);
           this.particleStore.push.apply(this.particleStore,removedParticles);
            
            this.numCellsToRemove = 0
            this.removeRowNextFrame = false;
            this.removeRowRequested = false;
            this.framesSinceRemoveRowRequest = 0;
        }
        
        if (this.buildMeshNextFrame)
        {
            this.sps.buildMesh();
            this.buildMeshNextFrame = false;
            this.sps.setParticles();
        }
        else
        {
            if (this.setParticlesRange > 0)
                this.sps.setParticles(0,this.setParticlesRange,true);       
        }
    }

    protected onPostRender()
    {     
        if (this.removeRowRequested)
        {
            this.framesSinceRemoveRowRequest = this.framesSinceRemoveRowRequest + 1;

            if (this.framesSinceRemoveRowRequest === 2)
                this.removeRowNextFrame = true;
        }

        if (this.particlesAdded )
        {
            this.particlesAdded = false;
            this.buildMeshNextFrame = true;
        }
    }

    public addRow(row : DepthFinderRow)
    {
        if (row)
        {
            let cellLayer : VectorFieldLayer | undefined = row.getLayer(this.layerType);

            if (cellLayer)
            {
                let cellCount : number = cellLayer.numCells;
                this.setParticlesRange = cellCount;
                this.currentCellIndex = 0;
        
                if (cellCount > 0)
                {   
                    if (this.meshBase)
                    {
                        let rowParticles : Array<bjs.SolidParticle>  = this.particleStore.slice(0,cellCount);
                        
                        for( let i:number = 0; i < rowParticles.length; i++)
                        {
                            let particle : bjs.SolidParticle = rowParticles[i];
                            particle.id = i;
                            this.onSetInitialParticlePosition(particle);
                        }
                        this.sps.insertParticlesFromArray(rowParticles);
                        this.particlesAdded = true;
                    }                 
                    else
                    {
                        console.log("DepthFinderPlotter : Null Mesh");
                    }              
                }       
            }
           
        }
        else
        {
            console.log("DepthFinderPlotter : Null Row");
        }  
    }

    public removeRow(row : DepthFinderRow)
    {
        let cellLayer : VectorFieldLayer | undefined = row.getLayer(this.layerType);

        if (cellLayer)
        {
            this.numCellsToRemove = cellLayer.cellsByIndex.size;
            this.removeRowRequested = true;
        }
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle) => 
    {  
        particle.isVisible = false;
        
        if (particle.idx > 0)
        {
            if (this.presenter.currentGeneration > 1)
            {
                let row : DepthFinderRow = this.presenter.getCurrentRow() as DepthFinderRow;
                let layer : VectorFieldLayer | undefined = row.getLayer(this.layerType);

                if (layer)
                {
                    let cell : VectorFieldCell =  Array.from(layer.cellsByIndex.values())[particle.id];
    
                    if (cell != null)
                    {
                        (particle as any).cell = cell;

                        let particlePositionX: number = ((row.positionOffsetX + cell.positionOffset.x) * this.cellWidth) + this.cellWidth/2;
                        let particlePositionY: number = 0;
                        let particlePositionZ: number = 0;    
                        
                        if (cell.color === GLSGColor.Red)
                        {
                            particlePositionX -= (this.cellWidth);
                        }
                        else
                        {
                            particlePositionX += (this.cellWidth);
                        }
        
                        particlePositionY = cell.positionOffset.y * this.cellHeight;
                        particle.scaling.z = this.cellDepth * this.cellMeshScaleFactor;                      
                        particlePositionZ = -(this.presenter.currentGeneration * this.cellDepth) + (this.cellDepth);
                        particlePositionY  += ((cell.height * 0.5) * this.cellHeight) + 0.01;;
                        particle.scaling.x = this.cellWidth * this.cellMeshScaleFactor;
                        particle.scaling.y = cell.height * this.cellHeight;

                        if ( Math.abs(this.orderBookRig.position.x + particlePositionX) <= this.columnCount)
                        {
                            particle.isVisible = true;
                            particle.position.set(particlePositionX , particlePositionY , particlePositionZ);
                            particle.uvs =  SolidParticleMaterial.getUVSforColor(cell.color);
                        }
                        else
                        {
                            particle.isVisible = false;
                        }
                    }
                    else
                    {
                        particle.isVisible = false;
                    }
                }  
            }          
        }
        else
        {
            particle.isVisible = false;
        }         
    }  
}
