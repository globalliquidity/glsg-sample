import { Scene } from '../glsg';
import * as bjs from 'babylonjs';
import { SpinningCylinderThing } from './Elements/SpinningCylinderThing';
import { SineWaveScrollerVectorField } from './Elements/SineWaveScrollerValueField';
import { TextMeshString } from '../glsg/lib/TextMeshString';
import { TextMeshModelLoader } from '../glsg/lib/TextMeshModelLoader';

export class SimpleScene extends Scene
{
    cylinders: SpinningCylinderThing;
    field: SineWaveScrollerVectorField;
    text : TextMeshString;
    
    cameraOrbitSpeed: number = 0.001;
    private cameraHomeBeta : number = Math.PI / 2  - (Math.PI)/32;



    protected async createScene()
    {
        await TextMeshModelLoader.Instance.init(this);
        
        this.field = new SineWaveScrollerVectorField("value field",
                                                    -200,    //x
                                                    0,    //y
                                                    0,    //z
                                                    this,   //scene
                                                    bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.bjsScene),
                                                    64,     //rows
                                                    64,      //columns
                                                    10,      //cellwidth
                                                    4,      //cellHeight
                                                    10,     //cellDepth
                                                    0.9,   //mesh size
                                                    -0.5,     //speed
                                                    0.2,    //frequency
                                                    5);     //amplitude

        this.field.rotation.y = Math.PI / 2;
        this.camera.position = new bjs.Vector3(0, 0, -250);
        this.AddSceneElement(this.field);

        // cylinders
        this.cylinders = new SpinningCylinderThing('cylinder', 0, 0, 0, this);
        this.AddSceneElement(this.cylinders);

        this.text = new TextMeshString("text",0,20,0,this,"COINBASE");
        //await this.text.create();
        this.AddSceneElement(this.text);

        
        this.camera.setTarget(this.cylinders.position);
        this.camera.beta = this.cameraHomeBeta;
        this.camera.upperBetaLimit =  Math.PI / 2 - (Math.PI)/96;
    }

    protected onPreRender()
    { 
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}
