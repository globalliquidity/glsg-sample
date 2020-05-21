import { IExchange, IExchangeInfo, IExchangeAsset, ITradingPair } from "../BionicTrader/BionicTraderInterfaces";
import { ExchangeAsset } from "./ExchangeAsset";
import { TradingPair } from "./TradingPair";

export class Exchange implements IExchange  
{
    constructor(public info : IExchangeInfo, public exchangeAssets: Array<IExchangeAsset> = [], public tradingPairs: Array<ITradingPair> = [] )
    {
    }

    public addExchangeAsset( asset : ExchangeAsset )
    {
        this.exchangeAssets.push(asset);
    }

    public addExchangeAssets( exchangeAssets : IExchangeAsset[] )
    {
        exchangeAssets.forEach(exchangeAsset =>
        {
            this.exchangeAssets.push(new ExchangeAsset(exchangeAsset.id,
                                        exchangeAsset.name,
                                        exchangeAsset.symbol,
                                        exchangeAsset.tradingSymbol));
        });
    }

    public addTradingPair ( pair : TradingPair )
    {
        this.tradingPairs.push(pair);
    }

    public addTradingPairs( tradingPairs : ITradingPair[] )
    {
        tradingPairs.forEach(tradingPair =>
        {
            this.tradingPairs.push(new TradingPair(tradingPair.baseTradingSymbol,
                                                    tradingPair.quoteTradingSymbol));
        });
    }
}
