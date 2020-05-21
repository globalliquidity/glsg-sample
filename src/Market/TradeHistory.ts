import { ITradeHistory, IExchangeTraded } from "../BionicTrader/BionicTraderInterfaces";
import { ExchangeName, InstrumentSymbol } from "../Enums";
import { ExchangeOrder } from "./ExchangeOrder";
import { Queue } from "queue-typescript";
import { MarketDataSampler } from "./MarketDataSampler";
import Logger from "../Utils/Logger";

export class TradeHistory implements ITradeHistory, IExchangeTraded
{ 
    public trades :  Array<ExchangeOrder> = new Array<ExchangeOrder>();

    get tradeCount(): number
    {
       return this.trades.length;
    }

    constructor(public exchange: string, public symbol: string, public sampler : MarketDataSampler) { }

    addTrade( trade : ExchangeOrder)
    {
         //see if we already have an entry at this price
         let i = this.trades.findIndex((p: ExchangeOrder) => p.price === trade.price);

         if (i > -1)
         { 
             ///Logger.log("TradeHistory : Adding quantity to trade: " + trade.quantity );
             this.trades[i].quantity += trade.quantity;
         }
         else
         {
            this.trades.push(trade);
         }
    }

    clone() : TradeHistory
    {
         let clonedTradeHistory : TradeHistory = new TradeHistory(this.exchange,this.symbol, this.sampler);
         clonedTradeHistory.trades = this.trades;
         return clonedTradeHistory;
    }

}
