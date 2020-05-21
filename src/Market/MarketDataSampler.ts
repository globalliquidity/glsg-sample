import { IMarketDataSampler, IExchangeTraded, IMarketDataSample } from "../BionicTrader/BionicTraderInterfaces";
import { MarketDataSource } from "./MarketDataSource";
import { MarketDataSample } from "./MarketDataSample";
import { OrderBookEntry } from "./OrderBookEntry";
import { EventDispatcher, SignalDispatcher } from "strongly-typed-events";
import { CandleStick } from "./CandleStick";
import Logger from "../Utils/Logger";
import { ActiveModel } from "../SceneGraph/ActiveModel";
import { DepthFinderPresenter } from "../BionicTrader/Elements/DepthFinder/DepthFinderPresenter";
import { PresenterUpdateMessage } from "../SceneGraph/PresenterUpdateMessage";
import { DepthFinderUpdateMessage } from "../BionicTrader/Elements/DepthFinder/DepthFinderUpdateMessage";
import { MarketSide } from "../Enums";
import { Decimal } from "decimal.js";
import { ExchangeOrder } from "./ExchangeOrder";
import * as currency from 'currency.js';
import { threadId } from "worker_threads";
import { VectorFieldLayerType } from "../SceneGraph/Enums";

export class MarketDataSampler extends ActiveModel<DepthFinderPresenter> implements IMarketDataSampler, IExchangeTraded
{
    public originPrice: currency;
    public currentGeneration: number = 0;
    public numDecimalPlaces: number = 0;
    public quantizeMultiplier : number = 0;
    //public originalQuantizePrice: number = 0;

    //create private event dispatcher
    private _onSampleCaptured = new EventDispatcher<MarketDataSampler, IMarketDataSample>();
    private _onCandlesLoaded = new SignalDispatcher();
    public onLoad: Function;

    // Quantity sampling
    public midMaxQuantity: number = 0;
    public minQuantity: number = 0;
    public maxQuantities: Array<number> = [];
    public maxHeightRate: number = 1;

    // Trading Mark Properties
    public bidMakerQuantity: number = 1;
    public askMakerQuantity: number = 1;
    public bidMakerPriceOffset: number = 0;
    public askMakerPriceOffset: number = 0;
    public bidMakerPreviousQuantity: number = 1;
    public bidMakerPreviousPriceOffset: number = 0;
    public askMakerPreviousQuantity: number = 1;
    public askMakerPreviousPriceOffset: number = 0;
    public isVisibleMaker: boolean = false;
    public isVisiblePreviousMaker: boolean = false;
    public lastTradeId: number = 0;

    updatePresenter(): void {
        throw new Error("Method not implemented.");
    }

    get onSampleCaptured() {
        return this._onSampleCaptured.asEvent();
    }

    get orderImbalance(): number
    {
        return this.current.orderImbalance;
    }

    get spread(): currency
    {
        return this.current.spread;
    }

    get midPrice(): currency
    {
        return this.current.midPrice;
    }

    get insideBid(): OrderBookEntry
    {
        return this.current.insideBid;
    }

    get insideAsk(): OrderBookEntry
    {
        return this.current.insideAsk;
    }

    get isLoaded(): boolean
    {
        return this.current.isLoaded;
    }

    currentSample: MarketDataSample;
    samples: Array<MarketDataSample> = new Array<MarketDataSample>();
    captureSampleTimeout: NodeJS.Timeout;
    loadMarketDataTimeout: NodeJS.Timeout;

    constructor(
        public presenter : DepthFinderPresenter,
        public exchange: string,
        public symbol: string,
        public maxSamples: number,
        public samplingInterval: number,
        public priceQuantizeDivision: number,
        public marketDataSource: MarketDataSource) {
        super(presenter,0);

        this.numDecimalPlaces = 1;//this.calculateNumDecimalPlaces();
        this.quantizeMultiplier = 1/this.priceQuantizeDivision;
        this.originPrice = currency(0, { precision : this.numDecimalPlaces});
        //this.originalQuantizePrice = priceQuantizeDivision;
        this.currentSample = new MarketDataSample(exchange, symbol, this, this.midMaxQuantity);

        this.samples.push(this.currentSample);
        marketDataSource.setSampler(this);
    }

