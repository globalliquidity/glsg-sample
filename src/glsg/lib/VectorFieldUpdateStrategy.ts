import * as bjs from '@babylonjs/core/legacy/legacy';
import { VectorField } from './VectorField';
import { IVectorFieldUpdateStrategy } from './SceneGraphInterfaces';
import Logger from './Logger';

export class VectorFieldUpdateStrategy implements IVectorFieldUpdateStrategy
{
    constructor(public vectorField: VectorField)
    {
    }

    public preCalculate()
    {
        this.onPreCalculate();
    }

    public updateParticle(particle: bjs.SolidParticle)
    {
        this.onUpdateParticle(particle);
    }

    protected onPreCalculate()
    {

    }

    protected onUpdateParticle(particle: bjs.SolidParticle)
    {
        Logger.log(particle);
    }
}
