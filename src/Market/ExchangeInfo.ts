import { IExchangeInfo } from "../BionicTrader/BionicTraderInterfaces";

export class ExchangeInfo implements IExchangeInfo
{
    constructor(public exchange : string,
                public bestCaseFee : number,
                public worstCaseFee : number,
                public icon : string)
                {

                }
}
