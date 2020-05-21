import * as bjs from 'babylonjs';
import { Scene } from './Scene'
import { ITextMeshNumberGenerator, ITextMeshString } from './SceneGraphInterfaces';
import { SceneElement } from './SceneElement';
import { TextMeshCharacterGenerator } from './TextMeshCharacterGenerator';
// import GLSGConstants from '../constants';
import { TextMeshModelLoader } from './TextMeshModelLoader';
import { HorizontalAlignment, VerticalAlignment, GLSGColor } from './Enums';
import { SolidParticleMaterial } from './SolidParticleMaterial';

export class TextMeshString extends SceneElement implements ITextMeshString {
    characterMeshes: Array<bjs.InstancedMesh> = [];
    characterSpacing: number = 0.1;

    box: bjs.Mesh;
    pivot: bjs.TransformNode;
    isHighlighted: boolean = false;

    width: number = 0.0;
    height: number = 0.0;

    textColor: GLSGColor = GLSGColor.Red;

    addCollisionBox : boolean = false;

    static boxMaterial : bjs.StandardMaterial;

    constructor(name: string,
        public x: number,
        public y: number,
        public z: number,
        scene: Scene<bjs.Camera>,
        public text: string,
        public textScale : number = 1.0,
        public horizontalAlignment : HorizontalAlignment = HorizontalAlignment.Center,
        public verticalAlignment: VerticalAlignment = VerticalAlignment.Middle,
        public billboardMode  = bjs.Mesh.BILLBOARDMODE_NONE,
        ) {
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

        this.width = 0;
        this.height = 0;
        
        if (TextMeshString.boxMaterial === null)
        {
            TextMeshString.boxMaterial = new bjs.StandardMaterial("Text Box Material", this.scene.bjsScene);
            TextMeshString.boxMaterial.diffuseColor = bjs.Color3.White();
            TextMeshString.boxMaterial.ambientColor = bjs.Color3.White();
            TextMeshString.boxMaterial.alpha = 0;
        }
        
        
        if (this.addCollisionBox)
        {
            if (!this.pivot) {
                this.pivot = new bjs.TransformNode("pivot", this.scene.bjsScene);
                this.pivot.setParent(this);
                this.pivot.parent = this;
            }
            
            // this.pivot.position = this.position;
            
            if (!this.box) {
                this.box = bjs.MeshBuilder.CreateBox("textMeshBox" + this.text, { height: 1, width: 1, depth: 1, }, this.scene.bjsScene);
                this.box.material = TextMeshString.boxMaterial;
                this.box.parent = this.pivot;
                this.box.isVisible = false;
            }
        }
       
        // this.box.setParent(this);
        // this.box.parent = this;
        // this.box.position = this.position;
        
        // console.log("TextMeshString : Creating Meshes for : " + this.text);
        for (var i = 0; i < this.text.length; i++) {
            let currentCharacter: string = this.text[i];
            // const originCharacterMesh: bjs.Mesh = TextMeshModelLoader.Instance.getCharacterInstance(currentCharacter);
            // console.log("TextMeshString : Current Character : " + currentCharacter);
            // if (originCharacterMesh) {
                
                // let characterMesh: bjs.InstancedMesh = originCharacterMesh.createInstance('characterMesh' + currentCharacter);
                let characterMesh: bjs.InstancedMesh | undefined = TextMeshModelLoader.Instance.getCharacterInstance(currentCharacter);

                if (characterMesh != null) {
                    characterMesh.parent = this;
                    characterMesh.isVisible = true;
                    characterMesh.position = this.position;
                    characterMesh.scaling = new bjs.Vector3(this.textScale, this.textScale, this.textScale);
                    characterMesh.showBoundingBox = false;
                    characterMesh.billboardMode = this.billboardMode;
                    // characterMesh.material.alpha = 0;
                    // characterMesh.overlayColor = bjs.Color3.Red();
                    // characterMesh.renderOverlay = true;
                    //characterMesh.position.x = characterMesh.position.x + (i * 10);

                    // Calculate bounding
                    let characterWidth = characterMesh.getBoundingInfo().boundingBox.extendSize.x * 2;
                    // console.log("TextMeshString : Character - " + currentCharacter + " is " + characterWidth + " wide.");
                    let characterHeight = characterMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
                    
                    this.width += characterWidth;
                    this.height = characterHeight;

                    this.characterMeshes.push(characterMesh);
                }
                // else {
                    // console.log("TextMeshString : No Character Mesh For : " + currentCharacter);
                // }
            // } else {
                // console.log('current character__________: ', currentCharacter);
            // }
        }

        this.width += (this.characterMeshes.length - 1) * this.characterSpacing;

        if (this.addCollisionBox)
        {
            this.box.scaling = new bjs.Vector3(this.width * 1.4, 1, 0.2);
            this.box.position.x = horizontalOffset + (this.width / 2) + 1.8;
            this.box.position.y = verticalOffset;
            this.box.position.z = -0.2;
            this.box.parent = this;
        }
       

        for (var i = 0; i < this.characterMeshes.length; i++) {
            //this.characterMeshes[i].position.x += i;
            let currentCharacter: bjs.InstancedMesh = this.characterMeshes[i];
            let characterWidth = currentCharacter.getBoundingInfo().boundingBox.extendSize.x * 2;
            // console.log("TextMeshString : Character - " + currentCharacter + " is " + characterWidth + " wide.");
            let characterHeight = currentCharacter.getBoundingInfo().boundingBox.extendSize.y * 2;
            // console.log("TextMeshString : Character - " + currentCharacter + " is " + characterHeight + " high.");

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
                horizontalOffset = -(this.width / 2);
            }
            else if (this.horizontalAlignment === HorizontalAlignment.Right) {
                //Offset the whole string horizontally the length of the string.
                horizontalOffset = -(this.width);
            }

            // let verticalOffset: number = 0;

            if (this.verticalAlignment === VerticalAlignment.Bottom) {
                verticalOffset = -0.5;
            }
            else if (this.verticalAlignment === VerticalAlignment.Middle) {
                verticalOffset = 0;
            }
            else if (this.verticalAlignment === VerticalAlignment.Top) {
                verticalOffset = 0.5;
            }
            
            // this.height = characterHeight;
            //this.characterMeshes[i].setPositionWithLocalVector(new bjs.Vector3(horizontalOffset + ( characterSpacing * i),0,verticalOffset));
            this.characterMeshes[i].setPositionWithLocalVector(new bjs.Vector3(horizontalOffset + characterOffset, 0, verticalOffset));
            this.setColor(this.textColor);
        }

    }

    public setText(text: string)
    {
        if (text !== this.text)
        {
            for (var i = 0; i < this.characterMeshes.length; i++) {
                // this.characterMeshes[i].dispose();
                TextMeshModelLoader.Instance.storeCharacterInstance(this.characterMeshes[i]);
            }
    
            this.text = text;
            this.characterMeshes = new Array<bjs.InstancedMesh>();
            this.create();
        }
        else
        {
            //console.log("TextMeshString : Same Text, Not Setting");
        }       
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

        if(this.addCollisionBox)
        {
            this.box.isVisible = isVisible;
        }
    }

    public setHighlight(isHighlighted: boolean) {
        for (var i = 0; i < this.characterMeshes.length; i++) {
            if (isHighlighted) {
                this.characterMeshes[i].scaling = new bjs.Vector3(1.7, 1.7 , 1.7);
                // this.characterMeshes[i].instancedBuffers.color = new bjs.Color4(1, 0, 0, 1);
                this.characterMeshes[i].instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(GLSGColor.Lime);
                // SolidParticleMaterial.setUVColorToMesh(this.characterMeshes[i], GLSGColor.Yellow);
            } else {
                this.characterMeshes[i].scaling = new bjs.Vector3(1.5, 1.5 , 1.5);
                // this.characterMeshes[i].instancedBuffers.color = new bjs.Color4(0, 0, 1, 1);
                this.characterMeshes[i].instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(GLSGColor.Cyan);
                // SolidParticleMaterial.setUVColorToMesh(this.characterMeshes[i], GLSGColor.Cyan);
            }
        }
    }

    public setColor(color : GLSGColor) {
        for (var i = 0; i < this.characterMeshes.length; i++)
        {
            // console.log('instance buffers', this.characterMeshes[i].instancedBuffers);
            this.characterMeshes[i].instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(color);
        }
        
        this.textColor = color;
    }
}
