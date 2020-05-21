import * as bjs from 'babylonjs';
import * as currency from 'currency.js';
import { GLSGColor } from '../Enums';
import { VectorFieldLayerType } from './Enums';

export class VectorFieldCell
{
    public isVisible : boolean = false;
    public positionOffset : bjs.Vector2 = new bjs.Vector2(0,0);
    public height : number =0;
    public color : GLSGColor = GLSGColor.Blue;
    public price : currency = currency(0);

    constructor(public layerType : VectorFieldLayerType)
    {

    }

    public initialize()
    {
        this.isVisible = false;
        this.positionOffset.set(0,0);
        this.height = 0;
        this.color = GLSGColor.Blue;
    }
}
