import * as bjs from 'babylonjs';
import 'babylonjs-loaders';
import { SceneElement } from '../../../SceneGraph/SceneElement';
import { Scene } from '../../../SceneGraph/Scene';
import { DepthFinderPresenter } from './DepthFinderPresenter';
import { DepthFinderRow } from './DepthFinderRow';
import {AssetManager} from '../../../SceneGraph/AssetManager';
import * as currency from 'currency.js';
import { MarketMaker, MarketMakerEvent } from '../../../Market/MarketMaker';
import { GLSGAsset } from '../../../SceneGraph/GLSGAsset';

export class OrderEntryRig extends SceneElement
{
    bidOrderMarker : bjs.Mesh | undefined;
    askOrderMarker : bjs.Mesh | undefined;
    bidMarkerMaterial : bjs.PBRMaterial = new bjs.PBRMaterial("Bid Marker", this.scene.bjsScene);
    askMarkerMaterial : bjs.PBRMaterial = new bjs.PBRMaterial("Ask Marker", this.scene.bjsScene);
    bidOrderDepth : currency = currency(2);
    askOrderDepth : currency = currency(2);
    maxOrderDepth : currency  = currency(20);
    bidMarkerMoving : boolean = false;
    askMarkerMoving : boolean = false;

    inMarketBid : boolean = false;
    bidTargetPrice : currency | undefined;

    inMarketAsk : boolean = false;
    askTargetPrice : currency | undefined;

    constructor(public name:string,
                public x: number,
                public y: number,
                public z: number,
                public scene : Scene<bjs.Camera>,
                public presenter : DepthFinderPresenter,
                public cellWidth : number,
                public orderBookRig : bjs.TransformNode,
                public marketMaker : MarketMaker)
    {
        super(name,x,y,z,scene);
        this.create();     
    } 

