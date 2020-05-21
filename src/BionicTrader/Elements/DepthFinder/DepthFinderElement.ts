import * as bjs from 'babylonjs';
import 'babylonjs-loaders';
import { MarketMaker } from '../../../Market/MarketMaker';
import { AssetManager } from '../../../SceneGraph/AssetManager';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { Scene } from '../../../SceneGraph/Scene';
import { SceneElement } from '../../../SceneGraph/SceneElement';
import { SceneManager } from '../../../SceneGraph/SceneManager';
import Logger from '../../../Utils/Logger';
import { Thermograph } from '../Thermograph';
import { DepthFinderLayerPlotter } from './DepthFinderLayerPlotter';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { DepthFinderRow } from './DepthFinderRow';
import { GridFloor } from './GridFloor';
import { OrderBookFloorVectorField } from './OrderBookFloorVectorField';
import { OrderBookPlotter } from './OrderBookPlotter';
import { OrderBookVectorField } from './OrderBookVectorField';
import { OrderEntryRig } from './OrderEntryRig';
import { OrderBookHistogram } from './OrderBookHistogram';
import { OrderBookHistogramNew } from './OrderBookHistogramNew';

export class DepthFinderElement extends SceneElement
{
    public orderBookRig : bjs.TransformNode | undefined;
    public histogramRig : bjs.TransformNode | undefined;
    public histogram : OrderBookHistogramNew | undefined;
    public orderBookFloor : OrderBookFloorVectorField | undefined;
    public orderBook : OrderBookVectorField | undefined;
    public orderBook2 : OrderBookVectorField | undefined;

    public tradeReportRig : bjs.TransformNode | undefined;
    public tradeReportPlotter : DepthFinderLayerPlotter | undefined;
    public orderBookPlotter : OrderBookPlotter | undefined;
    public userActivityPlotter : DepthFinderLayerPlotter | undefined;
    
    public orderEntryRig : OrderEntryRig | undefined;
    public gridFloor: GridFloor | undefined;
    public thermograph : Thermograph | undefined;
    private thermographSegmentsPerSide : number = 10;
    public rowDepthMultiplier : number = 0;
    private simpleCube : bjs.Mesh | undefined;
   // private simpleCube : bjs.Mesh | undefined;
   // private simpleCube : bjs.Mesh | undefined;

    private labelLerpSpeed : number = 0.05;

    private histogramHeightLevels : number  = 10;

    constructor(public name:string,
                public x: number,
                public y: number,
                public z: number,
                public scene : Scene<bjs.Camera>,
                public rowCount : number,
                public columnCount : number,
                public cellWidth : number,
                public cellHeight : number,
                public cellDepth : number,
                public presenter : DepthFinderPresenter,
                public marketMaker : MarketMaker)
    {
        super(name,x,y,z,scene);

        Logger.log('OrderBookVisualizer :  constructor()');
        Logger.log('OrderBookVisualizer :  creating OrderBookVisualizer with ' + this.rowCount + ' rows, and ' + this.columnCount + ' columns.');
        Logger.log('OrderBookVisualizer :  constructor() - calling this.create()');
        this.create();      
    } 

    public create()
    {
        Logger.log('OrderBookVisualizer : create()');
       
        this.orderBookRig = new bjs.TransformNode("Order Book Rig",this.scene.bjsScene);
        this.orderBookRig.parent = this;
        this.tradeReportRig = new bjs.TransformNode("Trade Report Rig",this.scene.bjsScene);
        this.tradeReportRig.parent = this;
        this.histogramRig  = new bjs.TransformNode("Histogram Rig",this.scene.bjsScene);
        this.histogramRig.parent = this;

        this.orderBookFloor = new OrderBookFloorVectorField("Order Book Floor Vector Field",
        0,
        0,
        0,
        this.scene,
        bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.scene.bjsScene),
        this.rowCount,
        4,
        1,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0.8,
        this.presenter,
        this.orderBookRig);

        this.addChild(this.orderBookFloor);
        this.orderBookFloor.parent = this.tradeReportRig;

        this.simpleCube = AssetManager.Instance.getMeshClone("simplecube");
       

        if (this.simpleCube)
        {
            /*
            this.histogram = new OrderBookHistogramNew("Order Book Histogram",
            0,
            0,
            0.25,  
            this.scene,
            20,
            this.histogramHeightLevels,
            this.cellWidth,
            this.cellHeight,
            this.cellDepth,
            0.95,
            this.presenter);

            this.addChild(this.histogram);
            //this.histogram.parent = this.histogramRig;
            */
                      
            this.orderBook = new OrderBookVectorField("Order Book Vector Field",
            0,
            0,
            0,
            this.scene,
            this.simpleCube,
            this.rowCount,
            this.columnCount,
            1,
            this.cellWidth,
            this.cellHeight,
            this.cellDepth,
            0.95,
            this.presenter,
            this.orderBookRig);

            this.addChild(this.orderBook);
            this.orderBook.parent = this.orderBookRig;        
        }
        
