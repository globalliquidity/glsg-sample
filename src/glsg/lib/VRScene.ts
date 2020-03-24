import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import Logger from './Logger';

export class VRScene extends Scene<bjs.FreeCamera>
{a
    light: bjs.PointLight | undefined;
   
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
        this.camera = new bjs.FreeCamera("Camera",new bjs.Vector3(0, 0, 0), this.bjsScene);     
        //this.camera.attachControl(this.canvas, true); 
    }

    protected async createScene()
    {
       
    }

    protected onPreRender()
    {
    }
    
    protected onRender()
    {
    }
}