
import * as bjs from 'babylonjs';
import { SpinningCylinderThing } from './Elements/SpinningCylinderThing';
import { SineWaveScrollerVectorField } from './Elements/SineWaveScrollerValueField';
import { TextMeshString } from '../glsg/lib/TextMeshString';
import { TextMeshModelLoader } from '../glsg/lib/TextMeshModelLoader';
import { VRScene } from '../glsg/lib/VRScene';
import { WaterFloor } from './Elements/WaterFloor';

export class SimpleSceneVR extends VRScene
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
                                                    0,    //x
                                                    -0.5,    //y
                                                    0,    //z
                                                    this,   //scene
                                                    bjs.MeshBuilder.CreateBox("box", { height: 1, width: 1, depth: 1 }, this.bjsScene),
                                                    16,     //rows
                                                    16,      //columns
                                                    10,      //cellwidth
                                                    1,      //cellHeight
                                                    10,     //cellDepth
                                                    0.9,   //mesh size
                                                    -1,     //speed
                                                    0.1,    //frequency
                                                    0);     //amplitude

        this.field.rotation.y = Math.PI / 2;
        //this.camera.position =  new bjs.Vector3(0, 0, -200);
        
        this.AddSceneElement(this.field);

        // cylinders
        //this.cylinders = new SpinningCylinderThing('cylinder', 0, 0, 0, this);
        //this.AddSceneElement(this.cylinders);

        //this.text = new TextMeshString("text",0,20,0,this,"COINBASE");
        //await this.text.create();
        //this.AddSceneElement(this.text);

        //const environment = this.bjsScene.createDefaultEnvironment();
        //this.bjsScene.environmentTexture = this.hdrTexture;
        //this.bjsScene.createDefaultSkybox(this.hdrTexture, true, 1000, 0.7);

        var light = new bjs.DirectionalLight("DirectionalLight", new bjs.Vector3(0, -1, 0), this.bjsScene);

        const xr = await this.bjsScene.createDefaultXRExperienceAsync({
            floorMeshes: [this.field.mesh]
        });
        
    }

    protected onPreRender()
    { 
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}