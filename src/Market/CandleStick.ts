import { ICandlestick } from "../BionicTrader/BionicTraderInterfaces";

export class CandleStick implements ICandlestick
{   
    constructor( public open : number,
                public high : number,
                public low : number,
                public close : number,
                public volume : number,
                public quoteVolume : number,
                public btcVolume : number,
                public usdVolume : number,
                public time : Date)
    {
        // console.log("Constructing CandleStick");
    }
}
