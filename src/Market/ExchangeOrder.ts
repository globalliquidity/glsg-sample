import { IExchangeOrder } from "../BionicTrader/BionicTraderInterfaces";
import { MarketSide, OrderStatus, OrderSide, OrderState } from "../Enums";
import Logger from '../Utils/Logger';
import * as currency from 'currency.js';

export class ExchangeOrder implements IExchangeOrder
{
    side!: OrderSide;
    state! : OrderState;

    constructor(public symbol: string,
                side: OrderSide,
                public quantity: number,
                public price: currency,
                state : OrderState,
                public time: number,
                public id: number)
    {
        //Logger.log("Constructing ExchangeOrder");

        /*
        if (side === "BUY" || side === "buy")
        {
            this.side = OrderSide.Buy;
        }
        else
        {
            this.side = OrderSide.Sell;
        }

        switch(status)
        {
            case "NEW":
                this.status = OrderStatus.New;
                break;
            case "PARTIALLY_FILLED":
                this.status = OrderStatus.PartiallyFilled;
                break;
            case "FILLED":
                this.status = OrderStatus.Filled;
                break;              
            case "CANCELED":
                this.status = OrderStatus.Cancelled;
                break;
            case "PENDING_CANCEL":
                this.status = OrderStatus.PendingCancel;
                break;  
            case "REJECTED":
                this.status = OrderStatus.Rejected;
                break;
            case "EXPIRED":
                this.status = OrderStatus.Expired;
                break;    
            
        }*/
    }
}