import { IMarketDataSource } from "../BionicTrader/BionicTraderInterfaces";
import { ExchangeName, InstrumentSymbol } from "../Enums";
import { OrderBook } from "./OrderBook";
import Logger from '../Utils/Logger';
import { MarketDataSampler } from "./MarketDataSampler";
import { MarketDataSample } from "./MarketDataSample";

export class MarketDataSource implements IMarketDataSource
{
    sampler : MarketDataSampler;
    useWebSocket: boolean = false;

    constructor(public exchange: string,
                public symbol: string)
    {
        Logger.log("Constructing Orderbook Feed");
    }

    setSampler(sampler : MarketDataSampler) : void
    {
        this.sampler = sampler;
    }

    loadTrades(sample : MarketDataSample) : Promise<void> 
    {
        throw new Error("Implement in subclass");
    }

    loadBook(sample : MarketDataSample) : Promise<void> 
    {
        throw new Error("Implement in subclass");
    }

    loadCandles() : void
    {
        throw new Error("Implement in subclass");
    }
    
    openFeed() : void
    {
        throw new Error("Implement in subclass");
    }

    closeFeed() : void
    {
        throw new Error("Implement in subclass");
    }

    processUpdate() : void
    {
        throw new Error("Implement in subclass");
    }

    refresh() : void
    {
        throw new Error("Implement in subclass");
    }

    createTrade() : void
    {
    }
}
