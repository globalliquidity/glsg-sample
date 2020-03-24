import { SceneManager, Scene } from '../glsg';

import { Experience } from '../glsg/lib/Experience';
import { ViewportPosition } from '../glsg/lib/Enums';
import { SimpleScene } from './SimpleScene';
import { SimpleSceneVR } from './SimpleSceneVR';
import { StandardScene } from '../glsg/lib/StandardScene';


export class SimpleExperience extends Experience
{

    constructor(public title: string, public canvas: HTMLCanvasElement, public useVR : boolean) {

        super(title,canvas);
    }
    
    

    protected onLoad()
    {
        let scene: StandardScene = null;
        
        if (this.useVR)
        {
           scene = new SimpleSceneVR(`SimpleScene${this.scenes.length}`, this.canvas, "simpleDDS1");
        }
        else
        {
            scene = new SimpleScene(`SimpleScene${this.scenes.length}`, this.canvas, "simpleDDS1");
  
        }
        
        this.AddScene(scene);
        
        SceneManager.Instance.LoadScene(scene, this.canvas, ViewportPosition.Full);
        
    }
}
