import * as bjs from 'babylonjs';
import { Scene } from './Scene';
import { SceneElement } from './SceneElement';
import { ITextMeshCharacterGenerator } from './SceneGraphInterfaces';
import { SolidParticleMaterial } from './SolidParticleMaterial';
import { GLSGColor } from '../Enums';

export class TextMeshCharacterGenerator extends SceneElement implements ITextMeshCharacterGenerator
{
    characterMeshes: Map<string,bjs.InstancedMesh> = new Map<string,bjs.InstancedMesh>();

    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene<bjs.Camera>)
    {   
        super(
            name,
            x,
            y,
            z,
            scene
        );
    }
    
    async create()
    {
        super.create();
    }

    protected onPreRender()
    {
        super.onPreRender();
    }

    protected onRender()
    {
       super.onRender();
    }

    public addCharacterMesh(character: string, mesh: bjs.Mesh | undefined)
    {
        //console.log('TextMeshCaracterGenerator :  adding mesh for : ' + character);
        if (!mesh) return;
        
        let instancedMesh : bjs.InstancedMesh = mesh.createInstance(character);
        instancedMesh.isVisible = false;
        instancedMesh.parent = this;
        this.characterMeshes.set(character, instancedMesh);
    }

    public setCharacter(character: string)
    {
        this.characterMeshes.forEach((mesh) =>{
            mesh.isVisible = false;
        })
      
        let characterMesh = this.characterMeshes.get(character);

        if (characterMesh) {
            characterMesh.isVisible = true;
        }
        else
        {
            //console.log("TMCG : No mesh at : " + character);
        }
    }

    public setVisibility(isVisible: boolean) {
        this.characterMeshes.forEach((mesh) =>{
            mesh.isVisible = isVisible;
        });
    }

    public setColor(color : GLSGColor) {
        for (var i = 0; i < this.characterMeshes.size; i++)
        {
            this.characterMeshes[i].instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(color);
        }     
    }
}

