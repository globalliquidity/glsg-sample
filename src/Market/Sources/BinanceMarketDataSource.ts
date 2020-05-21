import { MarketDataSource } from "../MarketDataSource";
import { ExchangeName, InstrumentSymbol, MarketSide, OrderSide, OrderState } from "../../Enums";
import { OrderBook } from "../OrderBook";
import { ExchangeOrder } from "../ExchangeOrder";
import Logger from '../../Utils/Logger';
import { MarketDataSampler } from "../MarketDataSampler";
import { MarketDataSample } from "../MarketDataSample";
import { CandleStick } from "../CandleStick";
import * as currency from 'currency.js';
import { shrimpyHeaderGenerator } from "../../BionicTrader/Utils";

export class BinanceMarketDataSource extends MarketDataSource
{
    private lastTradeId = 0;

    constructor(public exchange: string,
                public symbol: string)
    {
        super(exchange, symbol);
        Logger.log("Constructing Binance Feed");
           
    }

    async loadTrades(sample : MarketDataSample) : Promise<void>
    {
        let tradesUrl:string = "http://pricing.tokyo.globalliquidity.io:5001/api/trades/BTCUSDT";
        //let tradesUrl:string = "https://globalliquidity.io:5002/api/trades/BTCUSDT";

        //let tradesUrl:string = "https://localhost:44391/api/trades/BTCUSDT";

        let response: Response;
        var myRequest = new Request(tradesUrl);
        //Logger.log("Binance Feed : Fetching trades");
        response = await fetch(myRequest);
        response.json().then(data =>
        {
            //Logger.log("Binance Feed : processing trades");
            //Logger.log(data[0].Price);


            for (var i in data)
            {
                if (!data[i]) continue;
                
                let price = data[i].Price;
                let quantity = data[i].qty
                let id = data[i].Id;
                let time  = data[i].Time;
                let direction : OrderSide = OrderSide.Buy;

                if (data[i].IsBuyerMaker === false)
                    direction = OrderSide.Buy;
                 else
                    direction = OrderSide.Sell;
                
                if ( Number(id) > this.lastTradeId)
                {
                    //Logger.log("Ccxt Feed : processing trade id : " + trade.id);
                    this.lastTradeId = Number(id);
    
                    let exchangeOrder : ExchangeOrder = new ExchangeOrder("BTCUSDT",
                                                                        direction,
                                                                            quantity,
                                                                            price,
                                                                            OrderState.Filled,
                                                                            Number(time),
                                                                            Number(id));
    
                    //Logger.log("Adding Order :" + trade.id + "|" + trade.side + "|" + trade.price + "|" + trade.price) 
                    // console.log('exchange order: ', exchangeOrder);
                    sample.addTrade(exchangeOrder);                                                  
                }
            };
        });
       //Logger.log(trade.id);
    }

    async loadBook(sample : MarketDataSample): Promise<void>
    {
        // let proxyUrl:string = 'http://13.114.11.228:8080/'; //An EC2 Instance in Tokyo";
        let bookUrl:string = "http://pricing.tokyo.globalliquidity.io:5001/api/orderbook/BTCUSDT";
        //let bookUrl:string = "https://globalliquidity.io:5002/api/orderbook/BTCUSDT";
        // let bookUrl:string = "https://localhost:44391/api/orderbook/BTCUSDT";

        try {
            const myRequest = new Request(bookUrl);
            //Logger.log("Binance Feed : Fetching data");
            const response: Response = await fetch(myRequest);
            //Logger.log(response.body);
                
            const data = await response.json();
            //Logger.log(data);
            //Logger.log("Binance Feed : Got data");

            data.Bids.forEach((bid: any) => {
                //Logger.log("Binance Feed : Adding Bid : " + bid[0] + " " + bid[1]);
                sample.addOrderBookEntry(MarketSide.Bid,currency(bid[0]),Number(bid[1]));
                this.sampler.current.addOrderBookEntry(MarketSide.Bid,currency(bid[0]),Number(bid[1]));                                   
            });

            //this.orderBook.bids = this.orderBook.bids.sort(this.orderBook.compareBids);

            data.Asks.forEach((ask: any) => {  
                //Logger.log("Binance Feed : Adding Ask : " + ask[0] + " " + ask[1]);                                                     
                sample.addOrderBookEntry(MarketSide.Ask,currency(ask[0]),Number(ask[1]));
                this.sampler.current.addOrderBookEntry(MarketSide.Ask,currency(ask[0]),Number(ask[1]));
            });

            //this.orderBook.asks = this.orderBook.asks.sort(this.orderBook.compareAsks);
            sample.refresh();
            // this.sampler.current.refresh();
            //this.orderBook.logOrderBook(10);
        } catch (exception) {
            console.error(exception);
        }
    }
    
    async openFeed()
    {

        //await this.loadBook();
        //await this.loadTrades();
        //setInterval(this.refresh.bind(this), 1000, this);
    }

    closeFeed()
    {
        throw new Error("Implement in subclass");
    }

    async loadCandles(): Promise<void>
    {
            // console.log("BinanceMarketDataSource : Loading CandleData");
            let proxyUrl:string = window.location.protocol === 'http:' ? 'http://52.14.231.154:8080/' : 'https://proxy.bionictrader.io/';
            const url: string = "https://dev-api.shrimpy.io/v1/exchanges/binance/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=5M";
            const requestUrl = '/v1/exchanges/binance/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=5M';
            const headers = shrimpyHeaderGenerator(requestUrl, 'GET');
            const response: Response = await fetch(proxyUrl + url, {
                method: 'GET',
                headers
            });
            const candleData = await response.json();
            // console.log("BinanceMarketDataSource : Got candle data");

            candleData.reverse().forEach( candle =>
                {
                    let candleData : CandleStick = new CandleStick(candle.open,
                                                                    candle.high,
                                                                    candle.low,
                                                                    candle.close,
                                                                    candle.volume,
                                                                    candle.quoteVolume,
                                                                    candle.btcVolume,
                                                                    candle.usdVolume,
                                                                    candle.time);

                    //this.sampler.addCandle(candleData);
                    //console.log(candle.close);
                })

    }

    processUpdate()
    {
        throw new Error("Implement in subclass");
    }

    public async refresh() {

        //await this.loadBook();
        //await this.loadTrades();
    }
}