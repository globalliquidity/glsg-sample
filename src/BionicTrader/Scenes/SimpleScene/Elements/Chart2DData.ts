import { PresenterData } from '../../../../SceneGraph/PresenterData';

export class Chart2DData extends PresenterData
{
    constructor(public chartCanvas: HTMLCanvasElement)
    {
        super();
    }
}
