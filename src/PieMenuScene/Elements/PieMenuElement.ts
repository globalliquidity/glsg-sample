import * as bjs from 'babylonjs';
import { Scene, SceneElement } from '../../glsg';
import { PieMenuItemElement } from './PieMenuItelmElement';

export class PieMenuElement extends SceneElement
{
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
