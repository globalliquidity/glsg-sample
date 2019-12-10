import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement } from '../../glsg';
import { Vector3 } from 'babylonjs';

export class PieMenuItemElement extends SceneElement
{
    mesh : bjs.Mesh;
    public button : bjsgui.MeshButton3D;

    constructor(name: string,
                public x: number,
                public y: number,
                public z: number,
                scene: Scene,
                public model : bjs.Mesh,
                public itemScale : number)
    {
        super(
            name,
            x,
            y,
            z,
            scene
        );
        this.create();
    }
    

    protected onCreate()
    {
        this.mesh = this.model.clone("item");
        this.mesh.parent = this;
        //this.mesh.position.y = 1.618;
        //this.mesh.position.z = 0;

        this.button = new bjsgui.MeshButton3D(this.mesh, "itemButton");
        this.button.position = new bjs.Vector3(0,0,0);
        //this.mesh.scaling = new bjs.Vector3(1,1,1);

        this.mesh.scaling.x = .01 * this.itemScale;
        this.mesh.scaling.y = .01 * this.itemScale;
        this.mesh.scaling.z = .01 * this.itemScale;

        
    }

    protected onRender()
    {
        
    }
}
