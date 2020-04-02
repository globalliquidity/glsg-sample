import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import Logger from './Logger';

export class VRScene extends Scene<bjs.ArcRotateCamera>
{
    light: bjs.HemisphericLight | undefined;
   
    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture: string)
    {
        super(title,canvas,hdrSkyboxTexture);
    }

    public aspectRatio() : number
    {
        if (this.camera) {
            return this.camera.viewport.height / this.camera.viewport.width;
        }

        return 1;
    }

    protected onUnload()
    {
        super.onUnload();
    }

    protected async setupCamera()
    {
        Logger.log("Standard Scene : Creating ArcRotateCamera");
        this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 5, new bjs.Vector3(0.0, 1, 0), this.bjsScene);
        //this.camera.
        //this.camera = new bjs.ArcRotateCamera("Camera",new bjs.Vector3(0, 0, 0), this.bjsScene);     
        this.camera.attachControl(this.canvas, true); 
    }

    protected async createScene()
    {
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
       // this.light = new bjs.HemisphericLight("light", new bjs.Vector3(0, 1, 0), this.bjsScene);

        // Default intensity is 1. Let's dim the light a small amount
        //this.light.intensity = 0.7;

       
    }

    protected onPreRender()
    {
    }
    
    protected onRender()
    {
    }
}