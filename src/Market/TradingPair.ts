import { ITradingPair } from "../BionicTrader/BionicTraderInterfaces";

export class TradingPair implements ITradingPair
{
    constructor(public baseTradingSymbol: string,
                public quoteTradingSymbol: string)
    {

    }
}
