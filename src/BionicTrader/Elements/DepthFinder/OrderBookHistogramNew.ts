import * as bjs from 'babylonjs';
import { BaseTexture } from 'babylonjs';
import { pngTwentyColorPalette } from "../../../../global/Assets";
import { GLSGColor, MarketSide } from '../../../Enums';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { Scene } from "../../../SceneGraph/Scene";
import { SceneElement } from '../../../SceneGraph/SceneElement';
import { SolidParticleMaterial } from '../../../SceneGraph/SolidParticleMaterial';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { VectorFieldLayer } from '../../../SceneGraph/VectorFieldLayer';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { DepthFinderRow } from './DepthFinderRow';
import { AssetManager } from '../../../SceneGraph/AssetManager';

/**
 * HistogramBar has a collection of Block Mesh Instances.
 *
 * @export
 * @class HistogramBar
 * @extends {SceneElement}
 */
export class HistogramBar extends SceneElement
{

    private blocks : Array<bjs.InstancedMesh> = new Array<bjs.InstancedMesh>();
    private falloffRate : number = 0.1;

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public mesh: bjs.Mesh,
        public blocksPerBar:number,
        public blockWidth: number,
        public blockHeight: number,
        public blockDepth: number,
        public side : MarketSide = MarketSide.Bid)
        {
            super(name,x,y,z,scene);
            this.buildBar();
        }
    
    private buildBar() : void
    {
        for(let i: number = 0; i < this.blocksPerBar; i++)
        {
            let block :  bjs.InstancedMesh = this.mesh.createInstance("Block" + i);
            block.parent = this;
            block.setEnabled(true);
            //block.scaling = new bjs.Vector3(this.blockWidth, this.blockHeight, this.blockDepth);
            let blockPositionY = (this.blockHeight * i) + (this.blockHeight * 0.5);
            block.position.set(0,blockPositionY,0);
            this.blocks.push(block);
        }
    }
}

/**
 *
 *
 * @export
 * @class OrderBookHistogramNew
 * @extends {SceneElement}
 */
export class OrderBookHistogramNew extends SceneElement
{
    public isResetting : boolean;
    public rowDepthMultiplier : number = 0;

    firstDraw : boolean = true;
    buildMeshNextFrame : boolean = false;
    settingParticles : boolean = false;
    setParticlesDuration : number = 6;
    setParticlesCountPerFrame : number = 0;
    framesSinceSettingParticles : number = 0;

    private particleAlphaFalloff = 0.075;

    private material : SolidParticleMaterial;
    private bidMaterial : bjs.PBRMaterial;
    private askMaterial : bjs.PBRMaterial;

    private bidBlock : bjs.Mesh | undefined;
    private askBlock : bjs.Mesh | undefined;

    private bars : Array<HistogramBar> = new Array<HistogramBar>();

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public barCount:number,
        public blocksPerBar : number,
        public cellWidth: number,
        public cellHeight: number,
        public cellDepth: number,
        public cellMeshScaleFactor: number,
        public presenter : DepthFinderPresenter)
    {
        super(
            name,
            x,
            y,
            z,
            scene
        );
        this.create();
    }

    async create()
    {
        super.create();

        /*
        this.material = new SolidParticleMaterial("Histogram Material", this.scene);
        this.material.albedoColor = bjs.Color3.White();
        var texture = new bjs.Texture(pngTwentyColorPalette, this.scene.bjsScene);
        this.material.albedoTexture = texture;
        this.material.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<BaseTexture>;
        this.material.roughness = 0.05;
        this.material.metallic = 0.65;
        this.mesh.material = this.material;
        */

        this.bidMaterial = new bjs.PBRMaterial("Bid Material", this.scene.bjsScene);
        this.bidMaterial.albedoColor = bjs.Color3.FromInts(0,101,255);
        this.bidMaterial.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<BaseTexture>;
        this.bidMaterial.roughness = 0.05;
        this.bidMaterial.metallic = 0.65;

        this.askMaterial = new bjs.PBRMaterial("Bid Material", this.scene.bjsScene);
        this.askMaterial.albedoColor = bjs.Color3.FromInts(255,1,152);
        this.askMaterial.reflectionTexture = this.scene.hdrTexture as bjs.Nullable<BaseTexture>;
        this.askMaterial.roughness = 0.05;
        this.askMaterial.metallic = 0.65;

        this.bidBlock = AssetManager.Instance.getMesh("bidblock");

        if (this.bidBlock)
        {
            this.bidBlock.rotation.x = 0;
            this.bidBlock.material = this.bidMaterial;
        }
      
        this.askBlock = AssetManager.Instance.getMesh("askblock");

        if (this.askBlock)
        {
            this.askBlock.rotation.x = 0;
            this.askBlock.material = this.bidMaterial;    
        }

        this.buildHistogram();
    }

    public reset()
    {
        this.isResetting = true;
    }

    /**
     * Build Histogram by creating [barCount] HistogramBars
     * Position the bars so they stretch across the entire order book
     * @private
     * @memberof OrderBookHistogramNew
     */
    private buildHistogram() : void
    {
        let startingPositionX : number = -((this.barCount / 2) * this.cellWidth);

        for (let i: number = 0; i < this.barCount; i++)
        {   
            
            let barPositionX : number = startingPositionX + (i * this.cellWidth);
            let blockMesh : bjs.Mesh | undefined;

            if (i < this.barCount/2)
            {
                blockMesh = this.bidBlock;

            }
            else
            {
                blockMesh = this.askBlock;
            }

            if (blockMesh)
            {
                let bar : HistogramBar =
                new HistogramBar("Bar " + i,
                                    0,
                                    0,
                                    0,
                                    this.scene,
                                    blockMesh,
                                    this.blocksPerBar,
                                    this.cellWidth,
                                    this.cellHeight,
                                    this.cellDepth);
                bar.parent = this;
                bar.position.set(barPositionX,0,0);                                      
                this.bars.push(bar);

            }
            else
            {
                throw("bummer");
            }

        }

    }

    protected onPreRender()
    {
        for (let i: number = 0; i < this.barCount; i++)
        {

        }
        
      
    }
}
