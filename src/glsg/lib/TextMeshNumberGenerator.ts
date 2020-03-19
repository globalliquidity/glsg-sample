import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { ITextMeshNumberGenerator } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';
import { TextMeshCharacterGenerator } from './TextMeshCharacterGenerator';
import { TextMeshModelLoader } from './TextMeshModelLoader';

export class TextMeshNumberGenerator extends SceneElement implements ITextMeshNumberGenerator
{
    maxLength: number = 15;
    
    initialized : boolean = false;

    characterGenerators: Array<TextMeshCharacterGenerator> = [];
    static characterMeshes: Map<string,bjs.Mesh> = new Map<string,bjs.Mesh>();
    static isLoaded : boolean = false;

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
        //if (! TextMeshModelLoader.Instance.isLoaded)
         //   await TextMeshModelLoader.Instance.init(this.scene);
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

            this.characterGenerators[i].addCharacterMesh(".", TextMeshModelLoader.Instance.getCharacterMesh(".") as bjs.Mesh);

            for (var j = 1; j < 11; j++)
            {
                this.characterGenerators[i].addCharacterMesh((10-j).toString(), TextMeshModelLoader.Instance.getCharacterMesh((10-j).toString()));
            }
/*
            for (var i = 0; i < 27; i++)
            {   
                let currentLetter : string = String.fromCharCode(65+i);
                this.characterGenerators[11+i].addCharacterMesh(currentLetter, TextMeshModelLoader.Instance.getCharacterMesh(currentLetter));
            }
*/
            

            this.addChild(this.characterGenerators[i]);
        }
       
        this.initialized = true;
    
        //Logger.log('TextMeshCaracterGenerator :  added ' + this.characterGenerators.length + " characters.");
        //let characterGenerator = this.characterGenerators[0];
        //Logger.log('TextMeshCaracterGenerator :  Setting Character ');
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
