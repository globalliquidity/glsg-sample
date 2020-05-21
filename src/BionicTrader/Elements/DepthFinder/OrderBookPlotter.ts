import * as bjs from 'babylonjs';
import { Scene } from "../../../SceneGraph/Scene";
import { pngTwentyColorPalette } from "../../../../global/Assets";
import Logger from '../../../Utils/Logger';
import { SolidParticleMaterial } from '../../../SceneGraph/SolidParticleMaterial';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { DepthFinderRow } from './DepthFinderRow';
import { VectorFieldPlotter } from '../../../SceneGraph/VectorFieldPlotter';
import { VectorFieldLayer } from '../../../SceneGraph/VectorFieldLayer';
import { GLSGColor } from '../../../Enums';
import { particlesPixelShader } from 'babylonjs/Shaders/particles.fragment';
import { VectorFieldRow } from '../../../SceneGraph/VectorFieldRow';

export class OrderBookPlotter extends VectorFieldPlotter
{
    public isResetting : boolean;
    public rowDepthMultiplier : number = 0;
    public maxCellHeight: number = 20;

    firstDraw : boolean = true;

    setParticlesRange : number = 0;

    particleStore : any = [];
    particlesAddedToStore : boolean = false;
    framesSinceParticlesAdded : number = 0;


    currentCellIndex : number = 0;

    removeRowRequested : boolean = false;
    framesSinceRemoveRowRequest : number = 0;
    removeRowNextFrame : boolean = false;
    numCellsToRemove : number = 0;
    
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
        public orderBookRig : bjs.TransformNode
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
        Logger.log('DepthFinderPlotter :  constructor()');
        // console.log('OrderBookHistogramValueField :  creating OrderBookHistogramValueField with ' + rowCount + ' rows, and ' + columnCount + ' columns.');
        Logger.log('DepthFinderPlotter :  constructor() - calling this.create()');

