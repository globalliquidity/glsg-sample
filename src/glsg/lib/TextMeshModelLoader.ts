import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { AssetManager } from './AssetManager';


export class TextMeshModelLoader 
{
    private static _instance: TextMeshModelLoader;
    private characterMeshes: Map<string,bjs.Mesh> = new Map<string,bjs.Mesh>();
    public isLoaded : boolean = false;

    private textMaterial : bjs.PBRMaterial;
    
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
/*
        const numberMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.NumbersModel, scene);

        //numberMeshes.meshes[0].parent = this;
        numberMeshes.meshes[0].material = this.textMaterial;
        //numberMeshes.meshes[0].rotation.x = -Math.PI/2;
        numberMeshes.meshes[0].isVisible = false;

        this.characterMeshes.set(".", numberMeshes.meshes[0] as bjs.Mesh);
        //Logger.log('TextMeshCaracterGenerator :  Added period model to charactermeshes');
        for (var i = 1; i < 11; i++)
        {
            //numberMeshes.meshes[i].parent = this;
            numberMeshes.meshes[i].material = this.textMaterial;
            //numberMeshes.meshes[i].rotation.x = -Math.PI/2;
            numberMeshes.meshes[i].isVisible = false;
            this.characterMeshes.set((10-i).toString(), numberMeshes.meshes[i] as bjs.Mesh);
        }

        const characterMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.CharactersModel, scene);

        for (var i = 0; i < 26; i++)
        {
            //characterMeshes.meshes[i].parent = this;
            characterMeshes.meshes[i].material = this.textMaterial;
            //characterMeshes.meshes[i].rotation.x = -Math.PI/2;
            characterMeshes.meshes[i].isVisible = false;

            let currentLetter : string = String.fromCharCode(65+i);
            console.log(currentLetter);
            this.characterMeshes.set(currentLetter, characterMeshes.meshes[i] as bjs.Mesh);
        }

        console.log("Loaded " +  this.characterMeshes.size + " meshes");

*/

        console.log('TextMeshModelLoader :  Loading Meshes ');

        // const fontMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.FontModel, scene);
        const fontMeshes = AssetManager.Instance.meshesMap.get("fontModel");
        
        for (var i = 0; i < 10; i++)
        {
            //numberMeshes.meshes[i].parent = this;
            // fontMeshes.meshes[i].material = this.textMaterial;
            // fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            // fontMeshes.meshes[i].isVisible = false;
            // this.characterMeshes.set((i).toString(), fontMeshes.meshes[i] as bjs.Mesh);
            fontMeshes[i].material = this.textMaterial;
            fontMeshes[i].rotation.x = -Math.PI/2;
            fontMeshes[i].isVisible = false;
            fontMeshes[i]._scene = scene;
            this.characterMeshes.set((i).toString(), fontMeshes[i] as bjs.Mesh);
        }

        // this.characterMeshes.set("/", fontMeshes.meshes[10] as bjs.Mesh);
        // this.characterMeshes.set(".", fontMeshes.meshes[11] as bjs.Mesh);
        if (fontMeshes[10]) {
            fontMeshes[10]._scene = scene;
        }

        if (fontMeshes[11]) {
            fontMeshes[11]._scene = scene;
        }

        this.characterMeshes.set("/", fontMeshes[10] as bjs.Mesh);
        this.characterMeshes.set(".", fontMeshes[11] as bjs.Mesh);

        for (var i = 11; i < 38; i++)
        {
            let currentLetter : string = String.fromCharCode(64+(i-11));
            
            //numberMeshes.meshes[i].parent = this;
            // fontMeshes.meshes[i].material = this.textMaterial;
            // fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            // fontMeshes.meshes[i].isVisible = false;
            // this.characterMeshes.set(currentLetter, fontMeshes.meshes[i] as bjs.Mesh);
            fontMeshes[i].material = this.textMaterial;
            fontMeshes[i].rotation.x = -Math.PI/2;
            fontMeshes[i].isVisible = false;
            fontMeshes[i]._scene = scene;
            this.characterMeshes.set(currentLetter, fontMeshes[i] as bjs.Mesh);
        }

        this.isLoaded = true;
    }

    public getCharacterMesh(character : string) : bjs.Mesh
    {
        if (this.isLoaded)
        {
            if (this.characterMeshes.has(character))
                return this.characterMeshes.get(character)
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
