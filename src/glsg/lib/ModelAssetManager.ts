import * as bjs from 'babylonjs';

export class ModelAssetManager 
{
    private static _instance: ModelAssetManager;
    public models = {};
    
    private constructor()
    {
    }

    public async LoadModel()
    {
        const numberMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '/', '3DNumbers.babylon');
        const simpleCubeMesh = await bjs.SceneLoader.ImportMeshAsync(null, '/', 'SimpleCube.babylon');
        numberMeshes.meshes.forEach(model => {
            (model as bjs.Mesh).isVisible = true;
        });
        this.models["numberMeshes"] = numberMeshes;
        this.models["simpleCube"] = simpleCubeMesh;
    }

    public async AddModel(meshName, modelPath)
    {
        const newMesh = await bjs.SceneLoader.ImportMeshAsync(null, "/", modelPath);
        this.models[meshName] = newMesh;
        console.log('meshname: ', meshName);
        console.log('modelPath: ', modelPath);
        console.log('newMesh: ', newMesh);
    }

    public clear() {
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}
