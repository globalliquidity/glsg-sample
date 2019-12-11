
import * as bjs from 'babylonjs';
import { Vector3 } from 'babylonjs';
import { Scene } from '../../glsg';
import { PieMenuElement } from '../Elements/PieMenuElement';
const CANNON = require('cannon');
const OIMO = require('oimo');
const AMMO = require('ammo');

export class PieMenuScene extends Scene
{
    itemCount : number = 8;
    menu:PieMenuElement
    menuPosition : Vector3 = new Vector3(0,0,0);

    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture: string) {
        super(title,canvas,hdrSkyboxTexture);
    } 
    
    protected async createScene()
    {
        //this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 15, new bjs.Vector3(0.0, 0, 100), this.bjsScene);
        this.camera.radius = 20;

        this.bjsScene.gravity = new bjs.Vector3(0, 0, 0);
        this.bjsScene.enablePhysics(null, new bjs.CannonJSPlugin(true, undefined, CANNON));
        this.bjsScene.enablePhysics(null, new bjs.OimoJSPlugin(undefined, OIMO));
        // this.bjsScene.enablePhysics(null, new bjs.AmmoJSPlugin(true, AMMO));

        var light = new bjs.HemisphericLight("sun", new bjs.Vector3(0,1,0), this.bjsScene);

        this.menu = new PieMenuElement("menu",
                                        this.menuPosition.x,
                                        this.menuPosition.y,
                                        this.menuPosition.z,
                                        this,
                                        this.itemCount);  
        this.AddSceneElement(this.menu);                                                            
    }

    protected onRender()
    { 

    }
}
