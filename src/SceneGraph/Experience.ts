import { IScene, IExperience } from './SceneGraphInterfaces';
import { Scene } from './Scene';
import * as bjs from 'babylonjs';
import { SceneManager } from './SceneManager';
import { AssetManager } from './AssetManager';
import { ViewportPosition } from "./Enums";
import {LoadAssetHandler} from './Procs';

export class Experience implements IExperience
{
    scenes: Array<IScene<bjs.Camera>> = new Array<Scene<bjs.Camera>>();
    public isAssetLoaded: boolean = false;

    public loadExperienceAssetCallback: Function;
    public loadFirstSceneAssetCallback: Function;

    public assetsPath = [
        {type: 'mesh', name:'Font_Conthrax_New', url: '/', fileName: 'Font_Conthrax_New.babylon'}
    ];

    constructor(public title: string, public canvas: HTMLCanvasElement) {
    } 

    public load()
    {
        // this.onLoad();
        this.loadAssets((tasks) => {
            this.loadExperienceAssetCallback(1);
            this.onLoad();
        });
    }

    public unload()
    {
        this.onUnload();
        this.unloadAssets();
    }

    protected onLoad()
    {

    }

    protected onUnload()
    {
     
    }

    public loadAssets(callback?: LoadAssetHandler)
    {
        let emptyScene: Scene<bjs.Camera> = new Scene<bjs.Camera>('emptyScene', this.canvas, undefined);
        SceneManager.Instance.LoadScene(emptyScene, this.canvas, ViewportPosition.Top);
        AssetManager.Instance.init(emptyScene);
       
        AssetManager.Instance.load(this.assetsPath, callback);
    }

    public unloadAssets()
    {
        AssetManager.Instance.unload(this.assetsPath);
    }

    public AddScene(scene: IScene<bjs.Camera>)
    {
        this.scenes.push(scene);
    }

    public RemoveScene(name: string) {
        this.scenes = this.scenes.filter((se: IScene<bjs.Camera>) => se['name'] !== name);
    }
}
