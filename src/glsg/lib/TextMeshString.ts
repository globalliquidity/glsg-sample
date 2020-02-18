import * as bjs from '@babylonjs/core/legacy/legacy';
import { Scene } from './Scene'
import { ITextMeshNumberGenerator, ITextMeshString } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';
import { TextMeshCharacterGenerator } from './TextMeshCharacterGenerator';
// import GLSGConstants from '../constants';
import { TextMeshModelLoader } from './TextMeshModelLoader';
//import { InstancedMesh, Vector3, BackEase } from '@babylonjs/core/legacy/legacy';
import { HorizontalAlignment, VerticalAlignment } from './Enums';

export class TextMeshString extends SceneElement implements ITextMeshString {
    characterMeshes: Array<bjs.InstancedMesh> = [];
    characterSpacing: number = 0.1;

    box: bjs.Mesh = null;
    pivot: bjs.Mesh = null;

    constructor(name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene,
        public text: string,
        public horizontalAlignment = HorizontalAlignment.Left,
        public verticalAlignment: VerticalAlignment = VerticalAlignment.Middle) {
        super(
            name,
            x,
            y,
            z,
            scene
        );

        this.characterMeshes = new Array<bjs.InstancedMesh>();
        this.create();
            
    }

    async create() {
        //this.box = bjs.MeshBuilder.CreateBox("box", { height: 5, width: 5, depth: 5 }, this.scene.bjsScene);
        //this.box.setParent(this);
        //this.box.parent = this;
        //this.box.position = this.position;
        let characterOffset: number = 0;
        let prevCharacterWidth: number = 0;
        //let maxCharacterWidth: number = 1;
        let horizontalOffset : number = 0;
        let verticalOffset : number = 0;

        let boundingWidth: number = 0;

        let mat : bjs.StandardMaterial = new bjs.StandardMaterial("mat", this.scene.bjsScene);
        mat.diffuseColor = bjs.Color3.White();
        mat.ambientColor = bjs.Color3.White();
        mat.alpha = 0;
        
        if (!this.pivot) {
            this.pivot = bjs.MeshBuilder.CreateBox("pivot", { height: 0, width: 0, depth: 0 }, this.scene.bjsScene);
            this.pivot.setParent(this);
            this.pivot.parent = this;
        }
        
        // this.pivot.position = this.position;
        
        if (!this.box) {
            this.box = bjs.MeshBuilder.CreateBox("textMeshBox" + this.text, { height: 1, width: 1, depth: 1, }, this.scene.bjsScene);
            this.box.material = mat;
            this.pivot.addChild(this.box);
            this.pivot.isVisible = false;
        }
        // this.box.setParent(this);
        // this.box.parent = this;
        // this.box.position = this.position;
        
        // console.log("TextMeshString : Creating Meshes for : " + this.text);
        for (var i = 0; i < this.text.length; i++) {
            let currentCharacter: string = this.text[i];
            // console.log("TextMeshString : Current Character : " + currentCharacter);
            let characterMesh: bjs.InstancedMesh = TextMeshModelLoader.Instance.getCharacterMesh(currentCharacter).createInstance('characterMesh' + currentCharacter);

            if (characterMesh != null) {
                characterMesh.parent = this;
                characterMesh.isVisible = true;
                characterMesh.position = this.position;
                characterMesh.scaling = new bjs.Vector3(1.5, 1.5, 1.5);
                characterMesh.showBoundingBox = false;
                //characterMesh.position.x = characterMesh.position.x + (i * 10);
                this.characterMeshes.push(characterMesh);
            }
            else {
                console.log("TextMeshString : No Character Mesh For : " + currentCharacter);
            }
        }

        for (var i = 0; i < this.characterMeshes.length; i++) {
            //this.characterMeshes[i].position.x += i;
            let currentCharacter: bjs.InstancedMesh = this.characterMeshes[i];
            let characterWidth = currentCharacter.getBoundingInfo().boundingBox.extendSize.x * 2;
            // console.log("TextMeshString : Character - " + currentCharacter + " is " + characterWidth + " wide.");
            let characterHeight = currentCharacter.getBoundingInfo().boundingBox.extendSize.y * 2;
            // console.log("TextMeshString : Character - " + currentCharacter + " is " + characterHeight + " high.");

            boundingWidth += characterWidth;
            
            //let characterSpacing : number = 1;
            //let offset : number = 
            // let horizontalOffset: number = 0;

            // Calculate offset of each character
            characterOffset += prevCharacterWidth + ((characterWidth - prevCharacterWidth) / 2) + ((i === 0) ? 0 : this.characterSpacing);

            // Above equation is equal to following calculation
            //characterOffset += prevCharacterWidth + ((maxCharacterWidth - prevCharacterWidth) / 2) - ((maxCharacterWidth - characterWidth) / 2) + ((i == 0) ? 0 : characterSpacing);

            prevCharacterWidth = characterWidth;

            //Align the string horizontally
            if (this.horizontalAlignment === HorizontalAlignment.Left) {
                horizontalOffset = 0
            }
            else if (this.horizontalAlignment === HorizontalAlignment.Center) {
                //Offset the whole string horizontally by half the length of the string.
                //For now this is using the fixed character width, but we will update this with
                //logic that accounts for variable width characters.
                horizontalOffset = -(this.characterMeshes.length * this.characterSpacing * 0.5);
            }
            else if (this.horizontalAlignment === HorizontalAlignment.Right) {
                //Offset the whole string horizontally the length of the string.
                horizontalOffset = -(this.characterMeshes.length * this.characterSpacing);
            }

            // let verticalOffset: number = 0;

            if (this.verticalAlignment === VerticalAlignment.Bottom) {
                verticalOffset = -(characterHeight * 0.5);
            }
            else if (this.verticalAlignment === VerticalAlignment.Middle) {
                verticalOffset = 0;
            }
            else if (this.verticalAlignment === VerticalAlignment.Top) {
                verticalOffset = (characterHeight * 2);
            }


            //this.characterMeshes[i].setPositionWithLocalVector(new bjs.Vector3(horizontalOffset + ( characterSpacing * i),0,verticalOffset));
            this.characterMeshes[i].setPositionWithLocalVector(new bjs.Vector3(horizontalOffset + characterOffset, 0, verticalOffset));
        }

        boundingWidth += (this.characterMeshes.length - 1) * this.characterSpacing;

        this.box.scaling = new bjs.Vector3(boundingWidth, 1, 0.2);
        this.box.position.x = horizontalOffset + (boundingWidth / 2);
        this.box.position.y = verticalOffset;
        this.box.position.z = -0.2;
        this.box.parent = this;
    }

    public setText(name: string) {
        for (var i = 0; i < this.characterMeshes.length; i++) {
            this.characterMeshes[i].dispose();
        }

        this.text = name;
        this.characterMeshes = new Array<bjs.InstancedMesh>();
        this.create();
    }

    protected onPreRender() {
        super.onPreRender();
    }

    protected onRender() {
        super.onRender();
    }

    public setPosition(x: number, y: number, z: number) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    public setPositionWithVector(position: bjs.Vector3) {
        this.position = position;
    }

    public setCharRotation(rotation: bjs.Vector3) {
        for (var i = 0; i < this.characterMeshes.length; i++) {
            this.characterMeshes[i].rotation = rotation;
        }
    }

    public setCharScaling(scaling: bjs.Vector3) {
        for (var i = 0; i < this.characterMeshes.length; i++) {
            this.characterMeshes[i].scaling = scaling;
        }
    }

    public setVisibility(isVisible: boolean) {
        for (var i = 0; i < this.characterMeshes.length; i++) {
            this.characterMeshes[i].isVisible = isVisible;
        }

        this.box.isVisible = isVisible;
    }
}
