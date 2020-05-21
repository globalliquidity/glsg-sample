import * as bjs from 'babylonjs';
import { Scene } from '../../../SceneGraph/Scene';
import { SceneManager } from '../../../SceneGraph/SceneManager';
import { Experience } from '../../../SceneGraph/Experience';
import { ViewportPosition } from '../../../SceneGraph/Enums';
import { SimpleScene } from './SimpleScene';
import { SimpleSceneVR } from './SimpleSceneVR';
import { StandardScene } from '../../../SceneGraph/StandardScene';
import {
    veniceDDS,
    dojoModel,
    hemisphereModel,
    deskModel,
    tvModel,
    screenModel,
    ddsGc256SpecularHDR
} from './constants';
import { MarketDataSource } from '../../../Market/MarketDataSource';
import { SimulatorMarketDataSource } from '../../../Market/Sources/SimulatorMarketDataSource';
import { ShrimpyMarketDataSource } from '../../../Market/Sources/ShrimpyMarketDataSource';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';
import { ExchangeName, InstrumentSymbol } from '../../../Enums';

export class SimpleExperience extends Experience
{
    constructor(public title: string, public canvas: HTMLCanvasElement, public useVR: boolean) {
        super(title,canvas);
    }
    
    protected onLoad()
    {
       


        let scene: Scene<bjs.Camera>;    
        scene = new SimpleSceneVR(`SimpleScene${this.scenes.length}`, this.canvas, ddsGc256SpecularHDR);  
        
        
        this.AddScene(scene);
        SceneManager.Instance.LoadScene(scene, this.canvas, ViewportPosition.Full);
    }

    onSamplerLoad () {
        //console.log('loading called!!!!!!!!!!!!!!');
        //this.isLoading = false;
        //this.$forceUpdate();
    }
}
