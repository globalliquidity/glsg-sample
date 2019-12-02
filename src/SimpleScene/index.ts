import { Scene } from '../glsg';
import * as bjs from 'babylonjs';
import { SpinningCylinderThing } from './Elements/SpinningCylinderThing';
import { SineWaveScrollerValueField } from './Elements/SineWaveScrollerValueField';

export class SimpleScene extends Scene
{
    cylinders: SpinningCylinderThing;
    field: SineWaveScrollerValueField;
    cameraOrbitSpeed: number = 0.001;

    protected async createScene()
    {
        this.field = new SineWaveScrollerValueField("value field",
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
        this.camera.position = new bjs.Vector3(0, 0, 250);
        this.AddSceneElement(this.field);

        // cylinders
        this.cylinders = new SpinningCylinderThing('cylinder', 0, 0, 0, this);
        this.AddSceneElement(this.cylinders);
        this.camera.setTarget(this.cylinders.position);
    }

    protected onPreRender()
    { 
        //this.camera.alpha -= this.cameraOrbitSpeed;
    }
}
