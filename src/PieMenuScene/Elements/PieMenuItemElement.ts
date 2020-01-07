import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement, TextMeshNumberGenerator } from '../../glsg';
import { Vector3, PBRMetallicRoughnessMaterial } from 'babylonjs';
import { BigIntStats } from 'fs';
import { TextMeshString } from '../../glsg/lib/TextMeshString';

export class PieMenuItemElement extends SceneElement
{
    mesh : bjs.Mesh;
    public button : bjsgui.MeshButton3D;
    itemText : TextMeshString;

    constructor(name: string,
                public x: number,
                public y: number,
                public z: number,
                scene: Scene,
                public model : bjs.Mesh,
                public itemScale : number,
                public axle : bjs.Mesh,
                public text : string)
    {
        super(
            name,
            x,
            y,
            z,
            scene
        );
        //this.create();
    }
    

    protected async onCreate()
    {
        this.mesh = this.model.clone("item");
        this.mesh.parent = this;
        this.mesh.isVisible = true;
        //this.mesh.position.y = 1.618;
        //this.mesh.position.z = 0;

        //this.button = new bjsgui.MeshButton3D(this.mesh, "itemButton");
        //this.button.parent = this;
        //this.button.position = new bjs.Vector3(0,0,0);
    
        this.mesh.scaling.x = .01 * this.itemScale;
        this.mesh.scaling.y = .01 * this.itemScale;
        this.mesh.scaling.z = .01 * this.itemScale;
        this.mesh.position.z = .05;

        let textMaterial : PBRMetallicRoughnessMaterial = new PBRMetallicRoughnessMaterial("text",this.scene.bjsScene);
       
         textMaterial.baseColor = new bjs.Color3(0.15, 0.6, 0.87); 

        //this.itemText = new TextMeshNumberGenerator("ActiveItem", 0,0,0,this.scene,textMaterial);
        this.itemText = new TextMeshString("ActiveItem", 0,0,0,this.scene,this.text);
        //this.itemText.setVisibility(false);

        //await this.itemText.create();
        //this.itemText.setText("237.15");
        this.itemText.scaling = new bjs.Vector3(0.33,0.33,0.33);
        //this.itemText.setPivotPoint(new bjs.Vector3(0.75,-0.25,0));
        this.itemText.box.scaling = this.itemText.box.scaling.multiply(new bjs.Vector3(0.33,0.33,0.33));
        this.button = new bjsgui.MeshButton3D(this.itemText.box, "itemButton");
        
        
        this.addChild(this.itemText);
        //this.itemText.parent = this.button;


        
    }

    protected onRender()
    {
        let axleRotation : bjs.Vector3 = this.axle.rotation;
        
        
        this.itemText.rotation = new Vector3(0,0,-axleRotation.z);
        // this.itemText.box.rotation = new Vector3(0,0,-axleRotation.z);
        
        //if (this.itemText.rotation.z < (-Math.PI/2))
         //   this.itemText.setVisibility(false);
        //else   
            //this.itemText.setVisibility(true);
        //this.mesh.rotation = new Vector3(0,0,-axleRotation);
        
    }
}
