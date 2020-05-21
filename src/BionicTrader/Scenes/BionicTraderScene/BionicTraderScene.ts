import * as bjs from 'babylonjs';
import 'babylonjs-inspector';
import 'babylonjs-loaders';
import * as currency from 'currency.js';
import { Queue } from 'queue-typescript';
import { wavDowntick, wavUptick } from '../../../Assets/AssetManager';
import { DepthFinderSound } from '../../../Enums';
import { ExchangeOrder } from '../../../Market/ExchangeOrder';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';
import { MarketDataSource } from '../../../Market/MarketDataSource';
import { MarketMaker } from '../../../Market/MarketMaker';
import { ShrimpyMarketDataSource } from '../../../Market/Sources/ShrimpyMarketDataSource';
import { SimulatorMarketDataSource } from '../../../Market/Sources/SimulatorMarketDataSource';
import { AssetManager } from '../../../SceneGraph/AssetManager';
import { IMessageBusClient, IMessageBusLink } from '../../../SceneGraph/SceneGraphInterfaces';
import { StandardScene } from '../../../SceneGraph/StandardScene';
import { TextMeshModelLoader } from '../../../SceneGraph/TextMeshModelLoader';
import Logger from '../../../Utils/Logger';
import { DepthFinderElement } from '../../Elements/DepthFinder/DepthFinderElement';
import { DepthFinderPresenter } from '../../Elements/DepthFinder/DepthFinderPresenter';
import SoundPlayer from './SoundPlayer';

enum MenuPosition {
    TOP_LEFT = 0,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
};

export class BionicTraderScene extends StandardScene implements IMessageBusClient {

    directionalLight : bjs.DirectionalLight | undefined;
    depthFinder: DepthFinderElement | undefined;
    orderUpdateQueue: Queue<ExchangeOrder> = new Queue<ExchangeOrder>();
    tradeHistoryQueue: Queue<ExchangeOrder> = new Queue<ExchangeOrder>(); 
    cameraHolder: bjs.TransformNode | undefined;
    activeMenuItemText: string = '';

    public rowDepthMultiplier: number = 1;
    public cellHeightMultiplier: number = 1.0;
    public maxCellHeight: number = 20;

    //private majorElementsTransform: bjs.TransformNode = null;

    private cameraHomeAlpha: number = -Math.PI / 2;
    private cameraHomeBeta: number = Math.PI / 2 - (Math.PI) / 5;
    private cameraStartingRadius: number = 35;
    private cameraHomeRadius: number = 35;

    private audioIsInitalized = false;
    public audioIsEnabled = false;
    private upTickSound: SoundPlayer | undefined;
    private downTickSound: SoundPlayer | undefined;

    private previousMidPrice: currency = currency(0);

    /*
    // PieMenuItem Properties Start
    itemCount: number = 10;
    //menu: PieMenuElement;
    //menuPosition: bjs.Vector3 = new bjs.Vector3(-1.5, 0, 0);
    //menuPositionType: number = MenuPosition.TOP_LEFT;
    centerBox: bjs.Mesh | undefined;
    //glowLayer: bjs.GlowLayer;
    //glowEnabled: boolean = false;
    angleX0: number = 0;
    angleY0: number = 0;
    cornerMarginX: number = -20;
    cornerMarginY: number = 120;
    menuCamera : bjs.ArcRotateCamera | undefined;
    menuCameraHolder : bjs.TransformNode | undefined;
    menuItemList = [];
    openMenuAction: Function | undefined;
    // PieMenuItem Properties End
    */

    
    distance: number = 20;

    public sampler : MarketDataSampler | undefined;
    private depthFinderPresenter : DepthFinderPresenter | undefined;

    private marketMaker : MarketMaker | undefined;

    public rowCount: number = 60;
    public columnCount: number = 40;
    public cellWidth: number = 0.5;
    public cellHeight: number = 0.25;
    public cellDepth: number = 2;
    private simulationMode : boolean = false;
    private samplerGenerations : number = 50;
    private samplingInterval : number = 500;
    public exchangeType: string = 'binance';
    public pairType: string = 'btc-usdt';
    private priceQuantizeDivision: number = 0.1;

    xr : bjs.WebXRDefaultExperience | undefined;

