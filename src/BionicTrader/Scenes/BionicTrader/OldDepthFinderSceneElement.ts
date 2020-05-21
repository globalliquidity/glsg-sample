import * as bjs from 'babylonjs';
import { BionicTraderScene } from "./BionicTraderScene";
import { SceneElement } from '../../../SceneGraph/SceneElement';
import { IMarketDataSamplerClient } from '../../BionicTraderInterfaces';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';


export class OldDepthFinderSceneElement extends SceneElement implements IMarketDataSamplerClient
{
    constructor(public name: string,
        public x: number,
        public y: number,
        public z: number,
        public scene: BionicTraderScene,
        public sampler : MarketDataSampler)
    {
        super(name,
            x,
            y,
            z,
            scene);
        
    }
}

