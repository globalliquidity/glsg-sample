import * as bjs from 'babylonjs';
import { SceneElementData } from '../../glsg/lib/SceneElementData';


export class Chart2DData extends SceneElementData
{

    constructor(public chartCanvas: HTMLCanvasElement)
    {
        super();
    }
}

