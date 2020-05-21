import Logger from '../Utils/Logger';
import { ExchangeOrder } from './ExchangeOrder';
import { StateMachine, EventObject, Interpreter, Machine, interpret } from 'xstate';
import { OrderSide, OrderState } from '../Enums';
import { DepthFinderPresenter } from '../BionicTrader/Elements/DepthFinder/DepthFinderPresenter';



// The hierarchical (recursive) schema for the states
interface MarketMakerSchema {
    states: {
      listening: {};
      in_market: {
            states : {
                making_bid: {};
                making_ask: {};
                making_both: {};
            };
        }
      };
    }
  
  // The events that the machine handles
  type MarketMakerEventType =
    | { type: 'BID_TARGET_SET'; price : currency }
    | { type: 'BID_ORDER_CONFIRMED' }
    | { type: 'BID_CANCEL_CONFIRMED' }
    | { type: 'ASK_TARGET_SET'; price : currency }
    | { type: 'ASK_ORDER_CONFIRMED' }
    | { type: 'ASK_CANCEL_CONFIRMED' }
    | { type: 'BOTH_TARGETS_SET'; bidPrice : currency; askPrice : currency }
    | { type: 'BOTH_TARGETS_SET' }
    | { type: 'EXIT_MARKET_BID' }
    | { type: 'EXIT_MARKET_ASK' }
    | { type: 'EXIT_MARKET_ALL' }


  
  // The context (extended state) of the machine
  interface MarketMakerContext {
    orderSize :         number;
    targetBidPrice :    currency;
    targetAskPrice :    currency;
    targetSpread :      currency;
    currentBidOrder :   ExchangeOrder;
    currentAskOrder :   ExchangeOrder;
  }

export class MarketMakerEvent
{
    constructor(public type: string, public bidPrice?: currency, public askPrice? : currency)
    {
    }
}

export class MarketMaker
{
    private symbol :    string        = "BTC/USDT";
    orderSize :         number        = 1.0;
    targetBidPrice :    currency | undefined    = undefined;
    targetAskPrice :    currency | undefined     = undefined;
    targetSpread :      currency | undefined    = undefined;
    currentBidOrder :   ExchangeOrder | undefined    = undefined;
    currentAskOrder :   ExchangeOrder | undefined = undefined;

    private stateMachine: StateMachine<MarketMakerContext, MarketMakerSchema, MarketMakerEventType>;
    private stateMachineService: Interpreter<MarketMakerContext, MarketMakerSchema, MarketMakerEventType>;

