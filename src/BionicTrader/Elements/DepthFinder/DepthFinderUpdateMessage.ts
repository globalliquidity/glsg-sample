import { PresenterUpdateMessage } from '../../../SceneGraph/PresenterUpdateMessage';
import { MarketDataSample } from '../../../Market/MarketDataSample';

export class DepthFinderUpdateMessage extends PresenterUpdateMessage
{
    constructor(public sample: MarketDataSample)
    {
        super();
    }
}
