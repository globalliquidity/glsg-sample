import { IOrderBook, IOrderBookEntry, IOrderBookHistory, ITradeHistory, IMarketDataSampler, IMarketDataSamplerClient, IMarketDataSample, IMarketDateSampleComponent } from "../BionicTrader/BionicTraderInterfaces";
import { MarketSide, ExchangeName, InstrumentSymbol } from "../Enums";
import { MarketDataSource } from "./MarketDataSource";
import { OrderBookEntry } from "./OrderBookEntry";
import { MarketDataSampler } from "./MarketDataSampler";
import { Decimal } from 'decimal.js';
import * as currency from 'currency.js';

import Logger from '../Utils/Logger';
import { QuoteBucket } from "./QuoteBucket";

const ORDERBOOK_MAX_LEN = 200;

export class OrderBook implements IOrderBook, IMarketDataSamplerClient
{
    bids: Array<IOrderBookEntry> = new Array<OrderBookEntry>();
    asks: Array<IOrderBookEntry> = new Array<OrderBookEntry>();

    quantizedBids: Array<IOrderBookEntry> = new Array<OrderBookEntry>();
    quantizedAsks: Array<IOrderBookEntry> = new Array<OrderBookEntry>();

    bidBuckets : Map<number,QuoteBucket> = new Map<number,QuoteBucket>();
    askBuckets : Map<number,QuoteBucket> = new Map<number,QuoteBucket>();



    insideBid: IOrderBookEntry;
    insideAsk: IOrderBookEntry;

    constructor(public exchange: string,
        public symbol: string,
        public sampler: MarketDataSampler) {
        //Logger.log("Constructing OrderBook");
    }

    public clear() {
        //Logger.log("OrderBook : Clearing OrderBook");
        //Logger.log("OrderBook : " + this.bids.length + " bids " + this.asks.length + " asks" );
        this.bids = [];
        this.asks = [];
        this.quantizedBids = [];
        this.quantizedAsks = [];
        // this.sample.clear();
        //Logger.log("OrderBook : Cleared");
        //Logger.log("OrderBook : " + this.bids.length + " bids " + this.asks.length + " asks" );
    }

    sort() : void
    {
        this.bids = this.bids.sort(this.compareBids);
        this.asks = this.asks.sort(this.compareAsks);
    }

    /*
    getQuantityAtPrice(side: MarketSide, price: currency): number
    {
        let entry: IOrderBookEntry = null;

        if (side === MarketSide.Bid) {
            entry = this.quantizedBids.find(bid => {
                //const bidPrice = new Decimal(bid.price);
                return bid.price.subtract(price).abs().lessThan(this.sampler.priceQuantizeDivision);
            });
        } else {
            entry = this.quantizedAsks.find(ask => {
                const askPrice = new Decimal(price);
                return askPrice.minus(ask.price).abs().lessThan(this.sampler.priceQuantizeDivision);
            });
        }

        if (entry) {
            return entry.quantity;
        }
        return 0;
    }
    */

  getQuantityToDepth(side: MarketSide, depth: number) : number
  {
        let totalQuantity = new Decimal(0);

        try {
            for( let i: number = 0; i < depth; i++)
            {
                let entry : IOrderBookEntry = this.getEntry(side, i);

                if (entry) {
                    totalQuantity = totalQuantity.plus(entry.quantity);
                }
            }
        } catch (e) {
            console.log('quality depth error: ', e);
        }

        return totalQuantity.toNumber();
  }

  getLargestQuantity(side: MarketSide): number
  {
    if (side == MarketSide.Bid) {
      return Math.max.apply(null, this.quantizedBids);
    }
    else {
      return Math.max.apply(null, this.quantizedAsks);
    }
  }

  getEntries(side: MarketSide): IOrderBookEntry[]
  {
    if (side == MarketSide.Bid) {
      return this.quantizedBids;
    }
    else {
      return this.quantizedAsks;
    }
  }

  getEntry(side: MarketSide, depth: number): IOrderBookEntry
  {
    return this.getEntries(side)[depth];
  }

