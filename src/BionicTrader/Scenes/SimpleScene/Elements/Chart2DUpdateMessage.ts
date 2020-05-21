import { PresenterUpdateMessage } from '../../../../SceneGraph/PresenterUpdateMessage';

export class Chart2DUpdateMessage extends PresenterUpdateMessage
{
    constructor(public chartCanvas: HTMLCanvasElement)
    {
        super();
    }
}
