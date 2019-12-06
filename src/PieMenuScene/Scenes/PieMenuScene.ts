
import * as bjs from 'babylonjs';
import { Vector3 } from 'babylonjs';
import * as bjsgui from 'babylonjs-gui';
import { Scene } from '../../glsg';
import { PieMenuElement } from '../Elements/PieMenuElement';

export class PieMenuScene extends Scene
{
    itemCount : number = 5;
    menu:PieMenuElement
    menuPosition : Vector3 = new Vector3(0,0,0);

    constructor(public title: string, public canvas: HTMLElement, hdrSkyboxTexture: string) {
        super(title,canvas,hdrSkyboxTexture);
    } 
    
    protected async createScene()
    {
        var manager = new bjsgui.GUI3DManager(this.bjsScene);

        this.menu = new PieMenuElement("menu",
                                        this.menuPosition.x,
                                        this.menuPosition.y,
                                        this.menuPosition.z,
                                        this,
                                        this.itemCount);  
        this.AddSceneElement(this.menu);                                                            
    }

    protected onRender()
    { 

    }
}
