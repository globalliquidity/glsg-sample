import * as bjs from 'babylonjs';
import { Scene, SceneElement } from '../../glsg';
import { createChart, IChartApi } from 'lightweight-charts';
import { ActiveModel } from '../../glsg/lib/ActiveModel';
import { Chart2DData } from './Chart2DData';
import { Chart2DPresenter } from './Chart2DPresenter';

export class Screen2D extends SceneElement
{
    public plane: bjs.Mesh;
    private screenMaterial : bjs.StandardMaterial;
    private screenTexture : bjs.Texture;
    private textureResolution : number = 1024;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>, image : bjs.Texture)
    {
        super(name, x, y, z, scene);
        this.screenTexture = image;
        this.create();
    }

    protected onCreate()
    {
       
        this.screenMaterial = new bjs.StandardMaterial("chartMaterial", this.scene.bjsScene);
        this.screenTexture = new bjs.DynamicTexture("chartTexture",this.textureResolution,this.scene.bjsScene,false);

       
        console.log("Chart2D : Creating Chart2D");

        this.plane = bjs.MeshBuilder.CreatePlane("chartPlane",{width: 4, size:2.5}, this.scene.bjsScene);
        this.screenMaterial.emissiveTexture = this.screenTexture;
        this.plane.material = this.screenMaterial;
        this.screenMaterial.alpha = 0.9;
        this.plane.parent = this;
        
        //this.plane.rotate(new bjs.Vector3(1,0,0),-Math.PI/2);
        //this.plane.rotate(new bjs.Vector3(0,1,0),-Math.PI/2);
        //this.plane.rotate(new bjs.Vector3(0,0,1),-Math.PI/2);
    }

    protected onPreRender()
    {
      
    }
}
