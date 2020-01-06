import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { ISceneElement } from './SceneGraphInterfaces';

export class SceneElement extends bjs.TransformNode implements ISceneElement
{
    public scene: Scene;
    sceneElements: Array<ISceneElement>;
    isCreated : boolean = false;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene)
    {
        super(name,scene.bjsScene);
        this.scene = scene;
        this.position = new bjs.Vector3(x, y, z);
        this.sceneElements = new Array<SceneElement>();
    }

    public create()
    {
        this.onCreate();
        this.isCreated = true;
    }

   
    public preRender()
    {
        if (this.isCreated)
        {
            this.sceneElements.forEach( e => { e.preRender() });
            this.onPreRender();
        }
    }

    public render()
    {
        if (this.isCreated)
        {
            this.sceneElements.forEach( e => { e.render() });
            this.onRender();
        }
    }

    public addChild(element: SceneElement)
    {
        element.parent = this;
        this.sceneElements.push(element);
    }

    public dispose()
    {
        this.onDisposing();
    }

    protected onCreate()
    {
        
    }

    protected onPreRender()
    {
    }

    protected onRender()
    {
    }


    protected onDisposing()
    {
    }
}
