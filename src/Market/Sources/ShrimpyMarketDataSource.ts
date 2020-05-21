import * as currency from "currency.js";
import { shrimpyHeaderGenerator } from "../../../Code/BionicTrader/Utils";
import { MarketSide, OrderSide, OrderState } from "../../Enums";
import Logger from '../../Utils/Logger';
import { CandleStick } from "../CandleStick";
import { ExchangeOrder } from "../ExchangeOrder";
import { MarketDataSample } from "../MarketDataSample";
import { MarketDataSource } from "../MarketDataSource";

export class ShrimpyMarketDataSource extends MarketDataSource {
    private feedWebSocket: WebSocket;
    private tradeWebSocket: WebSocket;
    private feedUrl: string = 'wss://ws-feed.shrimpy.io';
    private ShrimpyKey: string = "e1983f70-a7e9-11e8-8362-5b2454c11240";
    private ShrimpyUser: string = "2899c30e-327d-476c-87fa-7a096dd8ecaa";
    private lastTradeId = 0;
    exchange: string = 'binance';
    symbol: string = 'btc-usdt';

    OrderBookSubscribe: Object;
    TradeSubscribe: Object;

    private shrimpySocketToken: string;

    constructor(exchange: string = 'binance', symbol: string = 'btc-usdt') {
        super(exchange, symbol);

        Logger.log('exchange type: ', exchange);
        Logger.log("Constructing Shrimpy Feed");
        this.useWebSocket = true;
        this.exchange = exchange;
        this.symbol = symbol;

        this.OrderBookSubscribe = {
            "type": "subscribe",
            "exchange": this.exchange,
            "pair": this.symbol,
            "channel": "orderbook"
        };

        this.TradeSubscribe = {
            "type": "subscribe",
            "exchange": this.exchange,
            "pair": this.symbol,
            "channel": "trade"
        };
    }

    /*
    createUrl(symbol: string, exchange: string, interval: number): string {
        let symbolString: string;
        let exchangeString: string;

        // switch(symbol)
        // {
        //     case InstrumentSymbol.USD_BTC:
        //         symbolString = "BTC";
        //         break;
        // }

        // switch(exchange)
        // {
        //     case ExchangeName.Shrimpy:
        //         exchangeString = "Binance";
        //         break;
        // }

        //hack
        exchangeString = "Binance";

        Logger.log("creating url for : " + symbolString + ":" + exchangeString);

        let url: string = `https://feed.Shrimpy.io/api/v1/book/${symbolString}.${exchangeString}/${interval}`;
        let shrimpyUrl: string = `https://dev-api.shrimpy.io/v1/orderbooks?exchange=${exchangeString}&baseSymbol=XLM&quoteSymbol=${symbolString}&limit=10`;
        Logger.log(url);
        return shrimpyUrl;
    }
    */

    async loadBook(newSample?: MarketDataSample): Promise<void> {
    }

