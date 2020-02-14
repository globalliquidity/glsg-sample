import * as bjs from '@babylonjs/core/legacy/legacy';
import { VectorField, VectorFieldUpdateStrategy, SolidParticleMaterial } from '../../glsg';
import { GLSGColor } from '../../glsg/lib/Enums';

export class SineWaveOscillatorUpdateStrategy extends VectorFieldUpdateStrategy
{
    protected theta: number = 0;

    constructor(valueField: VectorField, public speed: number, public frequency: number, public amplitude: number)
    {
        super(valueField);
    }

    protected onPreCalculate()
    {
        this.theta += (this.speed / 60) * 0.5;
    }

    protected onUpdateParticle(particle: bjs.SolidParticle)
    {
        const currentRow: number = particle.idx / this.vectorField.columnCount;
        let cellOffset: number = currentRow * - this.frequency;
        let yOffest: number = Math.abs((Math.sin(this.theta + cellOffset)));
        particle.scaling.y =  yOffest * this.amplitude;
        particle.position.y = particle.scaling.y * 0.5;

        particle.uvs = SolidParticleMaterial.getUVSforColor(GLSGColor.Cyan);
    }
}
