import { IOrderBookEntry } from "../BionicTrader/BionicTraderInterfaces";
import { InstrumentSymbol, MarketSide } from "../Enums";
import * as currency from 'currency.js';
import { OrderBookEntry } from "./OrderBookEntry";

export class QuoteBucket
{
    quotes = new Array<OrderBookEntry>()

    constructor(public insidePrice: currency,
                public priceRange: currency)
    {

    }   
    
    get quantity() : number
    {
        var sum : number = 0;

        for (var i = 0; i < this.quotes.length; i++) {
            sum += this.quotes[i].quantity;
          }

        return sum;
    } 

    addQuote(entry : OrderBookEntry)
    {
        let i = this.quotes.findIndex((p: IOrderBookEntry) => p.price.value === entry.price.value);

        if (i > -1 && entry.quantity === 0) {
            //Logger.log("Order Book: removing entry at price : " + price);
            this.quotes = this.quotes.splice(i, 1);
          }
          else if (i > -1) {
            this.quotes[i].quantity = entry.quantity;
            this.quotes[i].index = this.quotes.length;
          }
          else if (entry.quantity > 0.0) {
            // add to book
            this.quotes.push(entry);
          }
    }


}
