import * as bjs from 'babylonjs';
import GLSGAssetManager from '../../glsg/AssetManager';
import { SolidParticleMaterial } from '../../glsg';
import { Scene } from './Scene';


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
        const fontMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '', GLSGAssetManager.FontModel, scene);

        for (var i = 0; i < 10; i++)
        {
            //numberMeshes.meshes[i].parent = this;
            fontMeshes.meshes[i].material = this.textMaterial;
            fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            fontMeshes.meshes[i].isVisible = false;
            this.characterMeshes.set((i).toString(), fontMeshes.meshes[i] as bjs.Mesh);
        }

        this.characterMeshes.set("/", fontMeshes.meshes[10] as bjs.Mesh);
        this.characterMeshes.set(".", fontMeshes.meshes[11] as bjs.Mesh);

        for (var i = 11; i < 38; i++)
        {
            let currentLetter : string = String.fromCharCode(64+(i-11));
            
            //numberMeshes.meshes[i].parent = this;
            fontMeshes.meshes[i].material = this.textMaterial;
            fontMeshes.meshes[i].rotation.x = -Math.PI/2;
            fontMeshes.meshes[i].isVisible = false;
            // fontMeshes.meshes[i].registerInstancedBuffer(bjs.VertexBuffer.UVKind, 4);
            // fontMeshes.meshes[i].instancedBuffers.
            this.characterMeshes.set(currentLetter, fontMeshes.meshes[i] as bjs.Mesh);
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
