import * as bjs from 'babylonjs';
import GLSGAssetManager from '../../glsg/AssetManager';
import { Scene } from './Scene';


export class TextMeshModelLoader 
{
    private static _instance: TextMeshModelLoader;
    private static characterMeshes: Map<string,bjs.Mesh> = new Map<string,bjs.Mesh>();
    public isLoaded : boolean = false;

    private textMaterial : bjs.PBRMaterial;
    public static fontMeshes : any = null;

    private constructor()
    {
        
    }

    public async init(scene : Scene)
    {
        if (! this.isLoaded)
        {
            this.textMaterial  = new bjs.PBRMaterial("text",scene.bjsScene);
            this.textMaterial.albedoColor = new bjs.Color3(0.1, 0.6, 0.47);
            //this.textMaterial.emissiveColor = new bjs.Color3(0.1, 0.1, 1);
            //this.textMaterial.emissiveIntensity = 1;
            this.textMaterial.roughness = 0.5;
            await this.loadMeshes(scene.bjsScene);
            this.isLoaded = true;
        }
            
    }

    async loadMeshes(scene : bjs.Scene)
    {
        
        console.log('TextMeshModelLoader :  Loading Meshes ');

        if (TextMeshModelLoader.fontMeshes == null) {
            TextMeshModelLoader.fontMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.FontModel, scene);
        }

        // const fontMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.FontModel, scene);

        for (var i = 0; i < 10; i++)
        {
            if (typeof TextMeshModelLoader.characterMeshes.get((i).toString()) !== 'undefined' ) 
                continue;

            //numberMeshes.meshes[i].parent = this;
            TextMeshModelLoader.fontMeshes.meshes[i].material = this.textMaterial;
            TextMeshModelLoader.fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            TextMeshModelLoader.fontMeshes.meshes[i].isVisible = false;
            TextMeshModelLoader.characterMeshes.set((i).toString(), TextMeshModelLoader.fontMeshes.meshes[i] as bjs.Mesh);
        }

        if (typeof TextMeshModelLoader.characterMeshes.get("/") === 'undefined' ) 
            TextMeshModelLoader.characterMeshes.set("/", TextMeshModelLoader.fontMeshes.meshes[10] as bjs.Mesh);
        if (typeof TextMeshModelLoader.characterMeshes.get(".") === 'undefined' ) 
            TextMeshModelLoader.characterMeshes.set(".", TextMeshModelLoader.fontMeshes.meshes[11] as bjs.Mesh);

        for (var i = 11; i < 38; i++)
        {
            let currentLetter : string = String.fromCharCode(64+(i-11));
            
            if (typeof TextMeshModelLoader.characterMeshes.get(currentLetter) !== 'undefined' ) 
                continue;

            //numberMeshes.meshes[i].parent = this;
            TextMeshModelLoader.fontMeshes.meshes[i].material = this.textMaterial;
            TextMeshModelLoader.fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            TextMeshModelLoader.fontMeshes.meshes[i].isVisible = false;
            TextMeshModelLoader.characterMeshes.set(currentLetter, TextMeshModelLoader.fontMeshes.meshes[i] as bjs.Mesh);
        }

        this.isLoaded = true;
    }

    public getCharacterMesh(character : string) : bjs.Mesh
    {
        if (this.isLoaded)
        {
            if (TextMeshModelLoader.characterMeshes.has(character))
                return TextMeshModelLoader.characterMeshes.get(character)
            else
                return null
        }
        else return null;
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}
