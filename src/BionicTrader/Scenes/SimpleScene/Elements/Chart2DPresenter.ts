import { SceneElementPresenter } from '../../../../SceneGraph/SceneElementPresenter';
import { Chart2DUpdateMessage } from './Chart2DUpdateMessage';
import { Chart2DData } from './Chart2DData';

export class Chart2DPresenter extends SceneElementPresenter<Chart2DUpdateMessage>
{
    hasData : boolean = false;
    public chartCanvas: HTMLCanvasElement;
    
    constructor()
    {
        super();
    }

    protected processMessage(message : Chart2DUpdateMessage)
    {
        this.chartCanvas = message.chartCanvas;
        this.hasData = true;
    }
}
