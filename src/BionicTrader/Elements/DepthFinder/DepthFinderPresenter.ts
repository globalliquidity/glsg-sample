import * as bjs from 'babylonjs';
import * as currency from 'currency.js';
import { EventDispatcher, SignalDispatcher } from 'strongly-typed-events';

import { GLSGColor, MarketSide } from '../../../Enums';
import { MarketDataSample } from '../../../Market/MarketDataSample';
import { OrderBookEntry } from '../../../Market/OrderBookEntry';
import { VectorFieldLayerType } from '../../../SceneGraph/Enums';
import { VectorFieldCell } from '../../../SceneGraph/VectorFieldCell';
import { VectorFieldLayer } from '../../../SceneGraph/VectorFieldLayer';
import { VectorFieldPresenter } from '../../../SceneGraph/VectorFieldPresenter';
import { VectorFieldRow } from '../../../SceneGraph/VectorFieldRow';
import { IOrderBookEntry } from '../../BionicTraderInterfaces';
import { DepthFinderRow } from './DepthFinderRow';
import { DepthFinderUpdateMessage } from './DepthFinderUpdateMessage';
import { MarketMaker } from '../../../Market/MarketMaker';

export class DepthFinderPresenter extends VectorFieldPresenter
{
    public originPrice : currency;
    public midPrice : currency;
    public spread : currency;
    public insideBid : OrderBookEntry | undefined;
    public insideAsk : OrderBookEntry | undefined;
    public orderImbalance : number = 0;
    public currentGeneration : number = 0;

    public gridOriginOffsetX : number = 0;
    public cellWidth : number = 0.5;
    //public cellH : number = 0.5;

    private _addedNewRow = new SignalDispatcher();
    private _removedLastRow = new EventDispatcher<DepthFinderPresenter, DepthFinderRow>();

    isReady : boolean = false;

    numTradesRemoved : number = 0;

    isAddingRow : boolean = false;

    marketMaker : MarketMaker | undefined;

    get onAddedNewRow() {
        return this._addedNewRow.asEvent();
    }

    get onRemovedLastRow() {
        return this._removedLastRow.asEvent();
    }

    constructor(public rowCount : number, public columnCount : number, public updateInteval : number, public priceQuantizeDivision : number)
    {
        super(rowCount, columnCount);
        this.originPrice = currency(0, { precision : this.calculateNumDecimalPlaces()});
        this.midPrice = currency(0, { precision : this.calculateNumDecimalPlaces()});
        this.spread = currency(0, { precision : this.calculateNumDecimalPlaces()});
    }

    protected processMessage(message : DepthFinderUpdateMessage)
    {   
        //console.log(message);
        this.isAddingRow = true;
        this.addRowToPresenter(message.sample); 
        this._addedNewRow.dispatch();
        this.currentGeneration ++;
        this.isAddingRow = false;
    }

    protected addRowToPresenter(sample : MarketDataSample)
    {
        //console.log(sample);
        this.orderImbalance = sample.orderImbalance;

        let row : DepthFinderRow;

        let newRowStartingIndex : number = 0;

        newRowStartingIndex = (this.currentGeneration % this.rowCount) * this.columnCount;

        if (this.rows.length === this.rowCount)
        {
           let lastRow : DepthFinderRow =  this.removeLastRow();

           if (lastRow)
           {
               let layer : VectorFieldLayer | undefined =  lastRow.getLayer(VectorFieldLayerType.TradeReport);

               if (layer)
               {
                    this.numTradesRemoved += layer.cellsByIndex.size;
                    this._removedLastRow.dispatch(this,lastRow);
               }
 
           }
        }

        row = new DepthFinderRow(this,this.columnCount,0,this.currentGeneration,newRowStartingIndex);  

        let priceQuantizeScalingFactor : number = (1 / this.priceQuantizeDivision);

        this.midPrice =  this.quantizePrice(sample.midPrice); //Math.floor((sample.midPrice * priceQuantizeScalingFactor)) / priceQuantizeScalingFactor;
        this.spread = sample.spread;
        this.insideBid = sample.insideBid;
        this.insideAsk = sample.insideAsk;

        row.insideBidPrice = sample.insideBid.price;
        row.insideAskPrice = sample.insideAsk.price;

        let currentRowOffset: number = 0;

        if (this.originPrice.value === 0)
        {
            this.originPrice = sample.midPrice;
            this.gridOriginOffsetX = ( this.originPrice.value - Math.floor(this.originPrice.value) ) * priceQuantizeScalingFactor;
            currentRowOffset  = 0;
            // console.log("DepthFinderPresenter : Settting Grid Origin Offset X: " + this.gridOriginOffsetX);
        }
        else
        {
            let midPriceDistanceFromOrigin : currency = this.midPrice.subtract(this.originPrice);
            currentRowOffset = this.quantizePrice(midPriceDistanceFromOrigin).value * priceQuantizeScalingFactor;
        }

        row.positionOffsetX = currentRowOffset;

        let insideBidPrice : currency = sample.insideBid.price;
        row.insideBidOffsetX = this.offsetForPrice(insideBidPrice)
         
        let insideAskPrice : currency = sample.insideAsk.price;
        row.insideAskOffsetX = this.offsetForPrice(insideAskPrice);

        this.addOrderBookToRow(sample,row);
        this.addTradeReportsToRow(sample,row);
        this.addUserActivityToRow(sample,row);
        this.addRowToFront(row);

        //console.log(this);

         if (!this.isReady)
            this.isReady = true;
     }
    
