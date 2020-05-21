import { IExchange, IExchangeAsset, IMarketplace, ITradingPair, IExchangeInfo } from "../BionicTrader/BionicTraderInterfaces";
import { Exchange } from "./Exchange";
import { ExchangeInfo } from "./ExchangeInfo";
import Logger from "../Utils/Logger";

export class Marketplace implements IMarketplace  
{
    public exchanges : Array<IExchange> = new Array<Exchange>();
    public currentExchange : ExchangeInfo;

    constructor( public name : string)
    {
        this.create();

        /*
        component.onExchangeChanged.subscribe((c : BionicTraderComponent , e : IExchangeInfo) => {
            this.setCurrentExchange(e);
        })
        */
    }

    async create()
    {
        let exchangeList : IExchange[]; //Get Exchange List from Vue
        //this.addExchanges(this.component.exchangeInfos);
    }

    public addExchange( exchange: IExchange )
    {
        const findExchangeInfoIndex = this.exchanges.findIndex(ex => ex.info.exchange === exchange.info.exchange);
        if (findExchangeInfoIndex < 0) {
            this.exchanges.push(exchange);
        } else {
            this.exchanges[findExchangeInfoIndex] = {
                ...this.exchanges[findExchangeInfoIndex],
                ...exchange
            };
        }
    }

    public addExchanges( exchangeInfos : IExchangeInfo[] )
    {
        exchangeInfos.forEach(exchangeInfo =>
        {
            this.addExchange(new Exchange(exchangeInfo));
        });
    }

    public resetExchanges(exchangeInfos : IExchangeInfo[]) {
        this.exchanges = [];

        this.addExchanges(exchangeInfos);
    }

    public setCurrentExchange(exchangeInfo : IExchangeInfo)
    {
        // TODO:
        //find exchange in exchanges
        //exchange.addTradingPairs(this.component.tradingPairs)
        //exchange.addExchangeAssets(this.component.exchangeAssets)
    }
}
