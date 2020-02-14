import * as bjs from '@babylonjs/core/legacy/legacy';
import { Scene } from './Scene';
import { SceneElement } from './SceneElement';
import { ITextMeshCharacterGenerator } from './SceneGraphInterfaces';

export class TextMeshCharacterGenerator extends SceneElement implements ITextMeshCharacterGenerator
{
    characterMeshes: Map<string,bjs.InstancedMesh> = new Map<string,bjs.InstancedMesh>();

    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene)
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
            console.log("TMCG : No mesh at : " + character);
        }
    }
}