    async openFeed() {
        // await this.loadBook();

        Logger.log("Shrimpy Feed : Opening Feed Socket");

        await this.getToken();
        this.feedUrl = `${this.feedUrl}?token=${this.shrimpySocketToken}`;

        this.feedWebSocket = new WebSocket(this.feedUrl);

        this.feedWebSocket.addEventListener('open', (event) => {
            this.feedWebSocket.send(JSON.stringify(this.OrderBookSubscribe));
        });

        // this.webSocket.onclose = (event) => {
        //     this.webSocket.send(JSON.stringify(OrderBookUnSubscribe));
        // };

        this.feedWebSocket.onmessage = async (event: any) => {
            const feedData: any = JSON.parse(event.data);

            if (feedData.type === 'ping') {
                this.feedWebSocket.send(JSON.stringify({
                "type": "pong",
                "data": feedData.data
                }));
            }

            if (feedData.channel === 'orderbook') {
                //console.log('feed data: ', feedData);
                if (feedData.snapshot) {
                    // if (this.sampler.calculateNumDecimalPlaces(feedData.content.bids[0].price) > 2) {
                    //     this.sampler.priceQuantizeDivision = Decimal.pow(new Decimal(0.1), new Decimal(this.sampler.calculateNumDecimalPlaces(feedData.content.bids[0].price))).toNumber();
                    // } else {
                    //     this.sampler.priceQuantizeDivision = 0.25;
                    // }
                    /*
                    // In case, first bid doesn't have
                    const decimalPlaces = Math.max(
                        this.sampler.calculateNumDecimalPlaces(feedData.content.bids[0].price),
                        this.sampler.calculateNumDecimalPlaces(feedData.content.bids[1].price),
                        this.sampler.calculateNumDecimalPlaces(feedData.content.bids[2].price),
                        this.sampler.calculateNumDecimalPlaces(feedData.content.bids[3].price),
                        this.sampler.calculateNumDecimalPlaces(feedData.content.bids[4].price)
                    );
                    // let division = '0.';
                    if (decimalPlaces > 2) {
                        this.sampler.priceQuantizeDivision = Decimal.pow(
                            new Decimal(0.1),
                            new Decimal(
                                decimalPlaces
                            )
                        )
                        .toNumber();

                        // for (let i = 0; i < decimalPlaces - 1; i++) {
                        //     division += '0'
                        // }
                        // division += '1';
                        // this.sampler.priceQuantizeDivision = +division;
                    } else {
                        this.sampler.priceQuantizeDivision = Decimal.pow(
                            new Decimal(0.1),
                            new Decimal(
                                decimalPlaces
                            ).minus(1)
                        )
                        // .mul(2.5)
                        .toNumber();
                        // let division = '0.';
                        // if (decimalPlaces == 2) {
                        //     division = '0.1';
                        // } else {
                        //     division = Math.pow(10, 1 - decimalPlaces).toString();
                        // }
                        // this.sampler.priceQuantizeDivision = +division;
                    }

                    this.sampler.numDecimalPlaces = this.sampler.calculateNumDecimalPlaces(this.sampler.priceQuantizeDivision);
                    //this.sampler.originalQuantizePrice = this.sampler.priceQuantizeDivision;
                    */
                }
                else
                {
                }

                // Calculation for max quantity from original feed data
                const bidQuantities: Array<number> = feedData.content.bids.map((bid: any) => Number(bid.quantity));
                const askQuantities: Array<number> = feedData.content.asks.map((ask: any) => Number(ask.quantity));
                const quantities: Array<number> = [...askQuantities, ...bidQuantities];
                const maxQuantity = Math.max(...quantities);
                const minQuantity = Math.min(...quantities);

                let quantitySum = 0;

                quantities.forEach(qty => {
                    quantitySum = quantitySum + qty;
                });
                // const avgQantity = quantitySum / quantities.length;

                this.sampler.minQuantity = minQuantity;
                if (maxQuantity > 0) {
                    this.sampler.addMaxQuantity(maxQuantity);
                }

                feedData.content.bids.forEach((bid: any) => {
                    // console.log('this.sampler.current: ', this.sampler.current);
                    // console.log('converted price: ', Number(bid.price));
                    this.sampler.addOrderBookEntry(MarketSide.Bid, currency(bid.price), Number(bid.quantity));
                });

                feedData.content.asks.forEach((ask: any) => {
                    this.sampler.addOrderBookEntry(MarketSide.Ask, currency(ask.price), Number(ask.quantity));
                });

                //console.log('current sampler: ', this.sampler);

                // Calculate max quantity from current market sample
                // console.log('this.sampler.midMaxQuantity: ', this.sampler.midMaxQuantity);
                // this.sampler.midMaxQuantity = this.sampler.current.getSampleMaxQuantity();
                //this.sampler.current.refresh();
            }
        }
    }

    async loadTrades() {
        await this.getToken();
        this.feedUrl = `wss://ws-feed.shrimpy.io?token=${this.shrimpySocketToken}`;
        this.tradeWebSocket = new WebSocket(this.feedUrl);

        this.tradeWebSocket.addEventListener('open', (event) => {
            this.tradeWebSocket.send(JSON.stringify(this.TradeSubscribe));
        });

        this.tradeWebSocket.onmessage = async (event: any) => {
            const feedData: any = JSON.parse(event.data);
            // console.log('feed trades: ', feedData);

            if (feedData.type === 'ping') {
                this.tradeWebSocket.send(JSON.stringify({
                "type": "pong",
                "data": feedData.data
                }));
            }

            if (feedData.channel === 'trade') {
                // console.log("Shrimpy trade : ", feedData);

                feedData.content.forEach((data, index) => {
                    let price = parseFloat(data.price);
                    let quantity = parseFloat(data.quantity);
                    let id = data.id;
                    let time = data.time;
                    let direction : OrderSide = OrderSide.Buy;

                    if (data.takerSide === 'buyer')
                        direction = OrderSide.Buy;
                    else
                        direction = OrderSide.Sell;

                    // direction = "SELL"

                    if (Number(id) > this.lastTradeId) {
                        //Logger.log("Ccxt Feed : processing trade id : " + trade.id);
                        this.lastTradeId = Number(id);
                        let exchangeOrder: ExchangeOrder = new ExchangeOrder("BTCUSDT",
                        direction,
                        quantity,
                        currency(price),
                        OrderState.Filled,
                        Number(time),
                        Number(id));
                        //Logger.log("Adding Order :" + trade.id + "|" + trade.side + "|" + trade.price + "|" + trade.price)
                        this.sampler.addTrade(exchangeOrder);
                        // console.log('trade sample: ', exchangeOrder);
                    }
                });
            }
        }
    }

