import { EventObject, interpret, Machine, StateMachine } from 'xstate';
import { Interpreter } from "xstate/lib/interpreter";
import { OrderStatus } from '../../../Enums';
import { ExchangeOrder } from '../../../Market/ExchangeOrder';
import { MarketDataSampler } from '../../../Market/MarketDataSampler';
import Logger from '../../../Utils/Logger';
import { BionicTraderScene } from './BionicTraderScene';
import { SceneElement } from '../../../SceneGraph/SceneElement';
//
// UserOrderSceneElement is the base class for making SceneElements that render or otherwise represent
// real orders on exchanges. It is  simply a SceneElement with an associated ExchangeOrder, which it will use
// as the data model to drive it's appearance and behavior. Note that order objects are meant to be updated,
// as the status of the order, on the exchange, changes. Orders begin as "New", and may end as "Filled", "Cancelled",
// or "Partially Filled". We use a Hierarchical Finite State Machine to define all the possible sequences of order status.
// As we get order status update messages from the message bus, we pass them to this.fsmService.send(orderStatus), and the
// fsm figures out what to do, based on current order status.
//

export class UserOrderSceneElement extends SceneElement
{
    private fsm: StateMachine<Record<string, any>, any, EventObject>;
    private fsmService: Interpreter<Record<string, any>, any, EventObject>;

    constructor(
        public name: string,

        public x: number,
        public y: number,
        public z: number,
        scene: BionicTraderScene,
        sampler : MarketDataSampler,
        public rows : number,
        public columns : number,
        public cellWidth : number,
        public cellHeight : number,
        public cellDepth : number,
        public order: ExchangeOrder,
        public generation : number
    ) {
        super(name, x, y, z, scene);

        this.fsm = Machine({
            id: "monitor",
            initial: "placed",
            states: {
                placed: {
                    onEntry: 'onOrderPlaced',
                    on: {
                        ORDER_PENDING_CANCEL: "pendingCancel",
                        ORDER_CANCELLED: "cancelled",
                        ORDER_PARTIALLY_FILLED: "partiallyFilled",
                        ORDER_FILLED: "filled"
                    }
                },
                pendingCancel: {
                    onEntry: 'onOrderPendingCancel',
                    on: {
                        ORDER_CANCELLED: "cancelled",
                        ORDER_PARTIALLY_FILLED: "partiallyFilled",
                        ORDER_FILLED: "filled"
                    }
                },
                cancelled: {
                    onEntry: 'onOrderCancelled',
                },
                partiallyfilled: {
                    onEntry: 'onOrderPartiallyFilled',
                    on: {
                        ORDER_CANCELLED: "cancelled",
                        ORDER_PARTIALLY_FILLED: "partiallyfilled",
                        ORDER_FILLED: "filled"
                    }
                },
                filled: {
                    onEntry: 'onOrderFilled',
                },
            }
        },
        {
            actions: {
                onOrderPlaced: () => {
                    this.onPlaced();
                },
                onOrderPendingCancel: () => {
                    this.onPendingCancel();
                },
                onOrderCancelled: () => {
                    this.onCancelled();
                },
                onOrderPartiallyFilled: () => {
                    this.onPartiallyFilled();
                },
                onOrderFilled: () => {
                    this.onFilled();
                }
            }
        });

        this.fsmService = interpret(this.fsm);
        this.fsmService.start();  
    }

    public UpdateStatus(status: OrderStatus)
    {
        
        let statusEvent: string = "";

        switch(status)
        {
            case OrderStatus.New:
                statusEvent = "ORDER_PLACED";
                //this.onPlaced();
                break;
            case OrderStatus.PendingCancel:
                statusEvent = "ORDER_PENDING_CANCEL";
                break;
            case OrderStatus.Cancelled:
                statusEvent = "ORDER_CANCELLED";
                //this.onCancelled();
                break;
            case OrderStatus.PartiallyFilled:
                statusEvent = "ORDER_PARTIALLY_FILLED";
                break;
            case OrderStatus.Filled:
                statusEvent = "ORDER_FILLED";
                break;
            default:
                break;
        }

        Logger.log("Updating Order Status : " + statusEvent );
        this.fsmService.send(statusEvent);
    }

    protected onPlaced()
    {
        
    }

    protected onPendingCancel()
    {

    }
    
    protected onCancelled()
    {

    }

    protected onPartiallyFilled()
    {

    }

    protected onFilled()
    {

    }
}
