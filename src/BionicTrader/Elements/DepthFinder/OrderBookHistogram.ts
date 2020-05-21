import * as bjs from 'babylonjs';
import { Scene } from "../../../SceneGraph/Scene";
import { GLSGColor } from "../../../Enums";
import { pngTwentyColorPalette } from "../../../../global/Assets";
import Logger from '../../../Utils/Logger';
import { VectorField } from '../../../SceneGraph/VectorField';
import { SolidParticleMaterial } from '../../../SceneGraph/SolidParticleMaterial';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { DepthFinderRow } from './DepthFinderRow';
import { VectorFieldLayer } from '../../../SceneGraph/VectorFieldLayer';
import { BaseTexture } from 'babylonjs';

export class OrderBookHistogram extends VectorField
{
    public isResetting : boolean;
    public rowDepthMultiplier : number = 0;
    //public maxCellHeight: number = 20;

    firstDraw : boolean = true;
    buildMeshNextFrame : boolean = false;
    settingParticles : boolean = false;
    setParticlesDuration : number = 6;
    setParticlesCountPerFrame : number = 0;
    framesSinceSettingParticles : number = 0;

    private particleAlphaFalloff = 0.075;

    //spsHolder : bjs.TransformNode = new bjs.TransformNode("Sps Holder",this.scene.bjsScene);

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public mesh: bjs.Mesh,
        public columnCount:number,
        public heightLevels: number,
        public layerCount: number,
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
            columnCount, 
            heightLevels,
            layerCount,
            cellWidth,
            cellHeight,
            cellDepth,
            cellMeshScaleFactor,
            presenter
        );
        Logger.log('OrderBookHistogramValueField :  constructor()');
        // console.log('OrderBookHistogramValueField :  creating OrderBookHistogramValueField with ' + rowCount + ' rows, and ' + columnCount + ' columns.');
        Logger.log('OrderBookHistogramValueField :  constructor() - calling this.create()');

        this.create();
    }

    async onCreate()
    {
        // console.log('OrderBookHistogramValueField : create()');
        super.onCreate();

        this.mesh.material = this.material;

        this.material.albedoColor = bjs.Color3.White();
        var texture = new bjs.Texture(pngTwentyColorPalette, this.scene.bjsScene);
        this.material.albedoTexture = texture;
        this.material.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<BaseTexture>;
        this.material.roughness = 0.05;
        this.material.metallic = 0.65;
        this.material.freeze();
    
        this.mesh.doNotSyncBoundingInfo = true;

        //this.sps.computeParticleTexture = false; 
        this.sps.computeParticleColor = true; 
        this.sps.mesh.hasVertexAlpha = true;

        if (this.sps.mesh.material)
        {
            //this.sps.mesh.material.forceDepthWrite = true;
            //this.sps.mesh.material.needDepthPrePass = true;
        }

           // this.sps.mesh.material.sideOrientation = bjs.Mesh.FRONTSIDE;

        //this.spsHolder.parent = this;
        this.setParticlesCountPerFrame  = Math.floor(this.sps.nbParticles / this.setParticlesDuration);
    }

    public reset()
    {
        this.isResetting = true;
    }

    protected onPreRender()
    {
        
        if (this.firstDraw)
        {
            this.sps.setParticles();
            this.firstDraw = false;
        }
        else
        {
            this.sps.setParticles();
            /*
            if (this.rowDepthMultiplier === 0)
            {
                
                this.settingParticles = true;
                this.sps.setParticles(0,this.setParticlesCountPerFrame-1,false);
                this.framesSinceSettingParticles = 1;
                //this.orderBookRig.position.z += this.cellDepth;
                //this.position.set(this.orderBookRig.position.x,this.orderBookRig.position.y,this.orderBookRig.position.z + this.cellDepth);
            }
            else
            {
                if (this.settingParticles)
                {
                    this.sps.setParticles(0,this.columnCount,false);
                    let startIndex : number = this.framesSinceSettingParticles * this.setParticlesCountPerFrame;
                    let endIndex : number = startIndex + this.setParticlesCountPerFrame;

                    if (endIndex >= this.sps.nbParticles)
                    {
                        endIndex = this.sps.nbParticles;
                        this.sps.setParticles(startIndex,endIndex);
                        this.settingParticles = false;
                        this.orderBookRig.position.z -= this.cellDepth;
                    }
                    else
                    {
                        //this.orderBookRig.position.z += this.cellDepth;
                        this.sps.setParticles(startIndex,endIndex,false);
                        this.framesSinceSettingParticles ++ ;
                    }                                  
                }
                else
                {
                    this.sps.setParticles(0,this.columnCount,true);
                }
            }
            */
        } 
    }

    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle) => 
    {   
        particle.isVisible = false;

        let particleColumn: number = particle.idx % this.columnCount;

        if (particleColumn < this.columnCount/2)
        {
             particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.SkyBlue);
        }
        else
        {
            particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.HotPink);
        }
    }

     protected onUpdateParticle = (particle: bjs.SolidParticle) => 
     {
         //let particleAsAny = (particle as any);
        //particle.isVisible = false;
        
        if ( (this.presenter.isReady) && (this.presenter.currentGeneration > 0))
        {
            let currentColumn: number =  Math.floor(particle.idx / this.columnCount);
            let currentHeightLevel: number = particle.idx % this.heightLevels;
            let presenterRow : DepthFinderRow = this.presenter.getCurrentRow() as DepthFinderRow;
            let presenterLayer : VectorFieldLayer | undefined = presenterRow.getLayer(VectorFieldLayerType.OrderBook);

            if (presenterLayer)
            {
                let orderBookCell : VectorFieldCell =  Array.from(presenterLayer.cellsByIndex.values())[currentColumn];
                //let orderBookCell : VectorFieldCell | undefined = presenterLayer.getCellByIndex(presenterLayer.startingIndex + currentColumn); 

                if (orderBookCell)
                {
                    if (orderBookCell.height >= currentHeightLevel)
                    {
                       

                        let particlePositionX: number = ((presenterRow.positionOffsetX + orderBookCell.positionOffset.x) * this.cellWidth) + this.cellWidth/2;
                        let particlePositionY: number = 0;
                        let particlePositionZ: number = 0;
                    
                        if (orderBookCell.color === GLSGColor.SkyBlue)
                        {
                            particlePositionX -= (this.cellWidth);
                        }
                        else
                        {
                            particlePositionX += (this.cellWidth);
                        }                                 

                        particle.scaling.x = this.cellWidth;
                        

                        if (currentHeightLevel === 0)
                        {
                            particlePositionY  = (currentHeightLevel * this.cellHeight) + (this.cellHeight/2);

                            if (orderBookCell.height < 1)
                            {
                                particle.scaling.y = orderBookCell.height * this.cellHeight;
                            }
                            else
                            {
                                particle.scaling.y = this.cellHeight;
                                
                            }
                        }
                        else
                        {
                            if (orderBookCell.height < currentHeightLevel + 1)
                            {
                                let heightRemainder : number = orderBookCell.height - currentHeightLevel;
                                particle.scaling.y = heightRemainder * this.cellHeight;
                                particlePositionY  = (currentHeightLevel * this.cellHeight) + (heightRemainder * this.cellHeight/2);
                                //particle.scaling.y = this.cellHeight;

                            }
                            else
                            {
                                particlePositionY  = (currentHeightLevel * this.cellHeight) + (this.cellHeight/2);
                                particle.scaling.y = this.cellHeight;
                            }
                                
                        }
                        
                       
                       // let proposedPosition : bjs.Vector3 = new bjs.Vector3(particlePositionX,particlePositionY,particlePositionZ);
                        //console.log("Order Book History : Setting Particle Position: " + particlePositionX + "," + particlePositionY + "," + particlePostionZ);
                        particle.position.set(particlePositionX , particlePositionY , particlePositionZ);
                        particle.uvs =  SolidParticleMaterial.getUVSforColor(orderBookCell.color);

                        particle.isVisible = true;

                        if (particle.color)
                            particle.color.a = 1;                     
                    }
                    else
                    {
                        particle.isVisible = true;
                        if (particle.color)
                            particle.color.a -= this.particleAlphaFalloff;
                    }
                            
                        
                    }
                    else
                    {
                        particle.isVisible = true;
                        if (particle.color)
                            particle.color.a  -= this.particleAlphaFalloff;
                    }
                }
                else
                {
                    particle.isVisible = true;
                    if (particle.color)
                        particle.color.a  -= this.particleAlphaFalloff;
                }
            }
            else
            {            
                particle.isVisible = true;
                if (particle.color)
                    particle.color.a  -= this.particleAlphaFalloff;
            }
         return particle;
     }
}
