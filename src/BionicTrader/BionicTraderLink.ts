import { ExchangeOrder } from "../Market/ExchangeOrder";
import { AblyMessageBusLink } from "./AblyMessageBusLink";
import { StateMachine, EventObject, Interpreter, Machine, interpret } from "xstate";
import { AblyMessageBus } from "./AblyMessageBus";
import Logger from "../Utils/Logger";
import { BionicTraderScene } from "./Scenes/BionicTraderScene/BionicTraderScene";


export class OrderUpdateEvent
{
    constructor(public type: string, public update: ExchangeOrder)
    {
    }
}

//Acts as a bridge between the message bus and the scene
//Message Bus messages are interpreted as events by the finite state machine
//We create data objects representing market events (order updates) and
//Place them on to a Queue managed by the Scene.
export class BionicTraderLink extends AblyMessageBusLink
{
     CLIENT_ID: string = "client_james"; // James
     ABLY_API_KEY: string = "eZKP_Q.Rt63UA:C7sWf1WgiFmdJU_p" //James
     //ABLY_API_KEY: string = "IvCe9Q.aPeohA:p_NRvLeSgxKLtgYc" //Binance Rig
     BINANCE_API_KEY: string = "0GhabqBc0mhrzfcZsUepT7JEie8JRYCjmDY3zyYiAChsEvAOXSsqKYA6A95gMQfy"; //James

    //CLIENT_ID:string = "client_ervin"; // Ervin
    //ABLY_API_KEY: string = "ReVb9g.ZNsl0Q:R85oIeg60ExwO0mB"; //Ervin
    //BINANCE_API_KEY: string = "wzudVz9bXocY0Q5W9YTMyfKxmfpooCOPis5yzu1MxrQFsVD2yorV9p5avMWFGvvq"; //Ervin

    //CLIENT_ID: string = "client_justin"; // Justin
    //ABLY_API_KEY: string = "mR6C0Q.sdfStA:Q6yg3qVoLitIhDYws"; //Justin
    //BINANCE_API_KEY: string = "[PASTE BINANCE API KEY]"; //Justin

    private fsm: StateMachine<Record<string, any>, any, EventObject>;
    private fsmService: Interpreter<Record<string, any>, any, EventObject>;

    constructor(public scene: BionicTraderScene, options?: any)
    {
        super(scene);
        this.messageBus = new AblyMessageBus(this);
        if (options) {
            if (options.Channel_Id) this.CLIENT_ID = options.Channel_Id;
            // this.CLIENT_ID = "client_Ervin";
            // this.ABLY_API_KEY = options.Ably;
            if (options.Binance) this.BINANCE_API_KEY = options.Binance;
        }

        this.fsm = Machine({
            id: "monitor",
            initial: "listening",
            states: {
              listening: {
                onEntry: 'connectToMessageBus',
                on: { TRADING_RIG_STARTED: "sending_key" ,TRADING_RIG_ONLINE: "monitoring_account" }
              },
              sending_key: {
                onEntry: 'sendKeyToRig',
                on: { KEY_RECEIVED: "monitoring_account" }
              },
              monitoring_account: {
                on: { ORDER_UPDATE: {actions: "updateScene"} }  
              },
              updating_scene: {
                onEntry: 'updateScene',
                on: { SCENE_UPDATED: "monitoring_account" }
              }
            }
        },
        {
            actions: {
                connectToMessageBus: (ctx, event) => {
                    Logger.log("connecting to message bus");
                    // console.log("connecting to message bus");
                    this.connect(this.ABLY_API_KEY, this.CLIENT_ID);
                    //this.messageBus.joinChannel("provisioning");
                    let channelName: string = "rig_link_with_" + this.CLIENT_ID;

                    if (this.messageBus)
                        this.messageBus.joinChannel(channelName);
                },
                sendKeyToRig: (ctx, event) => {
                    if (this.BINANCE_API_KEY && this.BINANCE_API_KEY !== '') {

                        if (this.messageBus)
                            this.messageBus.sendMessage("SENDING_KEY", this.BINANCE_API_KEY);
                    }
                },
                updateScene: (ctx, event) => {
                    let orderUpdateEvent : OrderUpdateEvent = event as OrderUpdateEvent;

                    Logger.log("adding order update to scene...");
                    let orderUpdate = orderUpdateEvent.update;
                    Logger.log(orderUpdate.id + "|" + orderUpdate.symbol + "|" + orderUpdate.side + "|" + orderUpdate.price + "|" + orderUpdate.quantity);
                    
                    if (this.scene != null)
                        this.scene.orderUpdateQueue.enqueue(orderUpdate);
                    else
                    {
                        Logger.log("scene is null...");
                    }
                }
            }
        });

        this.fsmService = interpret(this.fsm);
        this.fsmService.start();  
    }

    disconnect()
    {
        if (this.messageBus)
            this.messageBus.disconnect();
    }

    /*
    connect(apikey: string)
    {
        //this.messageBus.connect(apikey)
    }
    
    joinChannel(channelName: string) {
        throw new Error("Method not implemented.");
    }

    sendMessage(topic: string, message: string) {
        throw new Error("Method not implemented.");
    }
    */
    
    processEvent(eventName: string, eventData: string)
    {
        //Logger.log('link processing event: ' + eventName + " : " + eventData);
        
        switch(eventName)
        {
            case "ORDER_UPDATE":
            {
                
                var orderUpdateObject = JSON.parse(eventData);
                let orderUpdate : ExchangeOrder = new ExchangeOrder(orderUpdateObject.s,
                                                                orderUpdateObject.S,
                                                                orderUpdateObject.q,
                                                                orderUpdateObject.p,
                                                                orderUpdateObject.X,
                                                                orderUpdateObject.T,
                                                                orderUpdateObject.i);

                Logger.log("making order update event");                                              
                let orderUpdateEvent: OrderUpdateEvent = new OrderUpdateEvent("ORDER_UPDATE",orderUpdate);                                            
                this.fsmService.send(orderUpdateEvent);

                break;
            }
            default:
            {
            
                this.fsmService.send(eventName);
            }
        }
    }
}