    protected onCreate()
    {

        let bidOrderMarkerMesh : bjs.Mesh | undefined = AssetManager.Instance.getMeshClone("ordermarker2");

        if (bidOrderMarkerMesh)
        {
            this.bidOrderMarker = bidOrderMarkerMesh;
            this.bidMarkerMaterial.albedoColor = bjs.Color3.FromInts(32,128,32);
            this.bidMarkerMaterial.metallic = 0.1;
            this.bidMarkerMaterial.roughness = 0.5;
            this.bidOrderMarker.material = this.bidMarkerMaterial;
            this.bidOrderMarker.parent = this;
            this.bidOrderMarker.position.y = 0;
            this.bidOrderMarker.rotation.y = Math.PI;
        }

        let askOrderMarkerMesh : bjs.Mesh | undefined = AssetManager.Instance.getMeshClone("ordermarker2");

        if (askOrderMarkerMesh)
        {
            this.askOrderMarker = askOrderMarkerMesh;
            this.askMarkerMaterial.albedoColor = bjs.Color3.Red();
            this.askMarkerMaterial.albedoColor = bjs.Color3.FromInts(128,32,32);
            this.askMarkerMaterial.metallic = 0.1;
            this.askMarkerMaterial.roughness = 0.5;
            this.askOrderMarker.material = this.askMarkerMaterial;
            this.askOrderMarker.parent = this;
            this.askOrderMarker.position.y = 0;
            this.askOrderMarker.rotation.y = Math.PI;
        }
      
        this.scene.bjsScene.actionManager = new bjs.ActionManager(this.scene.bjsScene);
        
        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'a'
                },
                this.moveBidOut.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'd'
                },
                this.moveBidIn.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'w'
                },
                this.enterMarketOnBid.bind(this)
            )
        );

        
        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 's'
                },
                this.exitMarketOnBid.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'l'
                },
                this.moveAskOut.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'j'
                },
                this.moveAskIn.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'i'
                },
                this.enterMarketOnAsk.bind(this)
            )
        );

        this.scene.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: 'b'
                },
                this.enterMarketOnBoth.bind(this)
            )
        );
        
        
    }

    protected moveBidOut()
    {   
        
        console.log("Order Entry Rig : Move Bid OuT");

        if (this.bidOrderDepth < this.maxOrderDepth)
        {
            this.bidOrderDepth = this.bidOrderDepth.add(1);
            this.bidMarkerMoving = true;
        }
    }

    protected moveBidIn()
    {   
        console.log("Order Entry Rig : Move Bid In");

        if (this.bidOrderDepth.value > 0)
        {
            this.bidOrderDepth = this.bidOrderDepth.subtract(1);
            this.bidMarkerMoving = true;
        }
    }

    protected enterMarketOnBoth()
    {   
        console.log("Order Entry Rig : Enter Market");
        this.bidTargetPrice = currency(Math.floor(this.presenter.midPrice.value - this.bidOrderDepth.value));
        console.log("Order Entry Rig : Enter Market On Bid at : " + this.bidTargetPrice);

        this.askTargetPrice = currency(Math.ceil(this.presenter.midPrice.value - this.bidOrderDepth.value));
        console.log("Order Entry Rig : Enter Market On Ask at : " + this.askTargetPrice);


        this.marketMaker.processEvent(new MarketMakerEvent("BOTH_TARGETS_SET",this.bidTargetPrice,this.askTargetPrice));
        this.inMarketBid = true;
        this.inMarketAsk = true;
    }

    protected enterMarketOnBid()
    {   
        console.log("Order Entry Rig : Enter Market On Bid");
        this.bidTargetPrice = currency(Math.floor(this.presenter.midPrice.value - this.bidOrderDepth.value));
        console.log("Order Entry Rig : Enter Markt On Bid at : " + this.bidTargetPrice);
        this.marketMaker.processEvent(new MarketMakerEvent("BID_TARGET_SET",this.bidTargetPrice,undefined));
        this.inMarketBid = true;
    }

    protected exitMarketOnBid()
    {   
        console.log("Order Entry Rig : Exit Market On Bid");
        this.bidTargetPrice = undefined;
        this.marketMaker.processEvent(new MarketMakerEvent("EXIT_MARKET_BID"));
        this.inMarketBid = false;
    }

    protected enterMarketOnAsk()
    {   
        console.log("Order Entry Rig : Enter Market On Ask");
        this.askTargetPrice = currency(Math.ceil(this.presenter.midPrice.value + this.askOrderDepth.value));
        console.log("Order Entry Rig : Enter Market On Ask at : " + this.askTargetPrice);
        this.marketMaker.processEvent(new MarketMakerEvent("ASK_TARGET_SET",undefined,this.askTargetPrice));
        this.inMarketAsk = true;
    }

    protected exitMarketOnAsk()
    {   
        console.log("Order Entry Rig : Exit Market On Ask");
        this.askTargetPrice = undefined;
        this.marketMaker.processEvent(new MarketMakerEvent("EXIT_MARKET_ASK"));
        this.inMarketAsk = false;
    }

    protected updateBidTargetPrice()
    {
        let newTargetPrice : currency= currency(Math.floor(this.presenter.midPrice.value - this.bidOrderDepth.value));
        if (newTargetPrice != this.bidTargetPrice)
        {
            this.bidTargetPrice = newTargetPrice;
            this.marketMaker.processEvent(new MarketMakerEvent("BID_TARGET_SET",this.bidTargetPrice,undefined));
        }
    }
    
    protected updateAskTargetPrice()
    {
        let newTargetPrice : currency= currency(Math.ceil(this.presenter.midPrice.value + this.askOrderDepth.value));
        if (newTargetPrice != this.askTargetPrice)
        {
            this.askTargetPrice = newTargetPrice;
            this.marketMaker.processEvent(new MarketMakerEvent("ASK_TARGET_SET",undefined,this.askTargetPrice));
        }
    }

    protected moveAskOut()
    {   
        console.log("Order Entry Rig : Move Ask OuT");

        if (this.askOrderDepth < this.maxOrderDepth)
        {
            this.askOrderDepth = this.askOrderDepth.add(1);
            this.askMarkerMoving  = true;
        }
    }

    protected moveAskIn()
    {   
        console.log("Order Entry Rig : Move Ask In");

        if (this.askOrderDepth.value > 0)
        {
            this.askOrderDepth = this.askOrderDepth.subtract(1);
            this.askMarkerMoving = true;
        }
    }

    protected onPreRender()
    {
        if (this.presenter.isReady)
        {
            //console.log("Order Book Entry Rig : PreRender : Bid Depth : " + this.bidOrderDepth);
            let currentRow: DepthFinderRow = this.presenter.rows[0] as DepthFinderRow;

            let bidMarkerPrice : currency = currency(Math.floor(this.presenter.midPrice.value) - this.bidOrderDepth.value);
            let askMarkerPrice: currency  =  currency(Math.ceil(this.presenter.midPrice.value) + this.askOrderDepth.value);

            let bidOrderMarkerPositionX : number = ((currentRow.positionOffsetX +  this.presenter.offsetForPrice(bidMarkerPrice)) * this.cellWidth ) +
            this.orderBookRig.position.x;

            let askOrderMarkerPositionX : number  = ((currentRow.positionOffsetX +  this.presenter.offsetForPrice(askMarkerPrice)) * this.cellWidth ) +
            this.orderBookRig.position.x;

            if (this.bidOrderMarker)
            {
                if (this.bidMarkerMoving)
                {
                    this.bidOrderMarker.position.x = bjs.Scalar.Lerp(this.bidOrderMarker.position.x, bidOrderMarkerPositionX,0.5);
    
                    if ( Math.abs(this.bidOrderMarker.position.x - bidOrderMarkerPositionX) < 0.1)
                    {
                        this.bidMarkerMoving = false;
                    }
                }
                else
                {
                    this.bidOrderMarker.position.x =  bidOrderMarkerPositionX;
                }
            }

            if (this.askOrderMarker)
            {   
                if (this.askMarkerMoving)
                {    
                    this.askOrderMarker.position.x = bjs.Scalar.Lerp(this.askOrderMarker.position.x, askOrderMarkerPositionX,0.5);
                }
                else
                {
                    this.askOrderMarker.position.x = bjs.Scalar.Lerp(this.askOrderMarker.position.x, askOrderMarkerPositionX,0.5);
                }
            }
            
            if (this.inMarketBid)
                this.updateBidTargetPrice();

            if (this.inMarketAsk)
                this.updateAskTargetPrice();
        }
    }

    protected onRender()
    {

    }
}


