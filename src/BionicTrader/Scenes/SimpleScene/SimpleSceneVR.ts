import * as bjs from 'babylonjs';
import 'babylonjs-loaders';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';
import { MarketDataSource } from '../../../Market/MarketDataSource';
import { MarketMaker } from '../../../Market/MarketMaker';
import { ShrimpyMarketDataSource } from '../../../Market/Sources/ShrimpyMarketDataSource';
import { SimulatorMarketDataSource } from '../../../Market/Sources/SimulatorMarketDataSource';
import { AssetManager } from '../../../SceneGraph/AssetManager';
import { TextMeshModelLoader } from '../../../SceneGraph/TextMeshModelLoader';
import { TextMeshString } from '../../../SceneGraph/TextMeshString';
import { VRScene } from '../../../SceneGraph/VRScene';
import { DepthFinderElement } from '../../Elements/DepthFinder/DepthFinderElement';
import { DepthFinderPresenter } from '../../Elements/DepthFinder/DepthFinderPresenter';
import { GridFloor } from '../../Elements/DepthFinder/GridFloor';
import SimpleSceneConstants from './constants';
import { Chart2D } from './Elements/Chart2D';
import { Chart2DDataSource } from './Elements/Chart2DataSource';
import { Chart2DPresenter } from './Elements/Chart2DPresenter';
import { SineWaveScrollerVectorField } from './Elements/SineWaveScrollerVectorField';
import { SpinningCylinderThing } from './Elements/SpinningCylinderThing';
import { VideoScreen } from './Elements/VideoScreen';

export class SimpleSceneVR extends VRScene
{
    ground : bjs.Mesh | undefined;
    checkerMaterial : bjs.StandardMaterial | undefined;
    groundMaterial : bjs.PBRMaterial | undefined;
    ceramicTileMaterial : bjs.PBRMaterial | undefined;
    lavaMaterial : bjs.PBRMaterial | undefined;
    domeMaterial : bjs.PBRMaterial | undefined;
    cylinders: SpinningCylinderThing | undefined;
    field: SineWaveScrollerVectorField | undefined;
    text : TextMeshString | undefined;
    car : bjs.TransformNode | undefined;
    cockpit : bjs.TransformNode | undefined;
    helmet : bjs.TransformNode | undefined;
    hemisphere : bjs.TransformNode | undefined;
    desk : bjs.TransformNode | undefined;
    chart : Chart2D | undefined;
    chartPresenter : Chart2DPresenter | undefined;
    chartData : Chart2DDataSource | undefined;
    screen : VideoScreen | undefined;
    cameraOrbitSpeed: number = 0.001;
    majorElementsTransform : bjs.TransformNode | undefined;
    cameraRig : bjs.TransformNode | undefined;
    orderBookVisualizer : DepthFinderElement | undefined;
    gridFloor : GridFloor | undefined;
    swirlyDome : bjs.Mesh | undefined;

    public rowCount: number = 60;
    public columnCount: number = 30;
    public cellWidth: number = 0.25;
    public cellHeight: number = 0.25;
    public cellDepth: number = 3;

    private exchangeType: string = "binance";
    private pairType: string = "btc-usdt";
    private simulationMode : boolean = false;

    public sampler : MarketDataSampler | undefined;
    private samplerGenerations : number = 50;
    private samplingInterval : number = 250;
    private priceQuantizeDivision: number = 1;
    
    private depthFinderPresenter : DepthFinderPresenter | undefined;
    private marketMaker : MarketMaker | undefined;

    xr : bjs.WebXRDefaultExperience | undefined;

    private cameraHomeBeta : number = Math.PI / 2  - (Math.PI)/32;