  addEntry(side: MarketSide, price: currency, quantity: number) : void
  {
    //Logger.log("Order Book Adding Entry " + price + "|" + quantity);

    //choose the correct array, based on the side of the market
    let array: IOrderBookEntry[] = (side === MarketSide.Bid) ? this.bids : this.asks;


    //see if we already have an entry at this price
    let i = array.findIndex((p: IOrderBookEntry) => p.price === price);

    //if we do have one and the incoming quantity is zero
    //we delete the element at that price.
    // if we have once and the quantity is more than zero
    // we update that entry's price.
    // If we don't have one at this price, we add a new entry
    if (i > -1 && quantity === 0) {
      //Logger.log("Order Book: removing entry at price : " + price);
      array = array.splice(i, 1);
    }
    else if (i > -1) {
      array[i].quantity = quantity;
      array[i].index = array.length;
    }
    else if (quantity > 0.0) {
      // add to book
      array.push(new OrderBookEntry(this.symbol, side, price, quantity, array.length));
    }
    // array.push(new OrderBookEntry(this.symbol,side,price,quantity));


    ///populate buckets

    let quantizedQuotePrice : currency = this.sampler.quantizePrice(price);
    let bucketMap: Map<number,QuoteBucket> = (side === MarketSide.Bid) ? this.bidBuckets : this.askBuckets;


    //let bucketIndex = bucketArray.findIndex((p: QuoteBucket) => p.insidePrice.value === price.value);

    if (bucketMap.has(quantizedQuotePrice.value))
    {
      let bucket : QuoteBucket | undefined = bucketMap.get(quantizedQuotePrice.value);
      if (bucket)
      {
        bucket.addQuote(new OrderBookEntry(this.symbol,side,price,quantity,0));
      }    
    }
    else
    {
      let newBucket : QuoteBucket = new QuoteBucket(quantizedQuotePrice,currency(this.sampler.priceQuantizeDivision));
      newBucket.addQuote(new OrderBookEntry(this.symbol,side,price,quantity,0));
      bucketMap.set(quantizedQuotePrice.value,newBucket);
    }
  }

  //
  // Calculate values derived from the state of the order book
  // We call refresh() once after we load the book and then
  // once each time we add a new entry to the boo from the feed.
  //
  refresh() : void
  {
    this.sort();
    this.quantize();
    if (this.quantizedBids.length === 0 || this.quantizedAsks.length === 0) {
      return;
    }
    this.insideBid = this.quantizedBids[0];
    this.insideAsk = this.quantizedAsks[0];

    if (this.bids.length > ORDERBOOK_MAX_LEN)
      this.truncate(MarketSide.Bid);

    if (this.asks.length > ORDERBOOK_MAX_LEN)
      this.truncate(MarketSide.Ask);

    //Logger.log("OrderBook : Refreshing. Bids: " + this.getEntries(MarketSide.Bid).length + " Asks: " + this.getEntries(MarketSide.Ask).length);
    //Logger.log("OrderBook : Inside Bid/Ask : " + this.insideBid.price + "," + this.insideAsk.price);
  }

  truncate(side: MarketSide) : void
  {
    //if (side === MarketSide.Bid)
      Logger.log("OrderBook: Truncating Bid")
    //else
      //Logger.log("OrderBook: Truncating Ask")

    const newArray: IOrderBookEntry[] = [...((side === MarketSide.Bid) ? this.bids : this.asks)];
    let array: IOrderBookEntry[] = [];

    if (newArray.length > ORDERBOOK_MAX_LEN) {
      // for (let i=0; i< ORDERBOOK_MAX_LEN; i ++) {
      //     array.push(newArray[i]);
      // }
      newArray.map(arr => {
        arr.index = arr.index - newArray.length + ORDERBOOK_MAX_LEN;
        return arr;
      })
    }

    array = newArray.filter(na => na.index >= 0);

    if (side === MarketSide.Bid) {
      this.bids = array;
    } else {
      this.asks = array;
    }
  }

  //
  // Perform price conflation/quantization on the order book
  // This will group the prices to the nearest decimal power
  // specified in this.priceQuantizeMode
  //
  quantize() : void
  {
    //Logger.log("Order Book : Quantizing prices to : " + this.sampler.priceQuantizeDivision);
    this.quantizeSideNew(MarketSide.Bid);
    this.quantizeSideNew(MarketSide.Ask);

    //this.quantizedBids = this.bids;
    //this.quantizedAsks = this.asks;
  }

