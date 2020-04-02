
import * as bjs from 'babylonjs';
import 'babylonjs-loaders';
import { SpinningCylinderThing } from './Elements/SpinningCylinderThing';
import { SineWaveScrollerVectorField } from './Elements/SineWaveScrollerValueField';
import { TextMeshString } from '../glsg/lib/TextMeshString';
import { TextMeshModelLoader } from '../glsg/lib/TextMeshModelLoader';
import { VRScene } from '../glsg/lib/VRScene';
import { CloudFloor } from './Elements/CloudFloor';
import SimpleSceneConstants from './constants';
import { Chart2D } from './Elements/Chart2D';
import { Chart2DPresenter } from './Elements/Chart2DPresenter';
import { Chart2DDataSource } from './Elements/Chart2DataSource';
import { VideoScreen } from './Elements/VideoScreen';
import { AssetManager } from '../glsg/lib/AssetManager';

export class SimpleSceneVR extends VRScene
{
    ground : bjs.Mesh;
    checkerMaterial : bjs.StandardMaterial;
    groundMaterial : bjs.PBRMaterial;
    ceramicTileMateral : bjs.PBRMaterial;
    lavaMaterial : bjs.PBRMaterial;

    cylinders: SpinningCylinderThing;
    field: SineWaveScrollerVectorField;
    text : TextMeshString;
    clouds : CloudFloor;

    car : bjs.TransformNode;
    cockpit : bjs.TransformNode;
    helmet : bjs.TransformNode;
    hemisphere : bjs.TransformNode;
    desk : bjs.TransformNode;

    chart : Chart2D;
    chartPresenter : Chart2DPresenter;
    chartData : Chart2DDataSource;

    screen : VideoScreen;

    cameraOrbitSpeed: number = 0.001;


    private cameraHomeBeta : number = Math.PI / 2  - (Math.PI)/32;

