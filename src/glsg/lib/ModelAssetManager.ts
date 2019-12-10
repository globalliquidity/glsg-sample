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
        numberMeshes.meshes.forEach(model => {
            (model as bjs.Mesh).isVisible = false;
        });
        this.models["numberMeshes"] = numberMeshes;
    }

    public clear() {
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}