  quantizeSide(side : MarketSide) : void
  {
      let currentQuantizedPrice : currency;
      let currentQuantizedLevel : number = 0;

      let priceArray : Array<OrderBookEntry>;
      let quantizedPriceArray : Array<OrderBookEntry>;

      if (side === MarketSide.Bid)
      {
          priceArray = this.bids;
          this.quantizedBids = new Array<OrderBookEntry>();
          quantizedPriceArray = this.quantizedBids;
      }
      else
      {
          priceArray = this.asks;
          this.quantizedAsks = new Array<OrderBookEntry>();
          quantizedPriceArray = this.quantizedAsks;
      }

      //quantizedPriceArray = []; //Clear the array

      let insidePrice : currency = currency(0);
      //
      //Iterate over the order book entries
      //
      priceArray.forEach(entry =>
      {   
          if (insidePrice.value === 0)
          {
              currentQuantizedPrice = this.sampler.quantizePrice(entry.price,side);
              insidePrice = currentQuantizedPrice;
              //console.log("OrderBook : Setting Inside Price to : " + insidePrice);
              quantizedPriceArray.push( new OrderBookEntry(this.symbol, side, currentQuantizedPrice, entry.quantity));
              
          }
          else
          { //Process subsequent entries.
              //Logger.log("OrderBook : Processing next price entry : " + entry.price);
              // currentQuantizedPrice = this.sampler.quantizePrice(entry.price);
            //   const distanceFromCurrentQuantizedPriceDecimal = (entry.price - currentQuantizedPrice) * side.valueOf();
            //   let distanceFromCurrentQuantizedPrice = Math.round(distanceFromCurrentQuantizedPriceDecimal / this.sampler.priceQuantizeDivision) * this.sampler.priceQuantizeDivision;

            //console.log("Order Book : Processing Entry : " + entry.price + " : " + entry.quantity);
            const entryPrice = new currency(entry.price);

            const distanceFromCurrentQuantizedPrice =
                entryPrice
                    .subtract(currentQuantizedPrice)
                    .multiply(side.valueOf());

              //Logger.log("OrderBook : Entry Distance from Current Quantized Price : " + distanceFromCurrentQuantizedPrice);
              //The enum value of MarketSide.Bid is -1.
              if (distanceFromCurrentQuantizedPrice.value >= this.sampler.priceQuantizeDivision) //If we have travelled outside the current quantized price level
              {
                  currentQuantizedPrice = this.sampler.quantizePrice(entry.price,side);
                  //console.log("OrderBook : quantized price from " + entry.price + " to " + currentQuantizedPrice);

                  quantizedPriceArray.push(new OrderBookEntry(this.symbol,
                                                                  side,
                                                                  currentQuantizedPrice,
                                                                  entry.quantity));
                  currentQuantizedLevel ++;           
                  /*
                  Logger.log("Created a new quantized price: " +
                                  side.toString() +
                                  " : " +
                                  quantizedPriceArray[currentQuantizedLevel].quantity +
                                  " at " +
                                  quantizedPriceArray[currentQuantizedLevel].price);
                  */
              } else {
                 /*
                  Logger.log("OrderBook : Added to current quantized price: " +
                                  side.toString() +
                                  " : " +
                                  quantizedPriceArray[currentQuantizedLevel].quantity +
                                  " at " +
                                  quantizedPriceArray[currentQuantizedLevel].price);
                                  */
                    // quantizedPriceArray[currentQuantizedLevel].quantity = quantizedPriceArray[currentQuantizedLevel].quantity + entry.quantity;
                    
                    //console.log(quantizedPriceArray);
                    const quantity : number = quantizedPriceArray[currentQuantizedLevel].quantity;
                    quantizedPriceArray[currentQuantizedLevel].quantity = quantity + entry.quantity;;
                }
            }
      })

      if (side === MarketSide.Bid)
      {
          this.quantizedBids = quantizedPriceArray;
      }
      else
      {
          this.quantizedAsks = quantizedPriceArray;
      }
  }

  quantizeSideNew(side : MarketSide) : void
  {
      let currentQuantizedPrice : currency;
      let currentQuantizedLevel : number = 0;

      let priceArray : Array<QuoteBucket>;
      let quantizedPriceArray : Array<OrderBookEntry>;

      if (side === MarketSide.Bid)
      {
          priceArray = Array.from(this.bidBuckets.values());
          this.quantizedBids = new Array<OrderBookEntry>();
          quantizedPriceArray = this.quantizedBids;
      }
      else
      {
          priceArray = Array.from(this.askBuckets.values());
          this.quantizedAsks = new Array<OrderBookEntry>();
          quantizedPriceArray = this.quantizedAsks;
      }

      //quantizedPriceArray = []; //Clear the array

      let insidePrice : currency = currency(0);
      //
      //Iterate over the order book entries
      //
      priceArray.forEach(entry =>
      {   
        quantizedPriceArray.push(new OrderBookEntry(this.symbol,
          side,
          entry.insidePrice,
          entry.quantity));
      })

      if (side === MarketSide.Bid)
      {
          this.quantizedBids = quantizedPriceArray;
      }
      else
      {
          this.quantizedAsks = quantizedPriceArray;
      }
  }

  


