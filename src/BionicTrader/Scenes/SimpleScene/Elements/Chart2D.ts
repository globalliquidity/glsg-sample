import * as bjs from 'babylonjs';
import { Scene } from '../../../../SceneGraph/Scene';
import { SceneElement } from '../../../../SceneGraph/SceneElement';
import { createChart, IChartApi } from 'lightweight-charts';
import { ActiveModel } from '../../../../SceneGraph/ActiveModel';
import { Chart2DUpdateMessage } from './Chart2DUpdateMessage';
import { Chart2DPresenter } from './Chart2DPresenter';
import { Chart2DData } from './Chart2DData';

export class Chart2D extends SceneElement
{
    public box : bjs.Mesh;
    public plane: bjs.Mesh;
    private chartMaterial : bjs.StandardMaterial;
    private chartTexture : bjs.DynamicTexture;
    private textureResolution : number = 512;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>, public presenter : Chart2DPresenter)
    {
        super(name, x, y, z, scene);
        this.create();
    }

    protected onCreate()
    {
        this.chartMaterial = new bjs.StandardMaterial("chartMaterial", this.scene.bjsScene);
        this.chartTexture = new bjs.DynamicTexture("chartTexture",this.textureResolution,this.scene.bjsScene,false);
        console.log("Chart2D : Creating Chart2D");

        this.plane = bjs.MeshBuilder.CreatePlane("chartPlane",{width: 4, size:2.5}, this.scene.bjsScene);
        this.chartMaterial.emissiveTexture = this.chartTexture;
        this.plane.material = this.chartMaterial;
        this.chartMaterial.alpha = 0.9;
        this.plane.parent = this;
        
        //this.plane.rotate(new bjs.Vector3(1,0,0),-Math.PI/2);
        //this.plane.rotate(new bjs.Vector3(0,1,0),-Math.PI/2);
        //this.plane.rotate(new bjs.Vector3(0,0,1),-Math.PI/2);
    }

    protected onPreRender()
    {
        if (this.presenter.hasData)
        {
            // console.log("Chart2D : Presenter has data");
            let chartCanvas : HTMLCanvasElement = this.presenter.chartCanvas;

            if (chartCanvas != null)
            {
                // console.log("Chart2D : Drawing Chart");
                let chartImage : HTMLImageElement = new Image(512,512);
                chartImage.src = chartCanvas.toDataURL();
            
                chartImage.onload = () => {
                    let textureContext : CanvasRenderingContext2D = this.chartTexture.getContext();
                    textureContext.drawImage(chartImage,0,0);
                    this.chartTexture.update();
                    this.presenter.hasData = false;
                }
            }
        }
        else
        {
            //console.log("Chart2D : Presenter has no data");
        }
    }
}