        this.tradeReportPlotter = new DepthFinderLayerPlotter("Trade Report Plotter",
        0,
        0,
        -2,
        this.scene,
        bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.scene.bjsScene),
        this.rowCount/2,
        this.columnCount,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0.95,
        this.presenter,
        this.orderBookRig,
        VectorFieldLayerType.TradeReport);

        this.addChild(this.tradeReportPlotter);
        this.tradeReportPlotter.parent = this.tradeReportRig;
        
        this.userActivityPlotter = new DepthFinderLayerPlotter("User Activity Plotter",
        0,
        0,
        -2,
        this.scene,
        bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.scene.bjsScene),
        this.rowCount/2,
        this.columnCount,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0.95,
        this.presenter,
        this.orderBookRig,
        VectorFieldLayerType.UserActivity);

        this.addChild(this.userActivityPlotter);
        this.userActivityPlotter.parent = this.tradeReportRig;
        
        this.presenter.onAddedNewRow.subscribe(() => {
            this.rowDepthMultiplier = 0;

            if (this.orderBook)
            {
                this.orderBook.rowDepthMultiplier = 0;
            }

            if (this.orderBook2)
            {
                this.orderBook2.rowDepthMultiplier = 0;
            }

            if (this.orderBookFloor)
            {
                this.orderBookFloor.rowDepthMultiplier = 0;
            }

            if (this.tradeReportPlotter)
            {
                this.tradeReportPlotter.position.z += this.cellDepth;
                this.tradeReportPlotter.rowDepthMultiplier = 0;
            }

            if (this.userActivityPlotter)
            {
                this.userActivityPlotter.position.z += this.cellDepth;
                this.userActivityPlotter.rowDepthMultiplier = 0;
            }

            if (this.orderBookPlotter)
            {
                this.orderBookPlotter.position.z += this.cellDepth;
                this.orderBookPlotter.rowDepthMultiplier = 0;
            }
            
            if (this.orderBookRig)
                this.orderBookRig.position.z = 0;

            if (this.tradeReportRig)
                this.tradeReportRig.position.z = 0;
        });

        this.gridFloor = new GridFloor("Grid Floor",
        0,
        -0.1,
        0,
        this.scene,
        this.presenter,
        this.rowCount,
        this.columnCount,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        this.orderBookRig);

        this.addChild(this.gridFloor);

        this.thermograph = new Thermograph("Thermograph",
        0,
        -.125, 
        -0.125,
        this.scene,
        bjs.MeshBuilder.CreateBox("box", { height: 0.25, width: 1, depth: 0.5 }, this.scene.bjsScene),
        this.thermographSegmentsPerSide,
        this.presenter.updateInteval,
        5,
        this.presenter);

        this.thermograph.scaling.x = 2;
        this.addChild(this.thermograph);

        this.orderEntryRig = new OrderEntryRig("Order Entry Rig",0,-1.77,-0.18,this.scene,this.presenter,this.cellWidth,this.orderBookRig,this.marketMaker);
        this.addChild(this.orderEntryRig);
        super.create();
    }

    protected onPreRender()
    {
        if (this.presenter.isReady)
        {
            let currentRow: DepthFinderRow = this.presenter.rows[0] as DepthFinderRow;
            let animationStep: number = 0.001 * SceneManager.Instance.engine.getDeltaTime() * (1000/this.presenter.updateInteval);
            this.rowDepthMultiplier += animationStep;// * this.cellDepth;

            if (this.orderBookRig)
            {           
                this.orderBookRig.position.x = bjs.Scalar.Lerp(this.orderBookRig.position.x, -currentRow.positionOffsetX * this.cellWidth, 0.01); 
                this.orderBookRig.position.z += animationStep * this.cellDepth;
                
                if (this.gridFloor)
                {
                    this.gridFloor.gridOffsetX = - (this.presenter.gridOriginOffsetX * this.cellWidth) + this.orderBookRig.position.x;
                    this.gridFloor.gridOffsetZ += (animationStep * this.cellDepth);// * 0.33333;    
                }
    
                if (this.thermograph)
                {
                    this.thermograph.position.x =
                    bjs.Scalar.Lerp(this.thermograph.position.x,
                        (currentRow.positionOffsetX * this.cellWidth) +
                        this.orderBookRig.position.x,
                        this.labelLerpSpeed );
                }
            }

            if (this.tradeReportRig)
            {
                this.tradeReportRig.position.x = bjs.Scalar.Lerp(this.tradeReportRig.position.x, -currentRow.positionOffsetX * this.cellWidth, 0.01);
                this.tradeReportRig.position.z += animationStep * this.cellDepth;
            }

            if (this.histogramRig)
            {
                this.histogramRig.position.x = bjs.Scalar.Lerp(this.histogramRig.position.x, -currentRow.positionOffsetX * this.cellWidth, 0.01);
            }
                
            if (this.orderBook)
                this.orderBook.rowDepthMultiplier = this.rowDepthMultiplier;

            if (this.orderBook2)
                this.orderBook2.rowDepthMultiplier = this.rowDepthMultiplier;
            
            if (this.orderBookFloor)
                this.orderBookFloor.rowDepthMultiplier = this.rowDepthMultiplier;
                
            if (this.tradeReportPlotter)
            {
                this.tradeReportPlotter.rowDepthMultiplier = this.rowDepthMultiplier;
            }

            if (this.userActivityPlotter)
            {
                this.userActivityPlotter.rowDepthMultiplier = this.rowDepthMultiplier;
            }

            if (this.orderBookPlotter)
            {
                this.orderBookPlotter.rowDepthMultiplier = this.rowDepthMultiplier;
            }  
        }
    }
}


