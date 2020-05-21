import { IMarketDataSample, IExchangeTraded, IMarketDataSamplerClient } from "../BionicTrader/BionicTraderInterfaces";
import { MarketSide } from "../Enums";
import { OrderBook } from "./OrderBook";
import { TradeHistory } from "./TradeHistory";
import { ExchangeOrder } from "./ExchangeOrder";
import { MarketDataSampler } from "./MarketDataSampler";
import { OrderBookEntry } from "./OrderBookEntry";
import { Decimal } from 'decimal.js'
import Logger from "../SceneGraph/Logger";
import * as currency from 'currency.js';

export class MarketDataSample implements IMarketDataSample, IExchangeTraded, IMarketDataSamplerClient
{
    public spread: currency;
    public midPrice: currency;
    public orderImbalance : number = 0;
    public offset : number;
    public maxQuantityInSample : number;

    get insideBid(): OrderBookEntry
    {
       return this.orders.insideBid;
    }

    get insideAsk(): OrderBookEntry
    {
       return this.orders.insideAsk;
    }
    
    public orders : OrderBook;
    public trades : TradeHistory;

    public isLoaded : boolean = false;

    constructor(public exchange: string,
                public symbol : string,
                public sampler : MarketDataSampler,
                public maxQuantity: number)
    {

        this.orders = new OrderBook(exchange,symbol, sampler);
        this.trades = new TradeHistory(exchange,symbol,sampler);
    }

    public addOrderBookEntry(side: MarketSide, price: currency, quantity: number)
    {
        this.orders.addEntry(side,price,quantity);
    }

    private getSampleMaxQuantity() : number {
        const bidQuantities = this.orders.bids.map((bid: OrderBookEntry) => bid.quantity);
        const askQuantities = this.orders.asks.map((ask: OrderBookEntry) => ask.quantity);
        return Math.max( ...bidQuantities, ...askQuantities );
    }

    public refresh()
    {
        //Logger.log("MarketDataSample : Refreshing Order Book");
        this.orders.refresh();
        this.spread = this.sampler.quantizePrice(this.orders.insideAsk.price.subtract(this.orders.insideBid.price));
        this.midPrice = this.orders.insideBid.price.add(this.orders.insideAsk.price).divide(2);
      /*
        Logger.log("MarketDataSample : Inside Bid - " + 
                    this.insideBid.price +
                    " Inside Ask - " +
                    this.insideAsk.price +
                    " Spread - " + 
                    this.spread + 
                    " MidPrice - " + this.sampler.midPrice);
                    */
        //Logger.log("MarketDataSample : Spread : " + this.spread);
        //Logger.log("MarketDataSample : Mid : " + this.midPrice);
       
        /*
        if (this.sampler.originPrice.value === 0)
        {
            let newQD =  new Decimal(1);
            let priceQuantizeFactor = newQD.dividedBy(this.sampler.priceQuantizeDivision).toNumber();


            newQD = new Decimal(this.sampler.midPrice);
            let dpriceQuantizeFactor = new Decimal(priceQuantizeFactor);
            let closestMajorUnit = dpriceQuantizeFactor.times(Math.floor(newQD.dividedBy(priceQuantizeFactor).toNumber())).toNumber();
            this.sampler.originPrice = closestMajorUnit;
        }
        else
        {
            this.offset = -this.sampler.quantizePrice(this.sampler.originPrice - this.midPrice);

        }
        */
        
        this.calculateOrderImbalance(30);

        this.maxQuantityInSample = this.getSampleMaxQuantity();
        this.isLoaded = true;
    }

    calculateOrderImbalance(depth : number)
    {
        let bidQuantity : number = this.orders.getQuantityToDepth(MarketSide.Bid,depth);
        let askQuantity : number = this.orders.getQuantityToDepth(MarketSide.Ask, depth);

        if (bidQuantity >= askQuantity)
        {
            this.orderImbalance = (bidQuantity/askQuantity);
        }
        else
        {
            this.orderImbalance = -(askQuantity/bidQuantity);
        }
        
        //this.orderImbalance = this.calculateRatio(bidQuantity,askQuantity);   
        //Logger.log("MarketDataSample : Calculated Order Imbalance is " + this.orderImbalance);
    }

    calculateRatio (a, b) {
        return (b == 0) ? a : this.calculateRatio (b, a % b);
    }

    public addTrade(trade : ExchangeOrder)
    {
        //let quantizedTradePrice : number = this.sampler.quantizePrice(trade.price);
        //trade.price = quantizedTradePrice;
        this.trades.addTrade(trade);
    }

    public clear() {
        this.orders.clear();
        this.trades.trades = [];
    }

    public clone(): MarketDataSample
    {
        //this.refresh();
        let clonedOrderBook : OrderBook = this.orders.clone();
        //let clonedTradeHistory : TradeHistory = this.trades.clone();
        let clonedMarketDataSample : MarketDataSample = new MarketDataSample(this.exchange,
                                                                                this.symbol,
                                                                                this.sampler,
                                                                                this.maxQuantity);
        clonedMarketDataSample.orders = clonedOrderBook;
        clonedMarketDataSample.trades = new TradeHistory(this.exchange,this.symbol,this.sampler);
        clonedMarketDataSample.spread = this.spread;
        clonedMarketDataSample.midPrice = this.midPrice;
        clonedMarketDataSample.isLoaded = true;
        //clonedMarketDataSample.refresh();
                                                     
        return clonedMarketDataSample;
    }
}
