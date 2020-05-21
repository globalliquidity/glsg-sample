import * as bjs from 'babylonjs';
import { SceneElement } from './SceneElement';
import { IScene, ISceneElement, ISceneDataSource, ISceneDataSink } from './SceneGraphInterfaces';
import Logger from '../Utils/Logger';
import { generateSkybox, generateEmptySkybox } from './Utils';
import { ddsGc256SpecularHDR } from './Assets';

import { AssetManager } from './AssetManager';
import {LoadAssetHandler} from './Procs';

export class Scene<C extends bjs.Camera> implements IScene<bjs.Camera>
{
    engine : bjs.Engine | undefined;
    bjsScene!: bjs.Scene;
    camera!: C;
    //light: bjs.PointLight | undefined;
    hdrTexture: bjs.CubeTexture | undefined;
    hdrSkybox: bjs.Mesh | undefined;
    sceneElements: Array<ISceneElement> = new Array<SceneElement>();
    hdrSkyboxTexture: string | undefined;

    isAssetLoaded: boolean = false;
    callback: Function | undefined;

    assetsPath: Array<Object> = [];

    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture? : string) {
        this.hdrSkyboxTexture = hdrSkyboxTexture;
    }

    public load(engine : bjs.Engine, callback?: Function)
    {
        // this.engine = engine;
        // this.bjsScene = new bjs.Scene(engine);
        // this.sceneElements = new Array<SceneElement>();
        this.initScene(engine);
        this.setupCamera();

        if (callback && typeof callback !== 'undefined') {
            this.callback = callback;
        }

        this.loadAssets((tasks) => {
            this.createBaseScene();

            if (callback && typeof callback !== 'undefined') {
                callback(0);
            }
        });

        // this.createBaseScene();

        window.addEventListener("beforeunload", () => {
            Logger.log("Scene : Detecting browser close. Destroying engine.");
        });
    }

    public initScene(engine : bjs.Engine)
    {   
        this.engine = engine;
        this.bjsScene = new bjs.Scene(engine);
        this.sceneElements = new Array<SceneElement>();
    }

    public unload()
    {
        this.onUnload();
        this.unloadAssets();
    }

    protected onUnload()
    {
        if (this.bjsScene)
        {
            this.bjsScene.cleanCachedTextureBuffer();
            this.bjsScene.clearCachedVertexData();    
        }

        if (this.bjsScene) {
            // this.bjsScene.dispose();
        }
    }

    public loadAssets(callback?: LoadAssetHandler)
    {
        AssetManager.Instance.init(this);
        AssetManager.Instance.load(this.assetsPath, callback);
    }

    public unloadAssets()
    {
        AssetManager.Instance.unload(this.assetsPath);
    }

    protected setupCamera()
    {
        Logger.log("Scene : setupCamera()");
    }

    public async createBaseScene ()
    {
        Logger.log("Creating Base Scene");
        if (this.bjsScene) {

            //this.camera = new bjs.ArcRotateCamera("Camera", 0, 0, 0, new bjs.Vector3(0, 0, 0), this.bjsScene);
            
            // Environment Texture
            if (this.hdrSkyboxTexture) {
                // this.hdrTexture = AssetManager.Instance.cubeTextureMap.get(this.hdrSkyboxTexture);
                this.hdrTexture = bjs.CubeTexture.CreateFromPrefilteredData(this.hdrSkyboxTexture, this.bjsScene);
            } else {
                // Environment Texture
                this.hdrTexture = bjs.CubeTexture.CreateFromPrefilteredData(ddsGc256SpecularHDR, this.bjsScene);
                this.hdrSkybox = generateEmptySkybox(1000.0, this);
            }

            if (this.hdrTexture) {
                this.bjsScene.environmentTexture = this.hdrTexture;
                this.bjsScene.createDefaultSkybox(this.hdrTexture, true, 1000, 0.7);
            }
            // Skybox
            //this.hdrSkybox = generateSkybox(1000.0, this.hdrTexture, this.bjsScene);
        }

        /*
        if (this.camera && this.bjsScene)
        {
            this.camera.alpha  = -Math.PI / 2;
            this.camera.beta = Math.PI / 2;       
            this.camera.attachControl(this.canvas, true);
            this.bjsScene.activeCameras = [this.camera];    
        }
        */

        this.createScene();

        if (this.bjsScene)
        {
            this.bjsScene.registerBeforeRender(() => {
                this.preRender();  
            });
    
            this.bjsScene.registerAfterRender(() => {
                this.postRender();  
            });    
        }
    }
    
    protected async createScene()
    {
    }

    public AddSceneElement(element: ISceneElement)
    {
        this.sceneElements.push(element);
    }

    public DeleteSceneElement(name: string) {
        this.sceneElements = this.sceneElements.filter((se: ISceneElement) => se['name'] !== name);
    }

    public preRender()
    {
        if (this.camera != null)
        {
            this.sceneElements.forEach( e => { e.preRender() })
            this.onPreRender();
        }
    }

    public render() {

        if (this.camera != null)
        {
            this.sceneElements.forEach( e => { e.render() });
            this.onRender();
    
            if (this.bjsScene) {
                this.bjsScene.render();
            }    
        }
    }

    public postRender()
    {
        if (this.camera != null)
        {
            this.sceneElements.forEach( e => { e.postRender() })
            this.onPostRender();
        }
    }


    /*
    public aspectRatio() : number
    {
        if (this.camera) {
            return this.camera.viewport.height / this.camera.viewport.width;
        }

        return 1;
    }
    */

    protected onPreRender()
    {
    }
    
    protected onRender()
    {
    }
    protected onPostRender()
    {
    }
}
