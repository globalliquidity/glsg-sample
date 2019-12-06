import { IScene, IExperience } from './SceneGraphInterfaces';
import { Scene } from './Scene';

export class Experience implements IExperience
{
    scenes: Array<IScene> = new Array<Scene>();
  
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

    public AddScene(scene: IScene)
    {
        this.scenes.push(scene);
    }

    public RemoveScene(name: string) {
        this.scenes = this.scenes.filter((se: IScene) => se['name'] !== name);
    }
}
