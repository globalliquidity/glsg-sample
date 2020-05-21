import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { GLSGAssetType } from './Enums';
import { GLSGAsset } from './GLSGAsset';
import {LoadAssetHandler, TaskSuccessHandler, TaskErrorHandler} from './Procs';

export class AssetManager 
{
    private static _instance: AssetManager;
    
    private assetsManager!: bjs.AssetsManager;    
    public assetMap: Map<string, GLSGAsset> = new Map<string, GLSGAsset>();

    private constructor()
    {
        
    }

    public init(scene : Scene<bjs.Camera>)
    {
        this.assetsManager = new bjs.AssetsManager(scene.bjsScene);

        this.assetsManager.useDefaultLoadingScreen = false;
        bjs.SceneLoader.ShowLoadingScreen = false;
    }

    public load(assets?: any[], finishHandler?: LoadAssetHandler) 
    {
        if (assets)
        {
            for (let i = 0; i < assets.length; i++) {
                if (assets[i].type == 'mesh') {
                    this.addMeshTask(assets[i].name, '', assets[i].url, assets[i].fileName);
                }
            }
    
            this.assetsManager.load();
    
        }
        
        if (finishHandler) {
            this.assetsManager.onFinish = finishHandler;
        }
    }

    public unload(assets: any[])
    {
        this.assetsManager.reset();

        if (this.assetMap)
        {
            for (let i = 0; i < assets.length; i++)
            {
                if (assets[i].type == 'mesh')
                {
                    let asset : GLSGAsset | undefined;
                    asset = this.getAsset(assets[i].name);

                    if (asset)
                    {
                        let meshes = asset.meshes;

                        if (meshes)
                        {
                            for (let j = 0; j < meshes.length; j++) {
                                meshes[i].dispose();
                            }
                        }
                       
                    }
                    this.assetMap.delete(assets[i].name);
                }
            }
        } 
    }

    public addMeshTask(taskName: string, meshesNames: any, rootUrl: string, sceneFileName: string, success?: TaskSuccessHandler, error?: TaskErrorHandler) 
    {
        const meshTask = this.assetsManager.addMeshTask(taskName, meshesNames, rootUrl, sceneFileName);
        
        meshTask.onSuccess = (task) => {
            const meshAsset = new GLSGAsset(GLSGAssetType.MODEL, rootUrl, sceneFileName, task.loadedMeshes);
            meshAsset.loadStat = bjs.AssetTaskState.DONE;

            this.assetMap.set(taskName, meshAsset);
            
            if (success) {
                success(task);
            }
        }
        
        meshTask.onError = (task, message , exception) => {
            const meshAsset = new GLSGAsset(GLSGAssetType.MODEL, rootUrl, sceneFileName, task.loadedMeshes);
            meshAsset.loadStat = bjs.AssetTaskState.ERROR;
            
            this.assetMap.set(taskName, meshAsset);

            if (error) {
                error(task, message as string, exception);
            }
        }
        
    }

    public addImageTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const imageTask = this.assetsManager.addImageTask(taskName, url);
        
        imageTask.onSuccess = (task) => {
                        
            if (success) {
                success(task);
            }
        }
        
        imageTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message as string, exception);
            }
        }
    }

    public addTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const textureTask = this.assetsManager.addTextureTask(taskName, url);
        
        textureTask.onSuccess = (task) => {
            
            if (success) {
                success(task);
            }
        }
        
        textureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message as string, exception);
            }
        }
    }

    public addCubeTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const cubeTextureTask = this.assetsManager.addCubeTextureTask(taskName, url);
        
        cubeTextureTask.onSuccess = (task) => {
                        
            if (success) {
                success(task);
            }
        }
        
        cubeTextureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message as string, exception);
            }
        }
    }

    public addHDRCubeTextureTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const hdrCubeTextureTask = this.assetsManager.addHDRCubeTextureTask(taskName, url, 0);
        
        hdrCubeTextureTask.onSuccess = (task) => {
                        
            if (success) {
                success(task);
            }
        }
        
        hdrCubeTextureTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message as string, exception);
            }
        }
    }

    public addBinaryFileTask(taskName: string, url: string, success: TaskSuccessHandler, error: TaskErrorHandler) 
    {
        const binaryTask = this.assetsManager.addBinaryFileTask(taskName, url);
        
        binaryTask.onSuccess = (task) => {
                        
            if (success) {
                success(task);
            }
        }
        
        binaryTask.onError = (task, message, exception) => {
            
            if (error) {
                error(task, message as string, exception);
            }
        }
    }

    getAsset(assetName: string) : GLSGAsset | undefined
    {
        if (this.assetMap)
        {
            if (this.assetMap.has(assetName))
                return this.assetMap.get(assetName);
        }
        return undefined;
    }

    getMesh(assetName: string) : bjs.Mesh | undefined
    {
        let asset : GLSGAsset | undefined;
        asset = this.getAsset(assetName);
            
            if (asset)
            {
                let meshes : bjs.AbstractMesh[] | undefined;
                meshes = asset.meshes;

                if (meshes)
                {
                    if (meshes[0])
                    {   
                        meshes[0].setEnabled(true);
                        return meshes[0] as bjs.Mesh;
                    }
                }                
            }
        return undefined;
    }

    getMeshClone(assetName: string) : bjs.Mesh | undefined
    {
        let mesh : bjs.Mesh | undefined = this.getMesh(assetName);

        if (mesh)
        {
            let clonedMesh : bjs.Mesh = mesh.clone();

            mesh.setEnabled(false);

            if (clonedMesh)
            {
               
                return clonedMesh;
            }
            
        }

        let asset : GLSGAsset | undefined;
        asset = this.getAsset(assetName);
            
            if (asset)
            {
                let meshes : bjs.AbstractMesh[] | undefined;
                meshes = asset.meshes;

                if (meshes)
                {
                    if (meshes[0])
                    {   
                        meshes[0].isVisible = true;

                        let childMeshes : bjs.AbstractMesh[] = meshes[0].getChildMeshes(false);

                        if (childMeshes)
                            childMeshes.forEach( item => { item.isVisible = true;})

                        return meshes[0] as bjs.Mesh;
                    }
                }                
            }
        return undefined;
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}
