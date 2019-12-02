import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { ITextMeshStringGenerator } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';
import { TextMeshCharacterGenerator } from './TextMeshCharacterGenerator';

export class TextMeshStringGenerator extends SceneElement implements ITextMeshStringGenerator
{
    maxLength: number = 11;
    
    initialized : boolean = false;

    characterGenerators: Array<TextMeshCharacterGenerator> = [];
    characterMeshes: Map<string,bjs.Mesh> = new Map<string,bjs.Mesh>();

    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene,
                public material : bjs.PBRMetallicRoughnessMaterial)
    {   
        super(
            name,
            x,
            y,
            z,
            scene
        );

        this.characterGenerators = new Array<TextMeshCharacterGenerator>();

        //this.create();

        //Logger.log('TextMeshCaracterGenerator :  constructor()');
        
    }
    
    async create()
    {
        await this.loadModel();
        //Logger.log('TextMeshCaracterGenerator :  Loaded ' + this.characterMeshes.size + ' meshes');
        //Logger.log('TextMeshCaracterGenerator :  creating character generators');
        for( var i = 0; i < this.maxLength; i++)
        {
            //Logger.log('TextMeshCaracterGenerator :  creating character generator #' + i);

            this.characterGenerators[i] = new TextMeshCharacterGenerator(name + "CharGen" + i,
            0,
            0,
            0,
            this.scene);

            await this.characterGenerators[i].create();
            this.characterGenerators[i].position.x = i * this.characterGenerators[i].scaling.x * 1.2;
            this.characterGenerators[i].position.y = -0.36;
            this.characterGenerators[i].position.z = 0;

            //Logger.log('TextMeshCharacterGenerator :  created character generator for period' + i);

            this.characterGenerators[i].addCharacterMesh(".", this.characterMeshes.get(".") as bjs.Mesh);

            for (var j = 1; j < 11; j++)
            {
                this.characterGenerators[i].addCharacterMesh((10-j).toString(), this.characterMeshes.get((10-j).toString()));
            }

            this.addChild(this.characterGenerators[i]);
        }
       
        this.initialized = true;
        //Logger.log('TextMeshCaracterGenerator :  added ' + this.characterGenerators.length + " characters.");
        //let characterGenerator = this.characterGenerators[0];
        //Logger.log('TextMeshCaracterGenerator :  Setting Character ');
    }

    async loadModel()
    {
        const characterMeshes = await bjs.SceneLoader.ImportMeshAsync(null, '/', '3DNumbers.babylon', this.scene.bjsScene);

        //Logger.log('TextMeshCharacterGenerator :  Characters Model Imported ');
        characterMeshes.meshes[0].parent = this;
        characterMeshes.meshes[0].material = this.material;
        characterMeshes.meshes[0].rotation.x = -Math.PI/2;
        characterMeshes.meshes[0].isVisible = false;

        this.characterMeshes.set(".", characterMeshes.meshes[0] as bjs.Mesh);
        //Logger.log('TextMeshCaracterGenerator :  Added period model to charactermeshes');
        for (var i = 1; i < 11; i++)
        {
            characterMeshes.meshes[i].parent = this;
            characterMeshes.meshes[i].material = this.material;
            characterMeshes.meshes[i].rotation.x = -Math.PI/2;
            characterMeshes.meshes[i].isVisible = false;
            this.characterMeshes.set((10-i).toString(), characterMeshes.meshes[i] as bjs.Mesh);
        }
    }

    protected onPreRender()
    {
        super.onPreRender();
    }

    protected onRender()
    {
       super.onRender();
    }

    public setText(text: string)
    {
        for (var i = 0; i < text.length; i++)
        {
            let character:string = text.substr(i,1);
            if (i < this.maxLength)
            {
                this.characterGenerators[i].setCharacter(character);
            }
        }
    }

    public setPosition(x: number, y: number, z: number)
    {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    public setPositionWithVector(position: bjs.Vector3)
    {
        this.position = position;
    }

    public setCharRotation(rotation: bjs.Vector3)
    {
        for (var i=0; i<this.characterGenerators.length; i++)
        {
            this.characterGenerators[i].rotation = rotation;
        }
    }

    public setCharScaling(scaling: bjs.Vector3)
    {
        for (var i=0; i<this.characterGenerators.length; i++)
        {
            this.characterGenerators[i].scaling = scaling;
        }
    }
}