    private swirlyDome : bjs.Mesh | undefined;
    private isLoadSignalEmitted: boolean = false;

    private sceneOptimizer : bjs.SceneOptimizer | undefined;

    private inspectorIsVisible = false;

    private sceneBaseUrl = "./src/BionicTrader/Scenes/BionicTraderScene/Assets/";

    assetsPath: Array<Object> = [
        {type: 'mesh', name:'simplecube', url: this.sceneBaseUrl, fileName: 'models/simplecube.babylon'},
        {type: 'mesh', name:'bidblock', url: this.sceneBaseUrl, fileName: 'models/simplecube.babylon'},
        {type: 'mesh', name:'askblock', url: this.sceneBaseUrl, fileName: 'models/simplecube.babylon'},
        {type: 'mesh', name:'ordermarker2', url: this.sceneBaseUrl, fileName: 'models/ordermarker2.babylon'},
        {type: 'mesh', name:'SmoothCube', url: this.sceneBaseUrl, fileName: 'models/SmoothCube.babylon'},
        {type: 'mesh', name:'swirly', url: this.sceneBaseUrl, fileName: 'models/swirly.babylon'},
        {type: 'mesh', name:'frame', url: this.sceneBaseUrl, fileName: 'models/frame.glb'}
    ];
    
    constructor(public title: string,
        public canvas: HTMLElement,
        hdrSkyboxTexture: string, 
        public link: IMessageBusLink,
        exchange: string,
        pair: string) {
        super(title, canvas,hdrSkyboxTexture,);

        this.exchangeType = exchange;
        this.pairType = pair;
    }

