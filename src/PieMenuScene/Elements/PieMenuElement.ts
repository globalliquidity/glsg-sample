import * as bjs from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene, SceneElement } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItelmElement';

export class PieMenuElement extends SceneElement
{
    itemModel : bjs.Mesh;
    menuItems : Array<PieMenuItemElement> = new Array<PieMenuItemElement>();

    constructor(name: string,
                public x: number,
                public y: number,
                public z: number,
                scene: Scene,
                public itemCount : number)
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
    

    protected create()
    {
        var manager = new bjsgui.GUI3DManager(this.scene.bjsScene);
        var panel = new bjsgui.Container3D();
        //panel.margin = 0.75;
    
        manager.addControl(panel);
        panel.linkToTransformNode(this);
        panel.position.z = -1.5;

        bjs.SceneLoader.ImportMesh("", "/", "pushButton.glb", this.scene.bjsScene, function (newMeshes) {
            this.itemModel = newMeshes[0];
        });

        for( var i = 0; i < this.itemCount; i++)
        {
            let item :PieMenuItemElement = new PieMenuItemElement("item",
                                                                this.x,
                                                                this.y,
                                                                this.z,
                                                                this.scene);
            this.menuItems.push(item);
            this.addChild(item);

        }
    }

    protected onRender()
    {
        
    }
}