    protected addOrderBookToRow(sample : MarketDataSample, row: DepthFinderRow)
    {
        let orderBookLayer : VectorFieldLayer = new VectorFieldLayer(row,this.columnCount,row.startingIndex);

        row.addLayer(VectorFieldLayerType.OrderBook,orderBookLayer);

        if (orderBookLayer)
        {
            for (let i : number = 0; i < row.cellCount; i++)
            {
               
                let cellSide        : MarketSide = MarketSide.Bid;
                let cellColor       : GLSGColor = GLSGColor.Purple;
                let cellOffsetX     : number = 0;
                let cellScaleY      : number = 0;
                let orderBookIndex  : number = 0;
                let orderBookEntry  : IOrderBookEntry;

                let isCellInRange : boolean = true;
                
                if (i < row.cellCount/2)
                {
                    orderBookEntry = sample.orders.getEntry(MarketSide.Bid,i);
                    
                    if (Math.abs(this.midPrice.value - orderBookEntry.price.value) < 20)
                    {

                        cellSide = MarketSide.Bid;
                        cellColor = GLSGColor.SkyBlue;
                        //orderBookIndex =  (row.cellCount / 2) - i - 1;
                        cellOffsetX = - (this.midPrice.subtract(orderBookEntry.price)) * (1 / this.priceQuantizeDivision);
                        cellScaleY = orderBookEntry.quantity;
                    }
                    else
                    {
                        isCellInRange = false;
                    }
                        
                }
                else
                {
                    orderBookIndex = i - (row.cellCount / 2);
                    orderBookEntry = sample.orders.getEntry(MarketSide.Ask,orderBookIndex);

                    if (Math.abs(orderBookEntry.price.value - this.midPrice.value) < 20)
                    {
                        cellSide = MarketSide.Ask;
                        cellColor = GLSGColor.HotPink;
                        
                        
                        cellOffsetX = orderBookEntry.price.subtract(this.midPrice).value * (1 / this.priceQuantizeDivision);
                        cellScaleY = orderBookEntry.quantity;
                    }
                    else
                    {
                        isCellInRange = false;
                    }
                }

                if(isCellInRange)
                {
                    let cell : VectorFieldCell = new VectorFieldCell(VectorFieldLayerType.OrderBook);
                    cell.price = orderBookEntry.price;
                    cell.height = cellScaleY;
                    cell.positionOffset = new  bjs.Vector2(cellOffsetX,cellScaleY/2);
                    cell.color = cellColor;
                    orderBookLayer.addCell(cell.price,cell);
                
                }            
            }   
        }
    }

