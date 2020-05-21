import { ExchangeOrder } from '../../Market/ExchangeOrder';
import { MarketDataSampler } from '../../Market/MarketDataSampler';
import { BionicTraderScene } from '../Scenes/BionicTrader/BionicTraderScene';
import { SceneElement } from '../../SceneGraph/SceneElement';

export class ExchangeOrderSceneElement extends SceneElement
{
    constructor(public name: string,
                public x: number,
                public y: number,
                public z: number,
                public scene: BionicTraderScene,
                public sampler : MarketDataSampler,
                public order: ExchangeOrder,
                public generation : number)
    {
        super(name, x, y, z, scene);
    }

}