    async createTrade() {
        try {
            console.log('create user called');
            let proxyUrl: string = window.location.protocol === 'http:' ? 'http://52.14.231.154:8080/' : 'https://proxy.bionictrader.io/';
            let url: string = `https://dev-api.shrimpy.io/v1/users`;
            // const url: string = `https://dev-api.shrimpy.io/v1/users/701e0d16-1e9e-42c9-b6a1-4cada1f395b8/accounts/123/trades`;

            // GET USERS LIST
            url = `https://dev-api.shrimpy.io/v1/users`;
            let requestUrl = `/v1/users`;
            let headers = shrimpyHeaderGenerator(requestUrl, 'GET');
            let response: Response = await fetch(proxyUrl + url, {
                method: 'GET',
                headers
            });
            const usersData = await response.json();
            if (usersData.length > 0) {
                this.ShrimpyUser = usersData[0].id;
            }
            console.log('users list: ', usersData);

            // CREATE USER
            // requestUrl = `/v1/users`;
            // let body = {
            //     "name": "Ervin"
            // };
            // const bodyStr = JSON.stringify(body);
            // headers = shrimpyHeaderGenerator(requestUrl, 'POST', bodyStr);
            // response = await fetch(proxyUrl + url, {
            //     method: 'POST',
            //     headers,
            //     body: bodyStr,
            // });
            // const createdUserData = await response.json();
            // console.log('created user: ', createdUserData);

            // GET USER
            // url = `https://dev-api.shrimpy.io/v1/users/${this.ShrimpyUser}`;
            // requestUrl = `/v1/users/${this.ShrimpyUser}`;
            // headers = shrimpyHeaderGenerator(requestUrl, 'GET');
            // response = await fetch(proxyUrl + url, {
            //     method: 'GET',
            //     headers
            // });
            // const userData = await response.json();
            // console.log('Fetched user: ', userData);

            // GET ALL LINKED ACCOUNTS LIST
            // url = `https://dev-api.shrimpy.io/v1/users/${this.ShrimpyUser}/accounts`;
            // requestUrl = `/v1/users/${this.ShrimpyUser}/accounts`;
            // headers = shrimpyHeaderGenerator(requestUrl, 'GET');
            // response = await fetch(proxyUrl + url, {
            //     method: 'GET',
            //     headers
            // });
            // const accountsData = await response.json();
            // console.log('accounts list: ', accountsData);

            // CREATE TRADE
            requestUrl = `/v1/users/${this.ShrimpyUser}/accounts/38/trades`;
            url = `https://dev-api.shrimpy.io${requestUrl}`;
            let body = {
                "fromSymbol": "BTC",
                "toSymbol": "USDT",
                "amount": this.sampler.bidMakerQuantity,
            };
            const bodyStr = JSON.stringify(body);
            headers = shrimpyHeaderGenerator(requestUrl, 'POST', bodyStr);
            response = await fetch(proxyUrl + url, {
                method: 'POST',
                headers,
                body: bodyStr
            });
            const tradeData = await response.json();
            console.log('created user: ', tradeData);
        } catch (error) {
            console.log('create trade error: ', error);
        }
    }

    async getToken() {
        let proxyUrl: string = window.location.protocol === 'http:' ? 'http://52.14.231.154:8080/' : 'https://proxy.bionictrader.io/';
        const url: string = `https://dev-api.shrimpy.io/v1/ws/token`;
        const requestUrl = `/v1/ws/token`;
        // const nonce = Date.now();
        const headers = shrimpyHeaderGenerator(requestUrl, 'GET');
        const response: Response = await fetch(proxyUrl + url, {
            method: 'GET',
            headers
        });
        const token = await response.json();

        this.shrimpySocketToken = token.token;
    }

    closeFeed() {
        this.feedWebSocket.close();
        this.tradeWebSocket.close();
    }

    async loadCandles(): Promise<void> {
        // console.log("BinanceMarketDataSource : Loading CandleData");
        let proxyUrl: string = window.location.protocol === 'http:' ? 'http://52.14.231.154:8080/' : 'https://proxy.bionictrader.io/';
        const url: string = `https://dev-api.shrimpy.io/v1/exchanges/${this.exchange}/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=1M`;
        const requestUrl = `/v1/exchanges/${this.exchange}/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=5M`;
        const headers = shrimpyHeaderGenerator(requestUrl, 'GET');
        const response: Response = await fetch(proxyUrl + url, {
            method: 'GET',
            headers
        });
        const candleData = await response.json();
        // console.log("BinanceMarketDataSource : Got candle data");

        candleData.reverse().forEach(candle => {
            let candleData: CandleStick = new CandleStick(candle.open,
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
        });
    }

    reset(exchangeType: string, pairType: string) {
        this.exchange = exchangeType;
        this.symbol = pairType;
        this.OrderBookSubscribe['exchange'] = exchangeType;
        this.OrderBookSubscribe['pair'] = pairType;
        this.TradeSubscribe['exchange'] = exchangeType;
        this.TradeSubscribe['pair'] = pairType;

        this.feedWebSocket.close();
        this.tradeWebSocket.close();
    }

    processUpdate() {
        throw new Error("Implement in subclass");
    }
}
