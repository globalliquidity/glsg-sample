import { IOrderBookEntry } from "../BionicTrader/BionicTraderInterfaces";
import { InstrumentSymbol, MarketSide } from "../Enums";
import * as currency from 'currency.js';

export class OrderBookEntry implements IOrderBookEntry
{
    constructor(public symbol:string,
                public side: MarketSide,
                public price: currency,
                public quantity: number,
                public index: number = 0)
    {
    }
}
