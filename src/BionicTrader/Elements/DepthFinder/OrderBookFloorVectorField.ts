import * as bjs from 'babylonjs';
import { Scene } from "../../../SceneGraph/Scene";
import { MarketSide, GLSGColor } from "../../../Enums";
import { IVectorFieldUpdateStrategy, IOrderBookEntry } from '../../BionicTraderInterfaces';
import Logger from '../../../Utils/Logger';
import { VectorField } from '../../../SceneGraph/VectorField';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';
import { SolidParticleMaterial } from '../../../SceneGraph/SolidParticleMaterial';
import { MarketDataSample } from '../../../Market/MarketDataSample';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { VectorFieldRow } from '../../../SceneGraph/VectorFieldRow';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { DepthFinderRow } from './DepthFinderRow';

export class OrderBookFloorVectorField extends VectorField
{
    public isResetting : boolean;
    public rowDepthMultiplier : number = 0;
    private floorWidth: number = 100;

    constructor(
        name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public mesh: bjs.Mesh,
        public rowCount:number,
        public columnCount: number,
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
            rowCount, 
            columnCount,
            layerCount,
            cellWidth,
            cellHeight,
            cellDepth,
            cellMeshScaleFactor,
            presenter
        );
        Logger.log('OrderBookHistoryFloorVectorField :  constructor()');
        // console.log('OrderBookHistoryFloorVectorField :  creating OrderBookHistoryFloorVectorField with ' + rowCount + ' rows, and ' + columnCount + ' columns.');
        Logger.log('OrderBookHistoryFloorVectorField :  constructor() - calling this.create()');