    public constructor(public presenter : DepthFinderPresenter)
    {
        presenter.marketMaker = this;
        this.stateMachine = Machine<MarketMakerContext, MarketMakerSchema, MarketMakerEventType>({
            id: "market_maker",
            initial: "listening",
            states: {
              listening: {
                on: { BID_TARGET_SET: "in_market", ASK_TARGET_SET: "in_market", BOTH_TARGETS_SET: "in_market" }
                },
              in_market: {
                initial: 'making_both',
                on: { EXIT_MARKET_ALL : 'listening' },
                states : {
                    making_bid: {
                        onEntry: 'placeBidOrder',
                        onExit : 'cancelBidOrder',
                        on: {   BID_ORDER_CONFIRMED : {actions: "onBidOrderConfirmed"},
                                BID_TARGET_SET :  {actions: "cancelBidOrder"},
                                BID_CANCEL_CONFIRMED : { actions: "placeBidOrder"},
                                EXIT_MARKET_BID : { actions: "cancelBidOrder"},

                            }
                      },
                      making_ask: {
                        onEntry: 'placeAskOrder',
                        onExit : 'cancelAskOrder',
                        on: {   ASK_ORDER_CONFIRMED : {actions: "onAskOrderConfirmed"},
                                ASK_TARGET_SET :  {actions: "cancelAskOrder"},
                                ASK_CANCEL_CONFIRMED : { actions: "placeAskOrder"},
                                EXIT_MARKET_ASK : { actions: "cancelBidOrder"},
                            }
                      },
                      making_both: {
                        onEntry: 'placeBidAndAskOrder',
                        onExit : 'cancelBothOrders',
                        on: {   BID_ORDER_CONFIRMED : {actions: "onBidOrderConfirmed"},
                                BID_TARGET_SET :  {actions: "cancelBidOrder"},
                                BID_CANCEL_CONFIRMED : { actions: "placeBidOrder"},
                                ASK_ORDER_CONFIRMED : {actions: "onAskOrderConfirmed"},
                                ASK_TARGET_SET :  {actions: "cancelAskOrder"},
                                ASK_CANCEL_CONFIRMED : { actions: "placeAskOrder"}
                            }
                      },
    
                    }
                },
            } //states
        },
        {
            actions: {
                connectToMessageBus: (ctx, event) =>{
                    Logger.log("connecting to message bus");      
                },
                placeBidOrder: (ctx, event) => {
                    if (this.targetBidPrice)
                        this.currentBidOrder = new ExchangeOrder(this.symbol,OrderSide.Buy,this.orderSize,this.targetBidPrice,OrderState.Placed, 0,0);
                },
                placeAskOrder: (ctx, event) => {
                    if (this.targetAskPrice)
                        this.currentAskOrder = new ExchangeOrder(this.symbol,OrderSide.Sell,this.orderSize,this.targetAskPrice,OrderState.Placed, 0,0);
                },
                placeBidAndAskOrder: (ctx, event) => {
                    if ( (this.targetBidPrice) && (this.targetAskPrice))
                    {
                        this.currentBidOrder = new ExchangeOrder(this.symbol,OrderSide.Buy,this.orderSize,this.targetBidPrice,OrderState.Placed, 0,0);
                        this.currentAskOrder = new ExchangeOrder(this.symbol,OrderSide.Sell,this.orderSize,this.targetAskPrice,OrderState.Placed, 0,0);
                    }
                },
                onBidOrderConfirmed : (ctx, event) => {
                    if (this.currentBidOrder)
                        this.currentBidOrder.state = OrderState.Confirmed;
                },
                onAskOrderConfirmed : (ctx, event) => {
                    if (this.currentAskOrder)
                        this.currentAskOrder.state = OrderState.Confirmed;
                },
                cancelBidOrder: (ctx, event) => {
                    if (this.currentBidOrder)
                    {
                        this.currentBidOrder.state = OrderState.CancelRequested;
                        this.stateMachineService.send("BID_CANCEL_CONFIRMED");
                    }
                   
                },
                cancelAskOrder: (ctx, event) => {
                    if (this.currentAskOrder)
                    {
                        this.currentAskOrder.state = OrderState.CancelRequested;
                        this.stateMachineService.send("ASK_CANCEL_CONFIRMED");    
                    }
                },
                cancelAllOrders: (ctx, event) => {
                    if (this.currentBidOrder)
                        this.currentBidOrder.state = OrderState.CancelRequested;
                    if (this.currentAskOrder)
                        this.currentAskOrder.state = OrderState.CancelRequested;
                },
            }
        });

        this.stateMachineService = interpret(this.stateMachine);
        this.stateMachineService.start();  
    }

    processEvent(event : MarketMakerEvent)
    {
        switch(event.type)
        {
            case "BID_TARGET_SET":
            {
                this.targetBidPrice = event.bidPrice;

                if (this.targetBidPrice)
                    this.stateMachineService.send( { type: event.type, price: this.targetBidPrice });
                break;
            }
            case "ASK_TARGET_SET":
            {                                             
                this.targetAskPrice = event.askPrice;

                if (this.targetAskPrice)
                    this.stateMachineService.send( { type: event.type, price: this.targetAskPrice });
                break;
            }
            case "BOTH_TARGETS_SET":
                {  
                    this.targetBidPrice = event.askPrice;                                           
                    this.targetAskPrice = event.askPrice;
                    this.stateMachineService.send( { type: event.type, bidPrice: event.bidPrice, askPrice: event.askPrice });
                    break;
                }
            default:
            {
            
                //this.stateMachineService.send({ type: "BID_TARGET_SET" });
            }
        }
    }
}