    protected async createScene()
    {
        await TextMeshModelLoader.Instance.init(this);

        this.camera.radius = 0.1;
        this.camera.minZ = 0.01;
        //this.camera.position.y = 1;
        this.camera.alpha  = -Math.PI / 2;
        this.camera.beta = Math.PI / 2;
        this.camera.fov = 1.2;
        this.camera.wheelPrecision = 150;
        this.camera.angularSensibilityX = 15000;
        this.camera.angularSensibilityY = 15000;


       
        //chartCanvas.
        //chartImage.

        //this.clouds = new CloudFloor("Clouds",0,0,0, this);
        //this.AddSceneElement(this.clouds);

        /*
        bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.carModel , this.bjsScene, newMeshes => {
            console.log("Importing " + newMeshes.length + " meshes");
            this.car = newMeshes[0].instantiateHierarchy();
            this.car.rotation.y = Math.PI;
            this.car.position = new bjs.Vector3(-2,-1,2)
            this.car.scaling = new bjs.Vector3(0.015,0.015,0.015);
            

            newMeshes[0].isVisible = false;
            var hierarchy = newMeshes[0].getChildMeshes(false);
            hierarchy.forEach( item => { item.isVisible = false;})
        });

        */

/*
            bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.cockpitModel , this.bjsScene, newMeshes => {
            console.log("Importing " + newMeshes.length + " meshes");
            this.cockpit = newMeshes[0].instantiateHierarchy();
            //this.cockpit.rotation.y = Math.PI/8;
            this.cockpit.rotate(new bjs.Vector3(0,1,0),Math.PI/2);
            //this.car.position = new bjs.Vector3(-2,-1,2)
            this.cockpit.scaling = new bjs.Vector3(0.01,0.01,0.01);
            

            newMeshes[0].isVisible = false;
            var hierarchy = newMeshes[0].getChildMeshes(false);
            hierarchy.forEach( item => { item.isVisible = false;})
        });
*/
/*
    bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.dojoModel , this.bjsScene, newMeshes => {
        console.log("Importing " + newMeshes.length + " meshes");
        this.cockpit = newMeshes[0].instantiateHierarchy();
        //this.cockpit.rotation.y = Math.PI/8;
        this.cockpit.rotate(new bjs.Vector3(0,1,0),-Math.PI/2);
        this.cockpit.position = new bjs.Vector3(0,-1,0)
        this.cockpit.scaling = new bjs.Vector3(1,1,1);

        newMeshes[0].isVisible = false;
        var hierarchy = newMeshes[0].getChildMeshes(false);
        hierarchy.forEach( item => { item.isVisible = false;})
    });
    */


   var grid = {
    'h' : 24,
    'w' : 24
};

    //var light = new bjs.PointLight("Omni", new bjs.Vector3(-60, 60, 80), this.bjsScene);
    //var gl = new bjs.GlowLayer("glow", this.bjsScene);
    //this.ground = bjs.MeshBuilder.CreateTiledGround("Tiled Ground", {xmin: -25, zmin: -25, xmax: 25, zmax: 25, subdivisions: grid}, this.bjsScene);

    this.ground = bjs.MeshBuilder.CreateTiledGround("Tiled Ground", {xmin: -25, zmin: -25, xmax: 25, zmax: 25, subdivisions: grid}, this.bjsScene);
    //this.ground = bjs.Mesh.CreateGround("ground1", 6, 6, 10, this.bjsScene);
    //this.ground = bjs.MeshBuilder.CreateGround("ground1", {width: 20, height: 20, subdivisions: 25}, this.bjsScene);
    this.groundMaterial = new bjs.PBRMaterial("Mat", this.bjsScene);   

    //var plane = bjs.Mesh.CreatePlane("plane", 120,this.bjsScene);
   // plane.position.y = -5;
    //plane.rotation.x = Math.PI / 2;
    
    /*
    this.groundMaterial.albedoTexture = AssetManager.Instance.textureMap.get("linoleumAlbedo");
    this.groundMaterial.bumpTexture = AssetManager.Instance.textureMap.get("linoleumNormal");
    this.groundMaterial.metallicTexture = AssetManager.Instance.textureMap.get("linoleumORM");
    this.groundMaterial.useAmbientOcclusionFromMetallicTextureRed = true;
    this.groundMaterial.useMetallnessFromMetallicTextureBlue = true;
    this.groundMaterial.useRoughnessFromMetallicTextureGreen = true;
    */


    this.lavaMaterial = new bjs.PBRMaterial("Mat", this.bjsScene);
    this.lavaMaterial.albedoTexture = AssetManager.Instance.textureMap.get("lavaAlbedo");
    this.lavaMaterial.bumpTexture = AssetManager.Instance.textureMap.get("lavaNormal");
    this.lavaMaterial.metallicTexture = AssetManager.Instance.textureMap.get("lavaARM");
    this.lavaMaterial.useMetallnessFromMetallicTextureBlue = true;
    this.lavaMaterial.useRoughnessFromMetallicTextureGreen = true;
    this.lavaMaterial.emissiveColor = bjs.Color3.White();
    this.lavaMaterial.emissiveTexture = AssetManager.Instance.textureMap.get("lavaEmissive");


    this.ceramicTileMateral = new bjs.PBRMaterial("tile", this.bjsScene);
    this.ceramicTileMateral.albedoTexture = AssetManager.Instance.textureMap.get("ceramicTileAlbedo");
    //this.ceramicTileMateral.roughness = 1;
    this.ceramicTileMateral.bumpTexture = AssetManager.Instance.textureMap.get("ceramicTileNormal");
    this.ceramicTileMateral.metallicTexture = AssetManager.Instance.textureMap.get("ceramicTileARM");
    this.ceramicTileMateral.useMetallnessFromMetallicTextureBlue = true;
    this.ceramicTileMateral.useRoughnessFromMetallicTextureGreen = true;
   
    this.ground.material = this.ceramicTileMateral;
    this.ground.position = new bjs.Vector3(0,-2.5,0);
     

    bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.hemisphereModel , this.bjsScene, newMeshes => {
        console.log("Importing " + newMeshes.length + " meshes");
        this.hemisphere = newMeshes[0].instantiateHierarchy();
        //this.cockpit.rotation.y = Math.PI/8;
        this.hemisphere.rotate(new bjs.Vector3(0,1,0),-Math.PI/2);
        this.hemisphere.position = new bjs.Vector3(0,-2,0)
        this.hemisphere.scaling = new bjs.Vector3(0.05,0.05,0.05);

        newMeshes[0].isVisible = false;
        var hierarchy = newMeshes[0].getChildMeshes(false);
        hierarchy.forEach( item => { item.isVisible = false;})
    });