    protected async onStart()
    {
        await this.connect();
    }

    public async connect()
    {
       if (this.onLoad != null)
        this.onLoad();

        if (this.marketDataSource.useWebSocket) {
            await this.marketDataSource.openFeed();
            await this.marketDataSource.loadTrades(this.currentSample);
            //await this.captureSample();
            this.captureSampleTimeout = setInterval(this.captureSample.bind(this), this.samplingInterval, this);
        }
        else
        {
            await this.marketDataSource.loadBook(this.currentSample);
            await this.marketDataSource.loadTrades(this.currentSample);
            //await this.captureSample();
            this.captureSampleTimeout = setInterval(this.captureSample.bind(this), this.samplingInterval, this);

            setTimeout(() => {
                this.loadMarketDataTimeout = setInterval(this.loadMarketData.bind(this), this.samplingInterval * 0.5, this);
            }, 1500);
        }
    }

    public stop()
    {
        this.marketDataSource.closeFeed();
        this.clear();
        clearInterval(this.captureSampleTimeout);
        clearInterval(this.loadMarketDataTimeout);
    }

    public clear()
    {
        Logger.log("MarketDataSampler: clear()");
        this.samples = new Array<MarketDataSample>();
        this.currentGeneration = 0;
        this.currentSample = new MarketDataSample(this.exchange, this.symbol, this, this.midMaxQuantity);
    }

    public addMaxQuantity(maxQuantity: number)
    {
        this.maxQuantities.push(maxQuantity);

        if (this.maxQuantities.length >= 50)
        {
            this.maxQuantities.shift();
        }

        let sum = 0;

        this.maxQuantities.forEach(sample => {
            if (sample > 0) {
                sum = sum + sample;
            }
        });

        this.midMaxQuantity = Math.max(...this.maxQuantities);
    }

    public async loadMarketData()
    {
        await this.marketDataSource.loadBook(this.currentSample);
        await this.marketDataSource.loadTrades(this.currentSample);
    }

    public async captureSample()
    {
        this.currentSample.refresh();
        let newMarketDataSample: MarketDataSample = this.currentSample.clone();
        //newMarketDataSample.trades.trades.splice(0,newMarketDataSample.trades.trades.length);
        newMarketDataSample.maxQuantity = this.midMaxQuantity;

        let capturedSample : MarketDataSample = this.currentSample;
       
        this.samples.unshift(this.currentSample);
        this.currentSample = newMarketDataSample;
        this.currentGeneration++;

        this.trimSamples();

        this._onSampleCaptured.dispatch(this, capturedSample);

        //Active MVP Implementation : Update the Presenter by sending a message with the new current sample.
        this.presenter.updatePresenter(new DepthFinderUpdateMessage(capturedSample));
    }

    public addOrderBookEntry(side: MarketSide, price: currency, quantity: number)
    {
        this.current.addOrderBookEntry(side,price,quantity);

        /*
        if (this.currentGeneration > 0)
        {
            this.presenter.updateCurrentRow(VectorFieldLayerType.OrderBook, side, this.quantizePrice(price),quantity);
        }
        */
    }

    public addTrade(trade : ExchangeOrder)
    {
        let quantizedTradePrice : currency = this.quantizePrice(trade.price);
        trade.price = quantizedTradePrice;
        this.current.addTrade(trade);
    }

    private trimSamples()
    {
        if (this.samples.length > this.maxSamples)
            this.samples = this.samples.splice(0, this.maxSamples);
    }

    get current(): MarketDataSample
    {
        return this.currentSample
    }

    get numSamples(): number
    {
        return this.samples.length;
    }

    public get(age: number): MarketDataSample | undefined
    {
        if (age < this.samples.length)
            return this.samples[age];

        return undefined;
    }
  
    quantizePrice(price: currency, side?:MarketSide): currency
    {
        let quantizedPrice : currency = currency(Math.round(price.value * this.quantizeMultiplier)/this.quantizeMultiplier, { precision : 1 });
        return quantizedPrice;
    }
}
