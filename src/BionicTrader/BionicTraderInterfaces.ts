import { MarketSide, OrderStatus, OrderSide, InstrumentSymbol, ExchangeName, OrderState } from '../Enums';
import { VectorField } from '../SceneGraph/VectorField';
import { ExchangeOrder } from '../Market/ExchangeOrder';
import { Queue } from 'queue-typescript';
import * as bjs from 'babylonjs';
import { OrderBookEntry } from '../Market/OrderBookEntry';
//
// Represents information about an order, placed with the exchange
// We receive order updates from the trading rig with data in this form.
//
export interface IExchangeOrder
{
    symbol : string;
    side : OrderSide;
    quantity : number;
    price : currency;
    state : OrderState;
    time : Number;
} 

//
// Represents a single "quote" in an order book
// Qotes with side.Bid are placed in the order book's
// bid array, side.Ask in the ask array.
// Together the price and quantity represent
// the size of the order, in financial terms.
export interface IOrderBookEntry
{
    symbol:string;
    side:MarketSide;
    price:currency;
    quantity:number;
    index: number;
}

//
// Market data providers generally expose real-time
// feeds, following the pattern where the client
// first request an initial snapshot of the current state
// of the order book, and then subscribes to a websocket, or other
// "push" feed, which updates the client with IExchangeOrder
// objets, which are meant to replace any existing IExchangeOrder
// already in the client's order book. By this mechanism, the order
// book is updated.
//
export interface IMarketDataSource
{
    exchange: string;
    symbol: string;

    loadTrades(sample : IMarketDataSample) : void;
    loadBook(sample : IMarketDataSample) : void;
    loadCandles() : void;
    refresh() : void;

    openFeed() : void;
    closeFeed() : void;

    processUpdate() : void;
}

//
// An IOrderBook manages two collections of IOderBookEntrys.
// One for the bid, and one for the ask (offer). Entries 
// in each book are always price sorted. Bids are stored in descending order.
// Asks are stored in ascending order. This causes the order book to reflect
// The real market structure where the highest bid approaches the price of the lowest ask.
// All other market participants are "away" from the market, with either a lower bid, or
// a higher ask. The distance between the lowest ask and the highest bid is called the "spread".
export interface IOrderBook
{
    exchange:string;
    symbol:string;
    //priceQuantizeDivision : number;

    bids:Array<IOrderBookEntry>;
    asks:Array<IOrderBookEntry>;

    quantizedBids: Array<IOrderBookEntry>;
    quantizedAsks: Array<IOrderBookEntry>;

    insideBid:IOrderBookEntry;
    insideAsk:IOrderBookEntry;  

    clear() : void;
    sort() : void;
    clone() : IOrderBook;

    getEntries(side:MarketSide) : Array<IOrderBookEntry>;
    getEntry(side:MarketSide, depth:number) : OrderBookEntry;

    addEntry(side:MarketSide, price:currency, quantity:number) : void;

    clear() : void;

    //getQuantityAtPrice(side : MarketSide,price : currency);
    getLargestQuantity(side : MarketSide) : number;
    refresh() : void;
    quantize() : void;
    quantizeSide(side : MarketSide, quantizePower: number) : void;
    compareBids (a: any, b: any): number;
    compareAsks (a: any, b: any): number;
    logOrderBook(levels: number) : void;
}

export interface IExchangeTraded
{
    exchange:string;
    symbol:string;
}

export interface ITradeHistory
{
    trades : Array<ExchangeOrder>;
    clone() : ITradeHistory;
}

export interface IMarketDataSample
{
    orderImbalance:number
    spread:currency;
    midPrice:currency;
    insideBid : IOrderBookEntry;
    insideAsk : IOrderBookEntry;
    orders : IOrderBook;
    trades : ITradeHistory;
    isLoaded : boolean;
    maxQuantity: number;

    clone() : IMarketDataSample;
   //refresh();
}

export interface IMarketDataSampler
{
    marketDataSource : IMarketDataSource;
    maxSamples : number;
    samplingInterval : number;
    priceQuantizeDivision : number;
    originPrice: currency
    orderImbalance:number
    spread: currency;
    midPrice: currency;
    insideBid : IOrderBookEntry;
    insideAsk : IOrderBookEntry;
    samples : Array<IMarketDataSample>;
    current : IMarketDataSample;
    currentGeneration : number;
    numDecimalPlaces : number;
    captureSampleTimeout : NodeJS.Timeout;
    loadMarketDataTimeout : NodeJS.Timeout;
    
    start() : void;
    stop() : void;
    //quantizePrice(price : number, priceDivision? : number);
    captureSample() : void;
    get(generation : number) : IMarketDataSample | undefined
}


export interface IOrderBookHistory
{
    maxLength : number;
    orderBooks : Array<IOrderBook>;
    clear() : void;
    add(orderBook : IOrderBook) : void;
    get(generation : number ) : IOrderBook;
}

export interface IMarketDataSamplerClient
{
    sampler : IMarketDataSampler;
}

export interface IMarketDateSampleComponent
{
    sample : IMarketDataSample;
}

export interface IOrderBookClient
{
    orderBook : IOrderBook;
}

export interface IExchangeOrderScenenElement
{
    order: ExchangeOrder;
    generation : number;
}

export interface IDepthFinderElement
{
    rowCount : number;
    columnCount : Number;
    cellWidth : number;
    cellHeight : number;
    cellDepth : number;
    cellMeshScaleFactor : number;
}


export interface IVectorFieldUpdateStrategy
{
    vectorField : VectorField;
    preCalculate() : void;
    updateParticle(particle : bjs.SolidParticle) : bjs.SolidParticle;
}

export interface ITextMeshCharacterGenerator
{
    characterMeshes : Map<string,bjs.InstancedMesh>;
    addCharacterMesh(character : string, mesh : bjs.Mesh) : void;
    setCharacter(character: string) : void;
}

export interface ITextMeshStringGenerator
{
    maxLength : number;
    characterGenerators : Array<ITextMeshCharacterGenerator>;
    setText(text : string) : void
}


export interface ICandlestick {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quoteVolume: number;
    btcVolume: number;
    usdVolume: number;
    time: Date;
}

export interface IExchangeInfo {
    exchange: string;
    bestCaseFee: number;
    worstCaseFee: number;
    icon: string;
}

export interface IExchangeAsset {
    id: number;
    name: string;
    symbol: string;
    tradingSymbol: string;
}

export interface ITradingPair {
    baseTradingSymbol: string;
    quoteTradingSymbol: string;
}

export interface IExchangeApiError {
    code: number;
    message: string;
}

export interface IExchange { 
    info : IExchangeInfo;
    exchangeAssets : Array<IExchangeAsset>;
    tradingPairs : Array<ITradingPair>;

    addExchangeAsset(asset : IExchangeAsset) : void;
    addExchangeAssets(asset : IExchangeAsset[] ) : void;
    addTradingPair ( tradingPair : ITradingPair ) : void;
    addTradingPairs ( tradingPairs : ITradingPair[]) : void;
}

export interface IMarketplace {
    name : string;
    exchanges : Array<IExchange>;
    
    addExchange(exchange : IExchange) : void
    addExchanges(exchangeInfos : IExchangeInfo[]) : void
    resetExchanges(exchangeInfos: IExchangeInfo[]) : void
    setCurrentExchange(exchangeInfo: IExchangeInfo) : void
}
