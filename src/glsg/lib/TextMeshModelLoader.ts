import * as bjs from '@babylonjs/core/legacy/legacy';
import { SolidParticleMaterial } from '../../glsg';
import { Scene } from './Scene';
import { AssetManager } from './AssetManager';
import { GLSGColor } from './Enums';
import { StandardMaterial } from '@babylonjs/core/legacy/legacy';

export class TextMeshModelLoader 
{
    private static _instance: TextMeshModelLoader;
    private characterMeshes: Map<string,bjs.Mesh> = new Map<string,bjs.Mesh>();
    public isLoaded : boolean = false;

    private textMaterial : SolidParticleMaterial;
    
    private constructor()
    {
        
    }

    public async init(scene : Scene)
    {
        if (! this.isLoaded)
        {
            this.textMaterial = new SolidParticleMaterial("text", scene);
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
        // SolidParticleMaterial.setUVColorToMaterial(this.textMaterial, GLSGColor.Cyan);
        
        for (var i = 0; i < 10; i++)
        {
            const fontMesh = this.configureMesh(fontMeshes[i], scene);
            this.characterMeshes.set((i).toString(), fontMesh);
        }
        
        if (fontMeshes[10]) {
            const fontMesh = this.configureMesh(fontMeshes[10], scene);
            this.characterMeshes.set("/", fontMesh);
        }
        
        if (fontMeshes[11]) {
            const fontMesh = this.configureMesh(fontMeshes[11], scene);
            this.characterMeshes.set(".", fontMesh);
        }
        
        for (var i = 11; i < 38; i++)
        {
            let currentLetter : string = String.fromCharCode(64+(i-11));
            const fontMesh = this.configureMesh(fontMeshes[i], scene);
            this.characterMeshes.set(currentLetter, fontMesh);
        }
        
        this.isLoaded = true;
    }

    private configureMesh(abMesh: bjs.AbstractMesh, scene: bjs.Scene) {
        const mesh = abMesh as bjs.Mesh;
        // mesh.material = new StandardMaterial('fontMaterial', scene);
        mesh.material = this.textMaterial;
        mesh.material['disableLighting'] = true;
        // mesh.material['emissiveColor'] = bjs.Color3.White();
        mesh.rotation.x = -Math.PI/2;
        mesh.isVisible = false;
        mesh._scene = scene;
        mesh.alwaysSelectAsActiveMesh = true;
        // mesh.registerInstancedBuffer('color', 4);
        // mesh.instancedBuffers.color = new bjs.Color4(0, 0, 1, 1);
        mesh.registerInstancedBuffer('uv', 4);
        mesh.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(GLSGColor.Red);
        return mesh;
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
