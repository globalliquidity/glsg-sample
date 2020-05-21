import { IExchange, IExchangeInfo, IExchangeAsset, ITradingPair, IExchangeApiError } from "../BionicTrader/BionicTraderInterfaces";

export class ExchangeApiError implements IExchangeApiError  
{
    constructor( public code : number,
                 public message : string )
    {

    }
}
