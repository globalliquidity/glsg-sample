import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { ISceneElement } from './SceneGraphInterfaces';

export class SceneElement extends bjs.TransformNode implements ISceneElement
{
    public scene: Scene;
    sceneElements: Array<ISceneElement>;

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene)
    {
        super(name,scene.bjsScene);
        this.scene = scene;
        this.position = new bjs.Vector3(x, y, z);
        this.sceneElements = new Array<SceneElement>();
    }

    protected create()
    {
    }

    protected onPreRender()
    {
    }

    protected onRender()
    {
    }

    public preRender()
    {
        this.sceneElements.forEach( e => { e.preRender() });
        this.onPreRender();
    }

    public render()
    {
        this.sceneElements.forEach( e => { e.render() });
        this.onRender();
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

    protected onDisposing()
    {
    }
}
