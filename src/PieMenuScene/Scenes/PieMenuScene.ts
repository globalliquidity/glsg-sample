
import * as bjs from 'babylonjs';
import { Vector3 } from 'babylonjs';
import { Scene } from '../../glsg';
import { PieMenuElement } from '../Elements/PieMenuElement';
import { TextMeshModelLoader } from '../../glsg/lib/TextMeshModelLoader';
import { TextMeshString } from '../../glsg/lib/TextMeshString';
const CANNON = require('cannon');
const OIMO = require('oimo');

export class PieMenuScene extends Scene
{
    itemCount : number = 10;
    menu:PieMenuElement
    //menuPosition : Vector3 = new Vector3(-4,3.15,0);
    //menuPosition : Vector3 = new Vector3(-4.25,4.25,10);
    menuPosition : Vector3 = new Vector3(-1.5,0,0);

    centerBox : bjs.Mesh;
    glowLayer : bjs.GlowLayer;
    glowEnabled : boolean = false;



    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture: string) {
        super(title,canvas,hdrSkyboxTexture);
    } 
    
    protected async createScene()
    {

        this.bjsScene.imageProcessingConfiguration.contrast = 1.6;
        this.bjsScene.imageProcessingConfiguration.exposure = 0.6;
        this.bjsScene.imageProcessingConfiguration.toneMappingEnabled = true;

        if (this.glowEnabled)
            this.glowLayer = new bjs.GlowLayer("glow", this.bjsScene, { mainTextureSamples: 2 });

        var helper = this.bjsScene.createDefaultEnvironment();
        helper.setMainColor(BABYLON.Color3.Gray());
        

        await TextMeshModelLoader.Instance.init(this);
        //this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 15, new bjs.Vector3(0.0, 0, 100), this.bjsScene);

        //let canvasAspectRatio = (this.canvas.clientWidth/this.canvas.clientHeight);
        let aspectRatio = ( this.canvas.clientHeight * this.camera.viewport.height) / ( this.canvas.clientWidth * this.camera.viewport.width);

        this.camera.radius = 10;
       
        /*
        this.camera.mode = bjs.Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 5 * aspectRatio;
        this.camera.orthoBottom = -5 * aspectRatio;
        this.camera.orthoLeft = -5;
        this.camera.orthoRight = 5;
    */
        this.camera.setTarget(bjs.Vector3.Zero());

        //let testString : TextMeshString = new TextMeshString("test",0,0,5,this,"GLSG");
        //this.AddSceneElement(testString);
        

        this.bjsScene.gravity = new bjs.Vector3(0, 0, 0);
        this.bjsScene.enablePhysics(this.bjsScene.gravity, new bjs.CannonJSPlugin(true, undefined, CANNON));
        //this.bjsScene.enablePhysics(this.bjsScene.gravity, new bjs.OimoJSPlugin());
        this.bjsScene.collisionsEnabled = true;
		//this.bjsScene.workerCollisions = true;


        var light = new bjs.HemisphericLight("sun", new bjs.Vector3(0,1,0), this.bjsScene);

        this.menu = new PieMenuElement("menu",
                                        this.menuPosition.x,
                                        this.menuPosition.y,
                                        this.menuPosition.z,
                                        this,
                                        this.itemCount);
        //this.menu.rotation.y = Math.PI/8;  
        this.AddSceneElement(this.menu);
        this.camera.wheelPrecision = 15;
        
        //this.centerBox = bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.bjsScene);
    }

    protected onRender()
    { 
        /*
        let aspectRatio = ( this.canvas.clientHeight * this.camera.viewport.height) / ( this.canvas.clientWidth * this.camera.viewport.width);

        this.camera.radius = 10;
       
        this.camera.mode = bjs.Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 5 * aspectRatio;
        this.camera.orthoBottom = -5 * aspectRatio;
        this.camera.orthoLeft = -5;
        this.camera.orthoRight = 5;
        this.camera.setTarget(bjs.Vector3.Zero());
        */
    }
}