    bjs.SceneLoader.ImportMesh("", SimpleSceneConstants.rootURL, SimpleSceneConstants.deskModel , this.bjsScene, newMeshes => {
        console.log("Importing " + newMeshes.length + " meshes");
        this.desk = newMeshes[0].instantiateHierarchy();
        //this.cockpit.rotation.y = Math.PI/8;
        //this.desk.rotate(new bjs.Vector3(0,1,0),-Math.PI/2);
        this.desk.position = new bjs.Vector3(0,-0.75,-0.23);
        this.desk.rotate(bjs.Axis.Y, (Math.PI/2) + (Math.PI/8), bjs.Space.WORLD);
        this.desk.scaling = new bjs.Vector3(.0075,.0075,.0075);

        newMeshes[0].isVisible = false;
        var hierarchy = newMeshes[0].getChildMeshes(false);
        hierarchy.forEach( item => { item.isVisible = false;})

    });

    


        //this.car.isVisible = false;

        //this.car.scaling = new bjs.Vector3(0.1,0.1,0.1);
        
        this.field = new SineWaveScrollerVectorField("value field",
                                                    0,    //x
                                                    -1.25,    //y
                                                    5,    //z
                                                    this,   //scene
                                                    bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.bjsScene),
                                                    30,     //rows
                                                    40,      //columns
                                                    0.33,      //cellwidth
                                                    0.1,      //cellHeight
                                                    0.33,     //cellDepth
                                                    0.9,   //mesh size
                                                    1,     //speed
                                                    0.2,    //frequency
                                                    0.33);     //amplitude

       // this.field.rotation.y = Math.PI / 2;
        //this.camera.position =  new bjs.Vector3(0, 0, -200);
        
        this.AddSceneElement(this.field);


        ////CHARTING

        this.chartPresenter = new Chart2DPresenter();
        this.chartData = new Chart2DDataSource(this.chartPresenter,1.0);
       
        this.chart = new Chart2D("chart",10.5,4,17,this,this.chartPresenter);
        this.chart.scaling = new bjs.Vector3(4.5,4.5,4.5);
        this.chart.rotate(bjs.Axis.Y, (Math.PI/6), bjs.Space.WORLD);
        this.chart.rotate(bjs.Axis.X, -(Math.PI/8), bjs.Space.LOCAL);

        //this.chart.rotate(bjs.Axis.X,(-Math.PI/6), bjs.Space.WORLD);
        //this.chart.rotate(bjs.Axis.Y, -(Math.PI/6), bjs.Space.WORLD);
        ///this.chart.rotate(bjs.Axis.X, (Math.PI/6), bjs.Space.WORLD);

        this.AddSceneElement(this.chart);

        
        this.screen = new VideoScreen("screen", -10.5,-1.25,17,this);
        this.screen.scaling = new bjs.Vector3(2.25,2.25,2.25);
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

        const xr = await this.bjsScene.createDefaultXRExperienceAsync({
            //floorMeshes: [this.field.mesh]
        });
        
    }

    protected onPreRender()
    { 
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}