import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import Logger from '../Utils/Logger';

export class StandardScene extends Scene<bjs.ArcRotateCamera>
{
    //light: bjs.PointLight | undefined;
   
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
        this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 0, new bjs.Vector3(0, 0, 0), this.bjsScene);

        if (this.camera && this.bjsScene)
        {
            this.camera.alpha  = -Math.PI / 2;
            this.camera.beta = Math.PI / 2;       
            this.camera.attachControl(this.canvas, true);
            //this.bjsScene.activeCameras = [this.camera];    
        }   
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