    protected addTradeReportsToRow(sample : MarketDataSample, row: DepthFinderRow)
    {
        let startingIndex : number = 0;

        if (this.currentGeneration > 0)
        {
            let layer : VectorFieldLayer | undefined =  this.getCurrentRowLayer(VectorFieldLayerType.TradeReport);

            if (layer)
                startingIndex = layer.currentIndex
        }

        let tradeReportLayer : VectorFieldLayer = new VectorFieldLayer(row,this.columnCount,startingIndex);

        row.addLayer(VectorFieldLayerType.TradeReport,tradeReportLayer );
        
        if (tradeReportLayer)
        {
            let newTradeCount : number = sample.trades.trades.length;
            //console.log("DepthFinderPresenter : Adding New Trades to Row: " + newTradeCount);
            sample.trades.trades.forEach(trade => {

                //Make a new cell to add to the layer
                let cell : VectorFieldCell = new VectorFieldCell(VectorFieldLayerType.TradeReport);

                let cellOffsetX     : number = 0;
                //Compare the trade price with the current mid price.
                //Mark all trades above the mid price as buys.
                //Set the cell offset x to be the normalized units away from the middle of this row.
                if (trade.price > sample.midPrice)
                {
                    cell.color = GLSGColor.Green;
                    cellOffsetX = (trade.price.subtract(sample.midPrice)).value * (1 / this.priceQuantizeDivision);
                }
                else
                {
                    cell.color = GLSGColor.Red;
                    cellOffsetX = (sample.midPrice.subtract(trade.price)).value * (1 / this.priceQuantizeDivision);
                }

                
                cell.height = trade.quantity;
                cell.price = trade.price;

                let orderBookCell = row.getCellByPrice(VectorFieldLayerType.OrderBook,cell.price);

                let positionOffsetY : number = 0;

                if (orderBookCell)
                {
                    positionOffsetY += orderBookCell.height;
                }

                cell.positionOffset = new bjs.Vector2(cellOffsetX,positionOffsetY);
                tradeReportLayer.addCell(cell.price,cell);
            });
        }
    }

    protected addUserActivityToRow(sample : MarketDataSample, row: DepthFinderRow)
    {
        let startingIndex : number = 0;

        if (this.currentGeneration > 0)
        {
            let layer : VectorFieldLayer | undefined =  this.getCurrentRowLayer(VectorFieldLayerType.TradeReport);

            if (layer)
                startingIndex = layer.currentIndex

        }

        let userActivityLayer : VectorFieldLayer = new VectorFieldLayer(row,this.columnCount,startingIndex);

        row.addLayer(VectorFieldLayerType.UserActivity,userActivityLayer );
        
        if (userActivityLayer)
        {
            if (this.marketMaker)
            {
                if (this.marketMaker.currentBidOrder)
                {
                    let cell : VectorFieldCell = new VectorFieldCell(VectorFieldLayerType.UserActivity); 
                    let cellOffsetX     : number = 0;     
                    cell.color = GLSGColor.Yellow;
                    cellOffsetX = -(sample.midPrice.subtract(this.marketMaker.currentBidOrder.price)).value * (1 / this.priceQuantizeDivision);
                    
                    cell.height = this.marketMaker.currentBidOrder.quantity;
                    cell.price = this.marketMaker.currentBidOrder.price;

                    let orderBookCell = row.getCellByPrice(VectorFieldLayerType.OrderBook,cell.price);

                    let positionOffsetY : number = 0;
    
                    if (orderBookCell)
                    {
                        positionOffsetY += orderBookCell.height;
                    }

                    let tradeReportCell = row.getCellByPrice(VectorFieldLayerType.TradeReport,cell.price);

                    if (tradeReportCell)
                    {
                        positionOffsetY += tradeReportCell.height;
                    }

                    cell.positionOffset = new bjs.Vector2(cellOffsetX,positionOffsetY);
                  
                    userActivityLayer.addCell(cell.price,cell);
                }
                

                if (this.marketMaker.currentAskOrder)
                {
                    let cell : VectorFieldCell = new VectorFieldCell(VectorFieldLayerType.UserActivity);                    
                    let cellOffsetX     : number = 0;

                    cell.color = GLSGColor.Orange;
                    cellOffsetX = ((this.marketMaker.currentAskOrder.price.subtract(sample.midPrice)).value * (1 / this.priceQuantizeDivision));
                    cell.height = this.marketMaker.currentAskOrder.quantity;
                    cell.price = this.marketMaker.currentAskOrder.price;

                    let orderBookCell = row.getCellByPrice(VectorFieldLayerType.OrderBook,cell.price);

                    let positionOffsetY : number = 0;
    
                    if (orderBookCell != null)
                    {
                        positionOffsetY += orderBookCell.height;
                    }

                    let tradeReportCell = row.getCellByPrice(VectorFieldLayerType.TradeReport,cell.price);

                    if (tradeReportCell != null)
                    {
                        positionOffsetY += tradeReportCell.height;
                    }

                    cell.positionOffset = new bjs.Vector2(cellOffsetX-2,positionOffsetY);
                    userActivityLayer.addCell(cell.price,cell);
                }
                
            }
        }
    }