        this.create();
    }

    async create()
    {
        console.log('DepthFinderPlotter : create()');
        super.create();

        var store : any = [];
        var options = {positionFunction: this.onSetInitialParticlePosition , vertexFunction : null, storage: this.particleStore};

        //this.sps.addShape(this.meshBase,5000, options);
        //this.sps.mesh.freezeWorldMatrix(); // prevents from re-computing the World Matrix each frame
        //this.sps.mesh.freezeNormals(); 

        this.mesh.material = this.material;

        this.material.albedoColor = bjs.Color3.White();
        var texture = new bjs.Texture(pngTwentyColorPalette, this.scene.bjsScene);
        this.material.albedoTexture = texture;
        this.material.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<bjs.BaseTexture>;
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
        //this.sps.setParticles(0, this.setParticlesRange); 
        //this.sps.setParticles();

        if (this.removeRowNextFrame)
        {
            this.sps.removeParticles(1, this.numCellsToRemove);
            this.numCellsToRemove = 0
            this.removeRowNextFrame = false;
            this.removeRowRequested = false;
            this.framesSinceRemoveRowRequest = 0;
        }


        if (this.particlesAddedToStore )
        {
           // if (this.framesSinceParticlesAdded === 1)
           // {
                //this.sps.insertParticlesFromArray(this.particleStore);
                //this.sps.addShape(this.meshBase,this.setParticlesRange,{ positionFunction: this.onSetInitialParticlePosition});
                this.sps.buildMesh();
                this.particlesAddedToStore = false;
                this.framesSinceParticlesAdded = 0;
                this.particleStore = [];
          //  }
          //  else
          //  {
          //      this.framesSinceParticlesAdded ++;
         //   }

            
          
        }
        

        
        if (this.rowDepthMultiplier === 0)
            this.sps.setParticles()
        else
        {
            if (this.setParticlesRange > 0)
                this.sps.setParticles(0,this.setParticlesRange,false);
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
        
    }

    public addRow(row : DepthFinderRow)
    {
        //console.log("TradeReportPlotter : Add Row");

        if (row != null)
        {
            //console.log(trades);
            let layer : VectorFieldLayer | undefined = row.getLayer(VectorFieldLayerType.OrderBook);

            if (layer)
            {
                let cellCount : number = layer.numCells;
                this.setParticlesRange = cellCount;
                this.currentCellIndex = 0;
        
                if (cellCount > 0)
                {   
                    if (this.meshBase != null)
                    {
                        //this.sps.addShape(this.meshBase,cellCount,{ positionFunction: this.onSetInitialParticlePosition, storage : this.particleStore });
                        this.sps.addShape(this.meshBase,cellCount,{ positionFunction: this.onSetInitialParticlePosition });
    
                        this.particlesAddedToStore = true;
                        //this.sps.buildMesh();
                    }
                        
                    else
                    {
                        console.log("DepthFinderPlotter : Null Mesh");
                    }
                    
                }       
            }
            else
            {
                console.log("DepthFinderPlotter : Null Row");
            }
    
            }
      

       
    }

    public removeRow(row : DepthFinderRow)
    {
        let layer : VectorFieldLayer | undefined = row.getLayer(VectorFieldLayerType.OrderBook);

        if (layer)
        {
            this.numCellsToRemove = layer.cellsByIndex.size;
            this.removeRowRequested = true;
        }

       
        //this.sps.buildMesh();
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle) => 
    {  
        if (particle.idx > 0)
        {
            if (this.presenter.currentGeneration > 1)
            {
                particle.id = particle.idx;
                //console.log('TradeReportPlotter : Getting Row For Particle index : ' + particle.idx);
                let row : DepthFinderRow = this.presenter.getCurrentRow() as DepthFinderRow;
                let layer : VectorFieldLayer | undefined = row.getLayer(VectorFieldLayerType.OrderBook);

                if (layer)
                {
                    //let tradeLayer : VectorFieldLayer = row.getLayer(VectorFieldLayerType.TradeReport);
                    //let orderBookLayer : VectorFieldLayer = row.getLayer(VectorFieldLayerType.OrderBook);
                    //if (orderBookLayer != null)
                // {
                        //let cell : VectorFieldCell =  layer.getCellByIndex(particle.idx-1);
                        let cell : VectorFieldCell =  Array.from(layer.cellsByIndex.values())[this.currentCellIndex++];

                        //let orderBookCell : VectorFieldCell = orderBookLayer.getCellByPrice(tradeCell.price);
    
                        if (cell != null)
                        {
                            (particle as any).cell = cell;
    
                            //let particlePositionX: number = (((row.positionOffsetX + cell.positionOffset.x)* this.cellWidth)  * this.cellWidth - (this.orderBookRig.position.x * this.cellWidth)) ;
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
                            //particlePositionZ = particleRow  * this.cellDepth;
                            
                            particlePositionZ = -(this.presenter.currentGeneration * this.cellDepth) + (this.cellDepth);
                            particlePositionY  += (cell.height * 0.5) * this.cellHeight;
                            particle.scaling.x = this.cellWidth * this.cellMeshScaleFactor;
                            //particlePositionY  = (tradeReportCell.height * 0.5) * this.cellHeight;
                            particle.scaling.y = cell.height * this.cellHeight;

                            if ( Math.abs(this.orderBookRig.position.x + particlePositionX) <= this.columnCount)
                            {
                                particle.isVisible = true;
                                //console.log("Order Book History : Setting Particle Position: " + particlePositionX + "," + particlePositionY + "," + particlePostionZ);
                                particle.position.set(particlePositionX , particlePositionY , particlePositionZ);
                                particle.uvs =  SolidParticleMaterial.getUVSforColor(cell.color);
                            }
                            else
                            {
                                particle.isVisible = false;
                            }

        
                            //particle.isVisible = true;
                            //particle.position.set(particlePositionX, particlePositionY, particlePositionZ );
                            //particle.scale.x = this.cellWidth * this.cellMeshScaleFactor;
                            //particle.scale.y = cell.height * this.cellHeight;

                            //particle.uvs =  SolidParticleMaterial.getUVSforColor(cell.color);
                        }
                        else
                        {
                            particle.isVisible = false;
                            // console.log("DepthFinderPlotter : Couldn't get Cell for: " + particle.idx);
                        }
                    //}
                // else
                // {
                    // console.log("TradeReportPlotter : Couldn't get Trade Layer");
                //  } 
                }  
            }          
        }
        else
        {
            particle.isVisible = false;
        }      
       
    }
    
    protected onUpdateParticle = (particle: bjs.SolidParticle) => 
    {
        /*
        let cell : VectorFieldCell = (particle as any).cell;

        if (cell !== undefined)
        {
            particle.uvs = SolidParticleMaterial.getUVSforColor((particle as any).cell.color);
        }
        */
        /*
        if (particle.idx > 1)
        {
            if (particle.isInFrustum)
            {                     
                if ( Math.abs(this.orderBookRig.position.x + particle.position.x) <= this.columnCount)
                {
                    particle.isVisible = true;
                }
                else
                {
                    particle.isVisible = false;
                }

                if (particle.position.z > this.cellDepth * this.rowCount)
                {
                    particle.isVisible = false;
                }

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
        */

       //particle.isVisible = false;
        
///////
/*
        if ( (particle.idx > 0) && particle.idx <= this.currentCellIndex)
        {
            if ( (this.presenter.isReady) && (this.presenter.currentGeneration > 0))
            {
                //let currentColumn: number = particle.idx % this.columnCount;
    
               // let presenterRow : DepthFinderRow = this.presenter.getRow(0) as DepthFinderRow;
    
              //  if (presenterRow != null)
               // {
                    //let orderBookCell : VectorFieldCell = presenterRow.getCellFromLayerByIndex(VectorFieldLayerType.TradeReport,presenterRow.startingIndex + currentColumn); 
    
                    //if (orderBookCell !== null)
                   // {
                        let particlePositionZ: number = null;         
                        particle.scaling.z = this.rowDepthMultiplier * this.cellDepth * this.cellMeshScaleFactor;
                        particlePositionZ =  ((this.cellDepth/2) * this.cellMeshScaleFactor) - (this.rowDepthMultiplier * ((this.cellDepth/2)* this.cellMeshScaleFactor));
                    
                        if ( Math.abs(this.orderBookRig.position.x + particle.position.x) <= this.columnCount)
                        {
                            //console.log("Order Book History : Setting Particle Position: " + particlePositionX + "," + particlePositionY + "," + particlePostionZ);
                            particle.position.set(particle.position.x , particle.position.y , particlePositionZ);
                        }
                        else
                        {
                            particle.isVisible = false;
                        }
                   // }
                    
              //  }
            }
        }
        */

       
        
    return particle;
   }
}