    assetsPath: Array<Object> = [
        {type: 'mesh', name:'simplecube', url: '/', fileName: 'simplecube.babylon'},
        {type: 'mesh', name:'ordermarker2', url: '/', fileName: 'ordermarker2.babylon'},
        {type: 'mesh', name:'SmoothCube', url: '/', fileName: 'SmoothCube.babylon'},
        {type: 'mesh', name:'swirly', url: '/', fileName: 'swirly.babylon'},
        {type: 'mesh', name:'desk', url: '/', fileName: 'desk.glb'},
        {type: 'mesh', name:'tv', url: '/', fileName: 'tv.glb'},
        {type: 'mesh', name:'CurvedScreen_Screen', url: '/', fileName: 'CurvedScreen_Screen.babylon'}
    ];

    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture: string)
    {
        super(title,canvas,hdrSkyboxTexture);
    }

    protected async createScene()
    {
        TextMeshModelLoader.Instance.init(this);

        this.majorElementsTransform = new bjs.TransformNode("elements", this.bjsScene);
        this.majorElementsTransform.scaling = new bjs.Vector3(1,1,1);
        this.cameraRig = new bjs.TransformNode("CameraRig")
        this.camera.minZ = 0.01;
        this.camera.fov = 1.2;

        const grid = {
            'h' : 24,
            'w' : 24
        };

        this.ground = bjs.MeshBuilder.CreateTiledGround("Tiled Ground", {xmin: -50, zmin: -50, xmax: 50, zmax: 50, subdivisions: grid}, this.bjsScene);
        this.groundMaterial = new bjs.PBRMaterial("Mat", this.bjsScene);   

        this.domeMaterial = new bjs.PBRMaterial("Dome", this.bjsScene);
        this.domeMaterial.albedoColor = bjs.Color3.FromInts(32,32,64);
    
        this.lavaMaterial = new bjs.PBRMaterial("Mat", this.bjsScene);
        this.lavaMaterial.albedoTexture = new bjs.Texture(SimpleSceneConstants.lavaAlbedoTexture, this.bjsScene);
        this.lavaMaterial.bumpTexture = new bjs.Texture(SimpleSceneConstants.lavaNormalTexture, this.bjsScene);
        this.lavaMaterial.metallicTexture = new bjs.Texture(SimpleSceneConstants.lavaARMTexture, this.bjsScene);
        this.lavaMaterial.useMetallnessFromMetallicTextureBlue = true;
        this.lavaMaterial.useRoughnessFromMetallicTextureAlpha = false;
        this.lavaMaterial.useRoughnessFromMetallicTextureGreen = true;
        this.lavaMaterial.emissiveColor = bjs.Color3.White();
        this.lavaMaterial.emissiveTexture = new bjs.Texture(SimpleSceneConstants.lavaEmissiveTexture, this.bjsScene);

        this.ceramicTileMaterial = new bjs.PBRMaterial("tile", this.bjsScene);
        this.ceramicTileMaterial.albedoTexture = new bjs.Texture(SimpleSceneConstants.ceramicTileAlbedoTexture, this.bjsScene);
        //this.ceramicTileMateral.roughness = 1;
        this.ceramicTileMaterial.bumpTexture = new bjs.Texture(SimpleSceneConstants.ceramicTileNormalTexture, this.bjsScene);
        this.ceramicTileMaterial.metallicTexture = new bjs.Texture(SimpleSceneConstants.ceramicTileARMTexture, this.bjsScene);
        this.ceramicTileMaterial.useMetallnessFromMetallicTextureBlue = true;
        this.ceramicTileMaterial.useRoughnessFromMetallicTextureAlpha = false;
        this.ceramicTileMaterial.useRoughnessFromMetallicTextureGreen = true;
    
        this.ground.material = this.ceramicTileMaterial;
        this.ground.position = new bjs.Vector3(0,0.1,0);
        this.ground.isVisible = false;

        this.swirlyDome = AssetManager.Instance.getMesh("swirly");
        if (this.swirlyDome)
        {
            this.swirlyDome.position = new bjs.Vector3(0,-1,0);
            this.swirlyDome.scaling = new bjs.Vector3(2.6,2.6,2.6);
            this.swirlyDome.rotate(bjs.Axis.Y, Math.PI, bjs.Space.WORLD);
        }



        let deskMesh : bjs.Mesh | undefined = AssetManager.Instance.getMesh("desk");

        if (deskMesh)
        {
            this.desk = deskMesh.instantiateHierarchy() as bjs.TransformNode;
            this.desk.position = new bjs.Vector3(0,-0.75,-0.23);
            this.desk.rotate(bjs.Axis.Y, (Math.PI/2) + (Math.PI/8), bjs.Space.WORLD);
            this.desk.scaling = new bjs.Vector3(.0075,.0075,.0075);
            deskMesh.isVisible = false;
            var hierarchy = deskMesh.getChildMeshes(false);
            hierarchy.forEach( item => { item.isVisible = false;})
        }
        
        /*
       this.gridFloor = new GridFloor("grid",
       0,
       -1.75,
       256,
       this,
       this.sampler,
       this.rowCount,
       this.columnCount,
       this.cellWidth,
       this.cellHeight,
       this.cellDepth);


   this.AddSceneElement(this.gridFloor);
   */
  let marketDataSource : MarketDataSource;

  if (this.simulationMode)
  {
      marketDataSource = new SimulatorMarketDataSource(this.exchangeType, this.pairType);       
  }
  else
  {
      marketDataSource = new ShrimpyMarketDataSource(this.exchangeType, this.pairType);
  }

  this.depthFinderPresenter = new DepthFinderPresenter(this.rowCount,this.columnCount, this.samplingInterval, this.priceQuantizeDivision);

  this.sampler = new MarketDataSampler(this.depthFinderPresenter,
                                    this.exchangeType,
                                      this.pairType,
                                      this.samplerGenerations,
                                      this.samplingInterval,
                                      this.priceQuantizeDivision,
                                      marketDataSource);
  //this.sampler.onLoad = this.onSamplerLoad;
  this.sampler.connect();

  this.marketMaker = new MarketMaker(this.depthFinderPresenter);


  
        this.orderBookVisualizer = new DepthFinderElement("value field",   //name,
        0,              //x
        -0.5,              //y
        5,              //z
        this,
        this.rowCount,
        this.columnCount,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        this.depthFinderPresenter,
        this.marketMaker);

        this.orderBookVisualizer.parent = this.majorElementsTransform;
        this.orderBookVisualizer.rotation.y = 0;
        //this.orderBookVisualizer.scaling = new bjs.Vector3(0.5,0.5,0.5);
        this.AddSceneElement(this.orderBookVisualizer);
        

        ////CHARTING

        this.chartPresenter = new Chart2DPresenter();
        this.chartData = new Chart2DDataSource(this.chartPresenter,1.0);
       
        this.chart = new Chart2D("chart",10.5,4,17,this,this.chartPresenter);
        this.chart.scaling = new bjs.Vector3(4,4,4);
        this.chart.rotate(bjs.Axis.Y, (Math.PI/6), bjs.Space.WORLD);
        this.chart.rotate(bjs.Axis.X, -(Math.PI/8), bjs.Space.LOCAL);

        //this.chart.rotate(bjs.Axis.X,(-Math.PI/6), bjs.Space.WORLD);
        //this.chart.rotate(bjs.Axis.Y, -(Math.PI/6), bjs.Space.WORLD);
        ///this.chart.rotate(bjs.Axis.X, (Math.PI/6), bjs.Space.WORLD);

        this.AddSceneElement(this.chart);

        this.screen = new VideoScreen("screen", -10.5,0,17,this);
        this.screen.scaling = new bjs.Vector3(2,2,2);
        this.screen.rotate(bjs.Axis.Y, -(Math.PI/6), bjs.Space.WORLD);
        this.screen.rotate(bjs.Axis.X, -(Math.PI/8), bjs.Space.LOCAL);
        //this.screen.rotate(bjs.Axis.X,(-Math.PI/6), bjs.Space.WORLD);
        //this.screen.rotate(bjs.Axis.Y, -Math.PI/2 - (Math.PI/6), bjs.Space.WORLD);
        //this.screen.position.
        //this.screen.rotate(bjs.Axis.Z, Math.PI - (Math.PI/6), bjs.Space.WORLD);
        this.AddSceneElement(this.screen);

        
        /*
        bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.helmetModel , this.bjsScene, newMeshes => {
            console.log("Importing " + newMeshes.length + " meshes");
            this.helmet = newMeshes[0].instantiateHierarchy();
            //this.cockpit.rotation.y = Math.PI/8;
            this.helmet.rotate(new bjs.Vector3(0,1,0),Math.PI/2);
            this.helmet.position = new bjs.Vector3(-20,0,0)
            this.helmet.scaling = new bjs.Vector3(2,2,2);
    
            newMeshes[0].isVisible = false;
            var hierarchy = newMeshes[0].getChildMeshes(false);
            hierarchy.forEach( item => { item.isVisible = false;})
        });
        */

        /*
        // cylinders
        this.cylinders = new SpinningCylinderThing('cylinder', 0, 0, 0, this);
        this.cylinders.rotate(new bjs.Vector3(0,1,0),Math.PI/2);
        this.cylinders.position = new bjs.Vector3(-20,-1,0)
        this.cylinders.scaling = new bjs.Vector3(0.1,0.1,0.1);
        this.AddSceneElement(this.cylinders);
        */
        

        //this.text = new TextMeshString("text",0,20,0,this,"COINBASE");
        //await this.text.create();
        //this.AddSceneElement(this.text);

        //const environment = this.bjsScene.createDefaultEnvironment();
        //this.bjsScene.environmentTexture = this.hdrTexture;
        //this.bjsScene.createDefaultSkybox(this.hdrTexture, true, 1000, 0.7);

        var light = new bjs.DirectionalLight("DirectionalLight", new bjs.Vector3(0.5, -1, 0), this.bjsScene);
        light.intensity = 0.5;

        //var defaultPipeline = new bjs.DefaultRenderingPipeline("default", true, this.bjsScene, [this.camera]);

        this.xr = await this.bjsScene.createDefaultXRExperienceAsync({
            //floorMeshes: [this.ground]
        });

        if (this.xr)
        {
            this.xr.baseExperience.onStateChangedObservable.add((state) => {
                switch (state) {
                    case bjs.WebXRState.IN_XR:
                        console.log("WebXRState : IN_XR");
                        // Start XR camera facing forward, not tilt.
                        //xrHelp.baseExperience.camera.rotate

                        if (this.xr?.baseExperience)
                            this.xr.baseExperience.camera.setTransformationFromNonVRCamera(this.camera,true);
                        //this.xr.baseExperience.camera.rotationQuaternion = bjs.Quaternion.FromEulerVector(new bjs.Vector3(0,Math.PI/2,0));
                        break;
                }
            })    
        }

        
/*
       this.xr = await this.bjsScene.createDefaultXRExperienceAsync({}).then((xrHelp) => {
        floorMeshes: [this.ground]
        xrHelp.baseExperience.onStateChangedObservable.add((state) => {
            switch (state) {
                case bjs.WebXRState.IN_XR:
                    // Start XR camera facing forward, not tilt.
                    //xrHelp.baseExperience.camera.rotate
                    xrHelp.baseExperience.camera.rotationQuaternion = bjs.Quaternion.FromEulerVector(new bjs.Vector3(0,Math.PI,0));
                    //this.bjsScene.activeCamera.position = new bjs.Vector3(0,1,0);
                    break;
            }
        })
        
    });
    */

        /*
        this.xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
            this.xr.baseExperience.camera.setTransformationFromNonVRCamera(this.camera);
        });
        */

       

    }

    protected onPreRender()
    { 
       
    }

    protected onRender()
    {
       
      
            
    }
}
