import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { ITextMeshNumberGenerator, ITextMeshString } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';
import { TextMeshCharacterGenerator } from './TextMeshCharacterGenerator';
import GLSGAssetManager from '../AssetManager';
import { TextMeshModelLoader } from './TextMeshModelLoader';
import { InstancedMesh, Vector3, BackEase } from 'babylonjs';

export class TextMeshString extends SceneElement implements ITextMeshString
{
     characterMeshes: Array<InstancedMesh> = [];
     characterSpacing : number = 1;
     box : bjs.Mesh;

    constructor(name:string, 
                public x: number,
                public y: number,
                public z: number,
                scene:Scene,
                public text : string)
    {   
        super(
            name,
            x,
            y,
            z,
            scene
        );

        this.characterMeshes = new Array<InstancedMesh>();
        this.create();
        
    }
    
    async create()
    {
        //this.box = bjs.MeshBuilder.CreateBox("box", { height: 5, width: 5, depth: 5 }, this.scene.bjsScene);
        //this.box.setParent(this);
        //this.box.parent = this;
        //this.box.position = this.position;

        console.log("TextMeshString : Creating Meshes for : " + this.text);
        for( var i = 0; i < this.text.length; i++)
        {
            let currentCharacter : string = this.text[i];
            console.log("TextMeshString : Current Character : " + currentCharacter);
            let characterMesh : InstancedMesh = TextMeshModelLoader.Instance.getCharacterMesh(currentCharacter).createInstance(currentCharacter);

            if (characterMesh != null)
            {
                //characterMesh.setParent(this);
                characterMesh.parent = this;
                characterMesh.isVisible = true;
                characterMesh.position = this.position;
                characterMesh.scaling = new Vector3(1,1,1);
                characterMesh.showBoundingBox = true;
                //characterMesh.position.x = characterMesh.position.x + (i * 10);
                this.characterMeshes.push(characterMesh);
            }
            else
            {
                console.log("TextMeshString : No Character Mesh For : " + currentCharacter);
            }
           
        }

        for( var i = 0; i < this.characterMeshes.length; i++)
        {
            //this.characterMeshes[i].position.x += i;
            let currentCharacter : bjs.InstancedMesh = this.characterMeshes[i];
            let boundingWidth = currentCharacter.getBoundingInfo().boundingBox.extendSize.x;
            console.log("TextMeshString : Character - " + currentCharacter + " is " + boundingWidth + " wide.");
            let characterSpacing : number = 1;
            let offset : number = -(this.characterMeshes.length * 1 * 0.5);
            //let offset : number = 0;


            this.characterMeshes[i].setPositionWithLocalVector(new bjs.Vector3(offset + ( characterSpacing * i),0,0));
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
        for (var i=0; i<this.characterMeshes.length; i++)
        {
            this.characterMeshes[i].rotation = rotation;
        }
    }

    public setCharScaling(scaling: bjs.Vector3)
    {
        for (var i=0; i<this.characterMeshes.length; i++)
        {
            this.characterMeshes[i].scaling = scaling;
        }
    }

    public setVisibility(isVisible : boolean)
    {
        for (var i=0; i<this.characterMeshes.length; i++)
        {
            this.characterMeshes[i].isVisible = isVisible;
        }
    }
}