  public clone(): OrderBook
  {
    let newOrderBook: OrderBook = new OrderBook(this.exchange, this.symbol, this.sampler);

    for (let i = 0; i < this.bids.length; i++) {
      newOrderBook.addEntry(MarketSide.Bid, this.bids[i].price, this.bids[i].quantity);
    }

    for (let i = 0; i < this.asks.length; i++) {
      newOrderBook.addEntry(MarketSide.Ask, this.asks[i].price, this.asks[i].quantity);
    }

    for (let i = 0; i < this.quantizedBids.length; i++) {
      newOrderBook.quantizedBids.push(new OrderBookEntry(this.symbol, MarketSide.Bid, this.quantizedBids[i].price, this.quantizedBids[i].quantity));
    }

    for (let i = 0; i < this.quantizedAsks.length; i++) {
      newOrderBook.quantizedAsks.push(new OrderBookEntry(this.symbol, MarketSide.Ask, this.quantizedAsks[i].price, this.quantizedAsks[i].quantity));
    }

    newOrderBook.insideBid = newOrderBook.quantizedBids[0];
    newOrderBook.insideAsk = newOrderBook.quantizedAsks[0];

    return newOrderBook;
  }

  compareBids(a: OrderBookEntry, b: OrderBookEntry): number
  {
    return b.price.value - a.price.value;
  }

  compareAsks(a: OrderBookEntry, b: OrderBookEntry): number
  {
    return a.price.value - b.price.value;
  }

  public trim(side: MarketSide, toPrice: currency) : void
  {
    if (side === MarketSide.Bid) {
      let array: IOrderBookEntry[] = this.bids;
      let i = array.findIndex((p: IOrderBookEntry) => p.price <= toPrice);
      array = array.splice(0, i);

    }
    else {
      let array: IOrderBookEntry[] = this.bids;
      let i = array.findIndex((p: IOrderBookEntry) => p.price >= toPrice);
      array = array.splice(0, i);
    }

    /*
    if (array.length > 300) {
        //console.log('before array.length: ', array.length);
        array = array.splice(301, array.length - 300);
        //console.log('after array.length: ', array.length);
    }
    */

    // if (array.length > 300) {
    //     const newArray = [];

    //     array.map(arr => {
    //         arr.index = arr.index - array.length + 300;
    //         return arr;
    //     });

    //     // console.log('new array: ', array);

    //     array.forEach(na => {
    //         if (na.index >= (array.length - 300)) {
    //             newArray.push(na);
    //         }
    //     });

    //     array = newArray;
    // }

    //see if we already have an entry at this price
  }

  logOrderBook(levels: number) : void
  {
    Logger.log("OrderBook : logOrderBook()");

    let level: number = 0;
    //this.bids.splice(0,this.bids.length);
    Logger.log("-------- " + "BTC/USDT" + "--------")
    Logger.log(this.bids.length + " bids. " + this.asks.length + " asks.");
    for (level = 0; level < 5; level++) {
      Logger.log(this.bids[level].quantity + " " + this.bids[level].price + " | " + this.asks[level].price + " " + this.asks[level].quantity)
    }
  }

  calculateLen(priceQuantizeDivision: number) : number
  {
    let n: number = priceQuantizeDivision;
    if (n % 1 > 0) {
      let nS = n.toString().split('.');
      return nS[1].length;
    }
    return 0;
  }

  calDividedResult(value: number, len: number)  : string
  {
    let s = value.toString();
    let ss = s.split('.');
    if (len == 0) {
      s = s;
      return s;
    } else if (ss[0].length > len) {
      s = ss[0].substring(0, ss[0].length - 1 - len)
        + '.' + ss[0].substring(ss[0].length - len, ss[0].length - 1)
        + (ss[1] != null ? ss[1] : '');
      return s;
    } else if (ss[0].length === len) {
      s = '0.' + s;
      return s;
    } else {
      let temp = '0.';
      for (let i = 0; i < (len - ss[0].length); i++) {
        temp += '0';
      }
      s = temp + s;
      return s;
    }
  }
}

/*
export class CryptoQuoteOrderBook extends OrderBook
{
    protected createOrderBookFeed(): OrderBookFeed
    {
        let feed:CryptoQuoteFeed = null;//new CryptoQuoteFeed(this.exchange,this.symbol,this);
        return feed;
    }

}

export class CcxtOrderBook extends OrderBook
{
    protected createOrderBookFeed() : OrderBookFeed
    {
        let feed:CcxtFeed = new CcxtFeed(this.exchange,this.symbol,this);
        return feed;
    }

}

export class BinanceOrderBook extends OrderBook
{
    protected createOrderBookFeed() : OrderBookFeed
    {
        let feed:BinanceFeed = new BinanceFeed(this.exchange,this.symbol,this);
        return feed;
    }

}

export class SimulatorOrderBook extends OrderBook
{
    protected createOrderBookFeed() : OrderBookFeed
    {
        let feed:SimulatorFeed = new SimulatorFeed(this.exchange,this.symbol,this);
        return feed;
    }
}
*/
