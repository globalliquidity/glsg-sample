import * as bjs from 'babylonjs';
import { Scene, SolidParticleSystemElement, SceneElement } from '../../glsg';

export class PieMenuItemElement extends SceneElement
{ 
    constructor(name: string, public x: number, public y: number, public z: number, scene: Scene)
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
        
    }

    protected onRender()
    {
        
    }
}
