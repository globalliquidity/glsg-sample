import { IScene, IExperience } from './SceneGraphInterfaces';
import { Scene } from './Scene';
import * as bjs from 'babylonjs';

export class Experience implements IExperience
{
    scenes: Array<IScene<bjs.Camera>> = new Array<Scene<bjs.Camera>>();
  
    constructor(public title: string, public canvas: HTMLCanvasElement) {
    } 

    public load()
    {
        this.onLoad();
    }

    public unload()
    {
        this.onUnload();
    }

    protected onLoad()
    {

    }

    protected onUnload()
    {
     
    }

    public AddScene(scene: IScene<bjs.Camera>)
    {
        this.scenes.push(scene);
    }

    public RemoveScene(name: string) {
        this.scenes = this.scenes.filter((se: IScene<bjs.Camera>) => se['name'] !== name);
    }
}