    protected async createScene()
    {
        TextMeshModelLoader.Instance.init(this);

        //this.majorElementsTransform = new bjs.TransformNode("elements", this.bjsScene);
        //this.optimizer = new bjs.SceneOptimizer(this.bjsScene);

        if (this.link != null)
            this.link.scene = this;

        this.directionalLight = new bjs.DirectionalLight("dir01", new bjs.Vector3(-0.75, -1, -0.3), this.bjsScene);


        
        
        this.swirlyDome = AssetManager.Instance.getMesh("swirly");

        if (this.swirlyDome)
        {
            this.swirlyDome.position = new bjs.Vector3(0,-7,50);
            this.swirlyDome.scaling = new bjs.Vector3(10,10,10);
            this.swirlyDome.rotate(bjs.Axis.Y, Math.PI/4, bjs.Space.WORLD);
            this.swirlyDome.freezeWorldMatrix();
        }
        
        
        
  
        let marketDataSource : MarketDataSource;
            
        if (this.simulationMode)
        {
            marketDataSource = new SimulatorMarketDataSource(this.exchangeType, this.pairType);       
        }
        else
        {
            marketDataSource = new ShrimpyMarketDataSource(this.exchangeType, this.pairType);
        }


        this.depthFinderPresenter = new DepthFinderPresenter(this.rowCount, this.columnCount, this.samplingInterval, this.priceQuantizeDivision);

        this.sampler = new MarketDataSampler(this.depthFinderPresenter,
                                            this.exchangeType,
                                            this.pairType,
                                            this.samplerGenerations,
                                            this.samplingInterval,
                                            this.priceQuantizeDivision,
                                            marketDataSource);
        this.sampler.connect();

        this.marketMaker = new MarketMaker(this.depthFinderPresenter);


                                        
        this.depthFinder = new DepthFinderElement("Depth Finder",   //name,
                                                            0,              //x
                                                            -4.99,              //y
                                                            4,              //z
                                                            this,
                                                            this.rowCount,
                                                            this.columnCount,
                                                            this.cellWidth,
                                                            this.cellHeight,
                                                            this.cellDepth,
                                                            this.depthFinderPresenter,
                                                            this.marketMaker
                                                            );

        // this.orderBookVisualizer.parent = this.majorElementsTransform;
        this.depthFinder.rotation.y = 0;
        //this.depthFinder.scaling.x = 0.5;
        this.AddSceneElement(this.depthFinder);

        this.camera.lowerRadiusLimit = 1;
        //this.camera.upperAlphaLimit = this.camera.alpha + (Math.PI) / 6;
        //this.camera.lowerAlphaLimit = this.camera.alpha + - (Math.PI) / 6;
        //this.camera.upperBetaLimit = Math.PI / 2;
        //this.camera.lowerBetaLimit = Math.PI / 2 - (Math.PI) / 6;;
        this.camera.alpha = this.cameraHomeAlpha;
        this.camera.beta = this.cameraHomeBeta;
        this.camera.radius = this.cameraHomeRadius;
        this.camera.fov = 0.5;
        this.camera.angularSensibilityX = 2000;
        this.camera.angularSensibilityY = 2000;
        this.camera.panningSensibility = 2000;

        this.cameraHolder = new bjs.TransformNode("Camera Holder");
        this.cameraHolder.position.y = 1;
        this.cameraHolder.position.z = -4.5;
        this.camera.parent = this.cameraHolder;
        this.camera.wheelPrecision = 100;

        //this.menuCamera = this.camera;
        //this.menuCameraHolder = this.cameraHolder;
        //this.menuCamera.parent = this.menuCameraHolder;
   

        this.sampler.onSampleCaptured.subscribe(() => {
            this.rowDepthMultiplier = 0;
        });

        this.upTickSound = new SoundPlayer(wavUptick);
        await this.upTickSound.loadAudioStream();

        this.downTickSound = new SoundPlayer(wavDowntick);
        await this.downTickSound.loadAudioStream();
        /*
        var pipeline = new bjs.DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            this.bjsScene, // The scene instance
            [this.camera] // The list of cameras to be attached to
        );
        */

       //var postProcess = new bjs.BlackAndWhitePostProcess("bandw", 1.0, this.camera);
       //var postProcess = new bjs.FxaaPostProcess("fxaa", 1.0, this.camera);
       
       this.bjsScene.freezeActiveMeshes();
       this.bjsScene.autoClear = false; // Color buffer
       this.bjsScene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
       // Optimizer
       var options = new bjs.SceneOptimizerOptions(60, 500);
       this.sceneOptimizer = new bjs.SceneOptimizer(this.bjsScene, options);
       this.sceneOptimizer.start();

       this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyUpTrigger,
                    parameter: '`'
                },
                this.toggleInspector.bind(this)
            )
        );

        //var ssao = new bjs.SSAORenderingPipeline('ssaopipeline', this.bjsScene, 0.75);

       /*
       this.xr = await this.bjsScene.createDefaultXRExperienceAsync({
            //floorMeshes: [this.depthFinder.gridFloor.ground]
        });

        this.xr.baseExperience.onStateChangedObservable.add((state) => {
            switch (state) {
                case bjs.WebXRState.IN_XR:
                    console.log("WebXRState : IN_XR");
                    // Start XR camera facing forward, not tilt.
                    //xrHelp.baseExperience.camera.rotate
                    //this.xr.baseExperience.camera.setTransformationFromNonVRCamera(this.camera,true);
                    //this.xr.baseExperience.camera.rotationQuaternion = bjs.Quaternion.FromEulerVector(new bjs.Vector3(0,Math.PI/2,0));
                    break;
            }
        })
        */

        // Create PieMenuElement
        // this.createPieMenu();
    }

    protected async setupCamera() {
        this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 0, new bjs.Vector3(0, 0, 0), this.bjsScene);

            if (this.camera && this.bjsScene) {
                this.camera.alpha  = -Math.PI / 2;
                this.camera.beta = Math.PI / 2;       
                this.camera.attachControl(this.canvas, true);
                //this.bjsScene.activeCameras = [this.camera];
            }
    }

    public reset()
    {

        if (this.sampler)
            this.sampler.clear();
    }

    public stop()
    {
        if (this.sampler)
            this.sampler.stop();
    }

    public resume()
    {

    }

    protected async onPreRender()
    {  
        if (this.sampler && this.sampler.isLoaded)
        {
            if (this.depthFinderPresenter)
            {
                if (!this.isLoadSignalEmitted && this.depthFinderPresenter.isReady)
                {
                    if (this.callback)
                        this.callback(1);
                        
                    this.isLoadSignalEmitted = true;
                }    
            }

            let orderImbalanceFactor: number = this.sampler.orderImbalance * 0.025;

            if (orderImbalanceFactor < 0) {
                orderImbalanceFactor = Math.max(-Math.PI / 6, orderImbalanceFactor)
            }
            else {
                orderImbalanceFactor = Math.min(Math.PI / 6, orderImbalanceFactor);
            }

            if (this.audioIsEnabled) {
                if (!this.audioIsInitalized) {
                    this.audioIsInitalized = true;
                }

                if (this.previousMidPrice.value === 0) {
                    Logger.log("DepthFinderScene : Setting Initial Midprice " + this.sampler.midPrice);
                    this.previousMidPrice = this.sampler.midPrice;
                }
                else {
                    if (this.sampler.midPrice < this.previousMidPrice) {
                        Logger.log("DepthFinderScene : MidPrice Uptick");
                        this.previousMidPrice = this.sampler.midPrice;
                        this.playSound(DepthFinderSound.UpTick);
                    }
                    else if (this.sampler.midPrice > this.previousMidPrice) {
                        Logger.log("DepthFinderScene : MidPrice Downtick");
                        this.previousMidPrice = this.sampler.midPrice;
                        this.playSound(DepthFinderSound.DownTick);
                    }
                }
            }
        }
        // Calling PieMenu Renderer
        //this.pieMenuRenderer();
    }

    /*
    public setMenuItemList(menuList) {
        this.menuItemList = menuList;
    }

    public onOpenMenu = () => {
        if (this.openMenuAction) {
            this.openMenuAction(this.title);
        }
    }

    public closeMenu() {
        this.menu.close();
    }
    */

    public resumeSounds()
    {
        if (this.upTickSound)
        {
            if (this.upTickSound.context.state === 'suspended')
            {
                this.upTickSound.resume();
            }
        }
      
        if ( this.downTickSound)
        {
            if (this.downTickSound.context.state === 'suspended')
            {
                this.downTickSound.resume();
            }    
        }
    }

    protected toggleInspector() : void
    {
        if (this.inspectorIsVisible)
        {
            this.bjsScene.debugLayer.hide();
            this.inspectorIsVisible = false;
        }
        else
        {
            this.bjsScene.debugLayer.show({overlay:true});
            this.inspectorIsVisible = true;
        }
    }

    protected onRender()
    {
        
        let aspectRatio = (this.canvas.clientHeight * this.camera.viewport.height) / (this.canvas.clientWidth * this.camera.viewport.width);

        if (aspectRatio < 1) {
            this.camera.fov = 0.5 - ((1 - aspectRatio) * 0.2);
            this.cameraHomeRadius = this.cameraStartingRadius + ((1 / aspectRatio));
            let betaAdjustFactor: number = (1 / aspectRatio) * 4;
            this.cameraHomeBeta = Math.PI / 2 - (Math.PI) / (5 + betaAdjustFactor);

        }
        else if (aspectRatio === 1)
        {
            //this.cameraHomeRadius = this.cameraStartingRadius;
        }
        else {
          //this.camera.radius = this.camera.radius * (1 - aspectRatio * 0.005);
          this.camera.fov = 0.5 + (aspectRatio * 0.6);
          this.cameraHomeRadius = this.cameraStartingRadius + (aspectRatio);
          let betaAdjustFactor: number = (aspectRatio * 0.25);
          this.cameraHomeBeta = Math.PI / 2 - (Math.PI) / (20 - betaAdjustFactor);
        }

        //this.camera.alpha = bjs.Scalar.Lerp(this.camera.alpha, this.cameraHomeAlpha, 0.01);
        //this.camera.beta = bjs.Scalar.Lerp(this.camera.beta, this.cameraHomeBeta, 0.01);

        if (this.depthFinder != null)
        {
            if (this.depthFinder.gridFloor != null)
            {
                //this.cameraHolder.lookAt(this.depthFinder.gridFloor.midPriceLabel.getAbsolutePosition());
                //this.cameraHolder.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);
            }
        }
        
    }

    public playSound(sound: DepthFinderSound) {
        switch (sound) {
            case DepthFinderSound.UpTick:
                if (this.upTickSound)
                    this.upTickSound.play();
                break;
            case DepthFinderSound.DownTick:
                if (this.downTickSound)
                    this.downTickSound.play();
                break;

        }
    }

    public destroy() {
        this.bjsScene.dispose();
    }

    public setActiveMenuItem(activeMenuItemText: string) {
        this.activeMenuItemText = activeMenuItemText;
    }
}
