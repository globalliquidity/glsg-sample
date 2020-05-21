import { MarketDataSource } from "../MarketDataSource";
import { ExchangeName, InstrumentSymbol, MarketSide } from "../../Enums";
import Logger from '../../Utils/Logger';
import { MarketDataSampler } from "../MarketDataSampler";

export class CryptoQuoteMarketDataSource extends MarketDataSource
{
    private webSocket:WebSocket;
    private feedUrl: string = 'wss://feed.cryptoquote.io';
    private cryptoquoteKey: string = "e1983f70-a7e9-11e8-8362-5b2454c11240";

    constructor(public exchange: string, public symbol: string)
    {
        super(exchange,symbol);
        Logger.log("Constructing CryptoQuote Feed");
    }

    createUrl(symbol: string, exchange: string, interval: number) : string
    {
        let symbolString:string;
        let exchangeString:string;

        // switch(symbol)
        // {
        //     case InstrumentSymbol.USD_BTC:
        //         symbolString = "BTCUSD";
        //         break;
        // }

        // switch(exchange)
        // {
        //     case ExchangeName.CryptoQuote:
        //         exchangeString = "Binance";
        //         break;
        // }

        //hack
        exchangeString = "Binance";
        symbolString = "BTCUSD";

        Logger.log("creating url for : " + symbolString + ":" + exchangeString);

        let url:string = `https://feed.cryptoquote.io/api/v1/book/${symbolString}.${exchangeString}/${interval}`;
        Logger.log(url);
       return url;
    }

    async loadBook(): Promise<void>
    {
        Logger.log("CryptoQuote Feed : Loading Order Book");
        try {
            Logger.log("CryptoQuote Feed : Fetching data");
            const url: string = this.createUrl(this.symbol, this.exchange, 100);
            Logger.log("Book Url: " + url);
            const response: Response = await fetch(url);
            const bData = await response.json();
            Logger.log("CryptoQuote Feed : Got data");
            bData.bids.forEach((bid: any) => {
                 this.sampler.current.addOrderBookEntry(MarketSide.Bid,bid[0],bid[1].size)                                   
            });


            bData.asks.forEach((ask: any) => {                                                       
                this.sampler.current.addOrderBookEntry(MarketSide.Ask,ask[0],ask[1].size)
            });

            this.sampler.current.orders.refresh();
        } catch (e) {
            Logger.log('fetch error: ', e);
        }
    }
    
    openFeed()
    {
        this.loadBook();

        Logger.log("CryptoQuote Feed : Opening Feed Socket");

        this.webSocket = new WebSocket(`${this.feedUrl}/v1/firehose/${this.cryptoquoteKey}?services=book`);

        this.webSocket.onmessage = (event: any) => {
            
            const m: any = JSON.parse(event.data);

            //Logger.log("update: " + m.updateType + "|" + m.exchange.name + "|" + m.symbol);
            if (m.updateType === 'book_update' && m.exchange.name === "Binance" && m.symbol === "BTCUSD")
            {
                //Logger.log("CryptoQuote Feed : Got Feed Update");
                let side: MarketSide = (m.side === 'buy') ? MarketSide.Bid : MarketSide.Ask;

                this.sampler.current.addOrderBookEntry(side, m.price, Number(m.size));
                this.sampler.current.refresh();
            }
        }
    }

    closeFeed()
    {
        throw new Error("Implement in subclass");
    }

    processUpdate()
    {
        throw new Error("Implement in subclass");
    }
}
