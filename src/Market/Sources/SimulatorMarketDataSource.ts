import * as currency from 'currency.js';
import { MarketSide, OrderSide, OrderState } from "../../Enums";
import Logger from '../../Utils/Logger';
import { ExchangeOrder } from "../ExchangeOrder";
import { MarketDataSample } from "../MarketDataSample";
import { MarketDataSource } from "../MarketDataSource";

export class SimulatorMarketDataSource extends MarketDataSource {
  private levels: number = 200;
  public originPrice: currency = currency(7891.3);
  public centerPrice: currency = currency(7891.30);
  private amplitude: number = 0.01;
  private priceAmplitude: number = 10;
  private quantityPhasor: number = 0;
  private phasorStep = 0.1;
  private currentTradeId = 0;
  private refreshTimeout: NodeJS.Timeout;

  private trades: Array<ExchangeOrder> = new Array<ExchangeOrder>();

  constructor(public exchange: string, public symbol: string)
  {
    super(exchange, symbol);
    Logger.log("Constructing Simulator Feed");
    this.openFeed();
  }

  async loadTrades(sample: MarketDataSample): Promise<void>
  {
    this.trades.forEach(trade => {
      sample.addTrade(trade);
    });

    this.trades = new Array<ExchangeOrder>();
  }

  async loadBook(sample: MarketDataSample): Promise<void>
  {
    //Logger.log("Simulator Feed : Creating Order Book");
    //Logger.log("Simulator Feed : Sampler  PriceQuantizeDivision - " + this.sampler.priceQuantizeDivision);

    for (let i: number = 1; i < this.levels; i++) {
      // let dPrice = new Decimal(i);
      let bidPrice: currency = this.centerPrice.subtract(0.1 * i);//dPrice.times(this.sampler.priceQuantizeDivision).times(this.priceAmplitude).toNumber();
      let askPrice: currency = this.centerPrice.add(0.1 * i); // dPrice.times(this.sampler.priceQuantizeDivision).times(this.priceAmplitude).toNumber();
      let quantity: number = 0.1 + (i * this.amplitude * Math.abs(Math.sin(this.quantityPhasor)));//i * 0.1;
      //let quantity: number = 1;

      //let quantizedQuantity: number = Number(quantity.toFixed(2));
      
      sample.addOrderBookEntry(MarketSide.Bid, bidPrice, quantity);
      //console.log("Simulator Feed : Adding Ask : " + askPrice + " " + quantity);
      sample.addOrderBookEntry(MarketSide.Ask, askPrice, quantity);
    };

    this.quantityPhasor += this.phasorStep;

    
    let centerPriceOffset : currency = currency(((Math.sin(this.quantityPhasor)
    * this.sampler.priceQuantizeDivision)
    * this.priceAmplitude));
    //this.centerPrice = this.sampler.quantizePrice(this.originPrice + centerPriceOffset);
    


    //console.log(sample);
    sample.refresh();
  }

  openFeed() {
    // this.loadBook();
    //setInterval(this.simulateTrade.bind(this), 1000, this);
  }

  closeFeed() {
    clearInterval(this.refreshTimeout);
  }

  processUpdate() {
    throw new Error("Implement in subclass");
  }

  public async refresh() {
    //this.orderBook.tradeHistoryQueue = new Queue<ExchangeOrder>();
    this.quantityPhasor += this.phasorStep;
    let centerPriceOffset = Number(((Math.sin(this.quantityPhasor)
      * this.sampler.priceQuantizeDivision)
      * this.priceAmplitude)
      .toFixed(this.sampler.numDecimalPlaces));


    this.centerPrice = this.sampler.quantizePrice(this.originPrice.add(centerPriceOffset));
    //this.loadBook();
  }

  async simulateTrade() {

    let orderPrice : currency = this.centerPrice;// feed.originPrice + orderPriceOffset;


    let orderDirection: OrderSide;

    if (this.sampler.currentGeneration % 2 == 0)
    {
      orderDirection = OrderSide.Buy;
      orderPrice = orderPrice.add(this.sampler.priceQuantizeDivision * this.priceAmplitude);
    }
    else {
      orderDirection = OrderSide.Sell;
      orderPrice = orderPrice.subtract(this.sampler.priceQuantizeDivision * this.priceAmplitude);
    }


    //orderPrice = Number(orderPrice.toFixed(this.sampler.numDecimalPlaces));
    Logger.log('simulatior trade price: ', orderPrice);

    this.trades.push(new ExchangeOrder("BTCUSDT",
      orderDirection,
      1,
      orderPrice,
      OrderState.Filled, 0, this.currentTradeId++))
  }

}