    updateCurrentRow(layerType : VectorFieldLayerType, side : MarketSide, price : currency, quantity : number)
    {
        if (! this.isAddingRow)
        {
            let layer = this.getCurrentRowLayer(layerType);

            if (layer)
            {
               // let cell : VectorFieldCell;
                let cellOffsetX = 0;
                
                let cell : VectorFieldCell | undefined = layer.getCellByPrice(price);
        
                if (cell != null)
                {      
                    cell.height = quantity;
                }
                else
                {
                    /*
                    let cell : VectorFieldCell = new VectorFieldCell(VectorFieldLayerType.OrderBook);
                    cell.price = price;
                    cell.height = quantity;
        
                    if (side === MarketSide.Bid)
                    {c 1
                        cell.color = GLSGColor.SkyBlue;
                        cellOffsetX = - (this.midPrice.subtract(price)) * (1 / this.priceQuantizeDivision);
                    }
                    else
                    {
                        cell.color = GLSGColor.HotPink;
                        cellOffsetX = price.subtract(this.midPrice).value * (1 / this.priceQuantizeDivision);
                    }
        
        
                    cell.positionOffset = new  bjs.Vector2(cellOffsetX,quantity/2);
                    //cell.color = cellColor;
                    layer.addCell(cell.price,cell);
                    */
                }
            }
        }
    }

    //Remove Last Row and return the number of particles that were in the row.
    public removeLastRow() : DepthFinderRow
    {
        let backRow : DepthFinderRow = this.rows.pop() as DepthFinderRow;
        return backRow;
    }

    public getNewRowFromBack() : DepthFinderRow
    {
        let backRow : DepthFinderRow = this.rows.pop() as DepthFinderRow;
        backRow.initialize();
        return backRow;
    }

    public addRowToFront(row : DepthFinderRow)
    {
        this.rows.unshift(row);
        //console.log("DepthFinderPresent : added row to front");
    }

    getLayerByIndex(layer: VectorFieldLayerType, index : number) : VectorFieldLayer | undefined
    {
        //console.log("DepthFinderPresenter : Get Layer By Index : " + index);
        for ( let i : number = 0; i < this.rows.length; i++)
        {
            let row : VectorFieldRow = this.rows[i];

            if (row)
            {
                let targetLayer : VectorFieldLayer | undefined = row.getLayer(layer);

                if (targetLayer)
                {
                    let adjustedIndex : number = index;
    
                    if (layer === VectorFieldLayerType.TradeReport)
                    {
                        adjustedIndex -= this.numTradesRemoved;
                    }
    
                    if (( targetLayer.startingIndex <= adjustedIndex) && (targetLayer.endingIndex >= adjustedIndex))
                    {
                        return targetLayer as VectorFieldLayer;
                    }
                }     
            }

          
        }
    }

    quantizePrice(price: currency, side?:MarketSide): currency
    {
        //let newQD =  new Decimal(1);
        let quantizeMultiplier : number = 1/this.priceQuantizeDivision;
        const decimalPlaceCount = this.calculateNumDecimalPlaces(this.priceQuantizeDivision);

        let quantizedPrice : currency; 

       // if (side == undefined) {
            quantizedPrice = currency(Math.round(price.value * quantizeMultiplier)/quantizeMultiplier, { precision : decimalPlaceCount });
       // }
    /*    else if (side === MarketSide.Bid)
        {
            quantizedPrice = currency(Math.ceil(price.value * quantizeMultiplier)/quantizeMultiplier, { precision : decimalPlaceCount });
        }
        else if (side === MarketSide.Ask)
        {
            quantizedPrice = currency(Math.floor(price.value * quantizeMultiplier)/quantizeMultiplier, { precision : decimalPlaceCount });
        }
    */

        return quantizedPrice;
    }

    calculateNumDecimalPlaces(priceQuantizeDivision?: number) {
        let n: number = priceQuantizeDivision || this.priceQuantizeDivision;
        let s = n.toString();
        s = s.length > 8 ? s.substring(0, 8) : s;
        n = +s;

        if (n % 1 > 0) {
            let nS = n.toString().split('.');
            return nS[1].length > 6 ? 6 : nS[1].length;
        }

        return 2;
    }

    offsetForPrice(price : currency) : number
    {
        let priceQuantizeScalingFactor = (1 / this.priceQuantizeDivision);
        let distanceFromMidPrice : number = price.subtract(this.midPrice).value;
        let offset : number =  ((distanceFromMidPrice * priceQuantizeScalingFactor ));
        return offset;
    }
    
}
