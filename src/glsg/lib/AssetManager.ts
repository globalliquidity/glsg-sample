import * as bjs from 'babylonjs';
import { Scene } from './Scene';

type LoadAssetHandler = (arg1: bjs.AbstractAssetTask[]) => void;

type TaskSuccessHandler = (arg1: bjs.AbstractAssetTask) => void;
type TaskErrorHandler = (arg1: bjs.AbstractAssetTask, arg2: string, arg3: any) => void;

export class AssetManager 
{
    private static _instance: AssetManager;
    
    private assetsManager: bjs.AssetsManager;
    
    public meshesMap: Map<string,bjs.AbstractMesh[]> = new Map<string, bjs.AbstractMesh[]>();
    public imageMap: Map<string, HTMLElement> = new Map<string, HTMLElement>();
    public textureMap: Map<string, bjs.Texture> = new Map<string, bjs.Texture>();
    public cubeTextureMap: Map<string, bjs.CubeTexture> = new Map<string, bjs.CubeTexture>();
    public hdrCubeTextureMap: Map<string, bjs.HDRCubeTexture> = new Map<string, bjs.HDRCubeTexture>();
    public binaryMap: Map<string, ArrayBuffer> = new Map<string, ArrayBuffer>();

    private constructor()
    {

    }

    public async init(scene : Scene<bjs.Camera>)
    {
        this.assetsManager = new bjs.AssetsManager(scene.bjsScene);
    }

    public async load() 
    {
        this.assetsManager.load();
    }

    public loadWithHandler(finishHandler: LoadAssetHandler)
    {
        this.assetsManager.load();
        
        this.assetsManager.onFinish = function (tasks) {
            finishHandler(tasks);
        };
    }

    public addMeshTask(taskName: string, meshesNames: any, rootUrl: string, sceneFileName: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const meshTask = this.assetsManager.addMeshTask(taskName, meshesNames, rootUrl, sceneFileName);
        
        meshTask.onSuccess = (task) => {
            this.meshesMap.set(taskName, task.loadedMeshes); 
            
            if (success) {
                success(task);
            }
        }
        
        meshTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
        
    }

    public addImageTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const imageTask = this.assetsManager.addImageTask(taskName, url);
        
        imageTask.onSuccess = (task) => {
            
            this.imageMap.set(taskName, task.image); 
            
            if (success) {
                success(task);
            }
        }
        
        imageTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
    }

    public addTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const textureTask = this.assetsManager.addTextureTask(taskName, url);
        
        textureTask.onSuccess = (task) => {
            
            this.textureMap.set(taskName, task.texture); 
            
            if (success) {
                success(task);
            }
        }
        
        textureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
    }

    public addCubeTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const cubeTextureTask = this.assetsManager.addCubeTextureTask(taskName, url);
        
        cubeTextureTask.onSuccess = (task) => {
            
            this.cubeTextureMap.set(taskName, task.texture); 
            
            if (success) {
                success(task);
            }
        }
        
        cubeTextureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
    }

    public addHDRCubeTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const hdrCubeTextureTask = this.assetsManager.addHDRCubeTextureTask(taskName, url, 0);
        
        hdrCubeTextureTask.onSuccess = (task) => {
            
            this.hdrCubeTextureMap.set(taskName, task.texture); 
            
            if (success) {
                success(task);
            }
        }
        
        hdrCubeTextureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
    }

    public addBinaryFileTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const binaryTask = this.assetsManager.addBinaryFileTask(taskName, url);
        
        binaryTask.onSuccess = (task) => {
            
            this.binaryMap.set(taskName, task.data); 
            
            if (success) {
                success(task);
            }
        }
        
        binaryTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message, exception);
            }
        }
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}