        this.create();
    }

    async create()
    {
        // console.log('OrderBookHistoryFloorVectorField : create()');
        super.create();

        //this.material.albedoColor = bjs.Color3.White();
        //var texture = new bjs.Texture(pngBluePurpleSquare,this.scene.bjsScene);
        //this.material.albedoTexture = texture;
        this.material.roughness = 0.2;//.75;
        this.material.metallic = 0.1;
        this.material.alpha = 0.3
        this.material.freeze();
    }

    public reset()
    {
        this.isResetting = true;
    }

    protected onPreRender()
    {
        this.sps.setParticles();
    }


    protected onSetInitialParticlePosition = (particle: bjs.SolidParticle, i: number) => 
    {   
        particle.isVisible = false;   
     }

    protected onUpdateParticle = (particle: bjs.SolidParticle) => 
    {
        particle.scaling.y = 0.01;

        if (this.presenter.isReady)
        {
            let cellColumnIndex : number =  particle.idx % this.columnCount;
            let cellRowIndex : number = Math.floor(particle.idx / 2 / 2); 

            if (cellColumnIndex < 2) //Draw the bid and ask floor
            {
                //console.log("Order Book History : updating particle");
                let cellRow : DepthFinderRow = this.presenter.rows[cellRowIndex] as DepthFinderRow;
                let side : MarketSide = MarketSide.Bid;
                let cellOffsetX: number = 0;
                let cellPositionX: number = 0;
            
                if (cellColumnIndex === 0)
                {
                    side = MarketSide.Bid;
                    particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.SkyBlue);
                }
                else if (cellColumnIndex === 1)
                {
                    side = MarketSide.Ask;
                    particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.HotPink);
                }

                if (cellRow)
                {
                    particle.isVisible = true;

                    let cellOffsetX : number = 0

                    if (side === MarketSide.Bid)
                    {
                        cellOffsetX = ((cellRow.positionOffsetX + Math.min(cellRow.insideBidOffsetX, 0)) * this.cellWidth);// ;
                        const cellFloorLength = this.floorWidth / 2 + cellOffsetX - (this.presenter.gridOriginOffsetX * this.cellWidth) + this.orderBookRig.position.x;
                        cellPositionX = cellOffsetX - cellFloorLength / 2;
                        // particle.scaling.x = cellFloorLength - this.cellWidth;// + (cellRow.insideBidOffsetX * this.cellWidth);
                        // cellPositionX = cellOffsetX - this.floorWidth / 2;
                        particle.scaling.x = cellFloorLength;// + (cellRow.insideBidOffsetX * this.cellWidth);
                    }
                    else
                    {
                        cellOffsetX = ((cellRow.positionOffsetX + Math.max(cellRow.insideAskOffsetX, 0)) * this.cellWidth);
                        const cellFloorLength = this.floorWidth / 2 - cellOffsetX + (this.presenter.gridOriginOffsetX * this.cellWidth) - this.orderBookRig.position.x;
                        cellPositionX = cellOffsetX + cellFloorLength / 2;
                        // particle.scaling.x = cellFloorLength - this.cellWidth;
                        // cellPositionX = cellOffsetX + this.floorWidth / 2;
                        particle.scaling.x = cellFloorLength;// + (cellRow.insideBidOffsetX * this.cellWidth);
                    }

                    let cellPositionZ : number = 0
                    // particle.scaling.z = this.cellDepth;

                    if (cellRowIndex === 0) //smooth motion 
                    {
                        //particle.isVisible = false;
                        //particle.isVisible = true;
                        //this.vectorField.scene.rowDepthMultiplier = bjs.Scalar.Lerp( this.vectorField.scene.rowDepthMultiplier, 1.0,0.01);
                        particle.scaling.z = this.rowDepthMultiplier * this.cellDepth;
                        //particle.scaling.y = cellQuantity * this.vectorField.scene.rowDepthMultiplier;
                        cellPositionZ = - this.rowDepthMultiplier * this.cellDepth / 2;
    
                        //particlePostionZ -= 1;
                    }
                    else
                    {
                        cellPositionZ = cellRowIndex  * this.cellDepth - this.cellDepth / 2;
                        particle.scaling.z = this.cellDepth;
                    }
                    particle.position.set(cellPositionX, -0.1, cellPositionZ);       
                }
                else
                {
                    particle.isVisible = false;
                    //console.log("Order Book History : didn't get a row");
                }
            }
            else if (cellColumnIndex === 2)
            {
                particle.isVisible = true;
                let cellRow : DepthFinderRow = this.presenter.rows[cellRowIndex] as DepthFinderRow;

                if (cellRow)
                {
                    // Calculation for postion of X for bid and asks
                    const cellOffsetAskX = ((cellRow.positionOffsetX + Math.max(cellRow.insideAskOffsetX, 0)) * this.cellWidth);

                    // let cellPositionX = cellRow.positionOffsetX * this.cellWidth;

                    // if (cellColumnIndex < this.columnCount)
                    // {
                    //     cellPositionX -= (this.cellWidth/2);
                    // }
                    // else
                    // {
                    //     cellPositionX += (this.cellWidth/2);
                    // }
            
                    let cellScaleX = Math.abs(Math.max(cellRow.insideAskOffsetX, 0) - Math.min(cellRow.insideBidOffsetX, 0)) * this.cellWidth;// + this.cellWidth;

                    // New implementatiopn for position and scale of floor
                    // let cellScaleX = Math.abs(cellPositionAskX - cellPositionBidX);// + this.cellWidth;
                    let cellPositionX = cellOffsetAskX - cellScaleX / 2;
                    particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.Teal);
                    
                    let cellPositionZ : number = 0
                    // particle.scaling.z = this.cellDepth;

                    if (cellRowIndex === 0) //smooth motion 
                    {
                        particle.scaling.z = this.rowDepthMultiplier * this.cellDepth;
                        cellPositionZ = - this.rowDepthMultiplier * this.cellDepth / 2;
                    }
                    else
                    {
                        cellPositionZ = cellRowIndex * this.cellDepth - this.cellDepth / 2;
                        particle.scaling.z = this.cellDepth;
                    }

                    particle.scaling.x = cellScaleX;
                    particle.position.set(cellPositionX, -0.1, cellPositionZ);
                    // particle.isVisible = false;
                }
                else {
                    particle.isVisible = false;
                }
            }
            else
            {
                particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.SeaBlue);

                particle.scaling.x = 0;
                particle.scaling.y = 0;
                particle.scaling.z = 0;
                particle.isVisible = false;
            }  
        }
 

        return particle;



        /*
        const currentRow: number = Math.floor(particle.idx / this.columnCount / 2);

        if (currentRow === 0)
        {
        }
        
        if ((currentRow <= this.presenter.currentGeneration) && (currentRow <= this.rowCount))
        {
            const currentColumn: number = particle.idx % this.columnCount;
            //console.log("FloorUpdate : Row " + currentRow + " Column " + currentColumn ); 
            let side : MarketSide = null;

            if (currentColumn === 0)
            {
                side = MarketSide.Bid;
            }
            else
            {
                side = MarketSide.Ask;
            }

            let cellOffset: number = 0;
            let cellPositionX: number = 0;
    
            if (this.presenter.isLoaded)
            {                            
                let marketDataSampleForThisRow: MarketDataSample = null;
                marketDataSampleForThisRow = this.presenter.get(currentRow);

                if (marketDataSampleForThisRow != null)
                {
                    particle.isVisible = true;
                    let currentRowOffset: number = marketDataSampleForThisRow.offset;
                    cellOffset = currentRowOffset * this.cellWidth * 1 / this.presenter.priceQuantizeDivision;
                    
                    //let midPrice : number = marketDataSampleForThisRow.midPrice;
                    if (side === MarketSide.Bid)
                    {
                        let insideBidPrice: number = marketDataSampleForThisRow.insideBid ? marketDataSampleForThisRow.insideBid.price : 0;
                        let bidDistanceFromMidPrice: number = (marketDataSampleForThisRow.midPrice || 0) - insideBidPrice;
                        cellOffset -= bidDistanceFromMidPrice * this.cellWidth * 1 / this.presenter.priceQuantizeDivision;
                        cellPositionX = cellOffset - this.floorWidth / 2;
                    }
                    else
                    {
                        let insideAskPrice: number = marketDataSampleForThisRow.insideAsk ? marketDataSampleForThisRow.insideAsk.price : 0;
                        let askDistanceFromMidPrice: number = insideAskPrice - (marketDataSampleForThisRow.midPrice || 0);
                        cellOffset += askDistanceFromMidPrice * this.cellWidth * 1 / this.presenter.priceQuantizeDivision;
    
                        cellPositionX = cellOffset + this.floorWidth / 2;
                    }
    
                    let particlePostionZ: number  = 0;

                    if (currentRow === 0) //smooth motion 
                    {
                        //particle.isVisible = false;
                        //particle.isVisible = true;
                        //this.scene.rowDepthMultiplier = bjs.Scalar.Lerp( this.scene.rowDepthMultiplier, 1.0,0.01);
                      
                        //particle.scaling.y = cellQuantity * this.scene.rowDepthMultiplier;

                        particle.scaling.z = this.rowDepthMultiplier  * this.cellMeshScaleFactor;
                        particlePostionZ = (((this.cellDepth) * 0.5) - (this.rowDepthMultiplier * 0.5));
                        //particlePostionZ = currentRow * this.cellDepth;
                        //particle.scaling.z = this.cellDepth;
                        //particlePostionZ -= 1;
                    }
                    else
                    {
                        particlePostionZ = currentRow * this.cellDepth;
                        particle.scaling.z = this.cellDepth;
                    }

                    particle.scaling.x = this.floorWidth;
                    particle.scaling.y = 0.01
                    
                    //Logger.log('LiveOrderBookUpdateStrategy :  Setting Cell Position: ' + cellPositionX, particle.scaling.y * 0.5,currentRow * this.valueField.cellDepth); 
                    particle.position.set(cellPositionX, 0 ,particlePostionZ);//cellOffset * this.priceOffsetMultiplier,
                    //particle.position.set(0,0,0);//cellOffset * this.priceOffsetMultiplier,
                }
                else
                {
                    particle.isVisible = false;
                }
            }
            else
            {
                Logger.log("OrderBookHistoryFloorVectorField : Sampler Not Loaded");
                //particle.isVisible = false;
            }
        }
        else
        {
            //particle.isVisible = false;
            // console.log('drawing is not showing');
        }
        */
        return particle;
        
    }
}
