
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

export class SimpleSceneVR extends VRScene
{
    cylinders: SpinningCylinderThing;
    field: SineWaveScrollerVectorField;
    text : TextMeshString;
    clouds : CloudFloor;

    car : bjs.TransformNode;
    cockpit : bjs.TransformNode;
    helmet : bjs.TransformNode;

    chart : Chart2D;
    chartPresenter : Chart2DPresenter;
    chartData : Chart2DDataSource;

    screen : VideoScreen;

    cameraOrbitSpeed: number = 0.001;


    private cameraHomeBeta : number = Math.PI / 2  - (Math.PI)/32;

    protected async createScene()
    {
        await TextMeshModelLoader.Instance.init(this);

        this.camera.radius = 5;
        this.camera.minZ = 0.01;
        //this.camera.position.y = 1;
        //this.camera.alpha  = -Math.PI / 2;
        this.camera.beta = Math.PI / 2;
        this.camera.wheelPrecision = 150;

       
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

    


        //this.car.isVisible = false;

        //this.car.scaling = new bjs.Vector3(0.1,0.1,0.1);
        
        this.field = new SineWaveScrollerVectorField("value field",
                                                    0,    //x
                                                    -1.5,    //y
                                                    0,    //z
                                                    this,   //scene
                                                    bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.bjsScene),
                                                    16,     //rows
                                                    16,      //columns
                                                    10,      //cellwidth
                                                    1,      //cellHeight
                                                    10,     //cellDepth
                                                    0.9,   //mesh size
                                                    -2,     //speed
                                                    0.1,    //frequency
                                                    0);     //amplitude

        this.field.rotation.y = Math.PI / 2;
        //this.camera.position =  new bjs.Vector3(0, 0, -200);
        
        this.AddSceneElement(this.field);


        ////CHARTING

        this.chartPresenter = new Chart2DPresenter();
        this.chartData = new Chart2DDataSource(this.chartPresenter,1.0);
       
        this.chart = new Chart2D("chart",-10,-1,0,this,this.chartPresenter);
        this.AddSceneElement(this.chart);

        this.screen = new VideoScreen("screen", -10,1,0,this);
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

        
        // cylinders
        this.cylinders = new SpinningCylinderThing('cylinder', 0, 0, 0, this);
        this.cylinders.rotate(new bjs.Vector3(0,1,0),Math.PI/2);
        this.cylinders.position = new bjs.Vector3(-20,-1,0)
        this.cylinders.scaling = new bjs.Vector3(0.1,0.1,0.1);
        this.AddSceneElement(this.cylinders);
        

        //this.text = new TextMeshString("text",0,20,0,this,"COINBASE");
        //await this.text.create();
        //this.AddSceneElement(this.text);

        //const environment = this.bjsScene.createDefaultEnvironment();
        //this.bjsScene.environmentTexture = this.hdrTexture;
        //this.bjsScene.createDefaultSkybox(this.hdrTexture, true, 1000, 0.7);

        //var light = new bjs.DirectionalLight("DirectionalLight", new bjs.Vector3(0.5, -1, 0), this.bjsScene);

        //var defaultPipeline = new bjs.DefaultRenderingPipeline("default", true, this.bjsScene, [this.camera]);

        const xr = await this.bjsScene.createDefaultXRExperienceAsync({
            floorMeshes: [this.field.mesh]
        });
        
    }

    protected onPreRender()
    { 
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}