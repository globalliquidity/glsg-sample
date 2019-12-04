import { Scene } from '../glsg';
import * as bjs from 'babylonjs';
import { PieMenuElement } from './Elements/PieMenuElement';
import { Vector3 } from 'babylonjs';

export class PieMenuScene extends Scene
{
    itemCount : number = 5;
    menu:PieMenuElement
    menuPosition : Vector3 = new Vector3(0,0,0);
    
    protected async createScene()
    {
        
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
