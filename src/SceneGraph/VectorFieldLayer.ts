import * as currency from 'currency.js';
import { VectorFieldCell } from './VectorFieldCell';
import { VectorFieldRow } from './VectorFieldRow';

export class VectorFieldLayer
{
   cellsByPrice : Map<currency,VectorFieldCell> = new Map<currency,VectorFieldCell>();
   cellsByIndex : Map<number,VectorFieldCell> = new Map<number, VectorFieldCell>();
   currentIndex : number = this.startingIndex;

   get endingIndex() : number
   {
       return this.currentIndex-1;
   }

   get numCells() : number
   {
       return this.cellsByPrice.size;
   }

   constructor(public row:VectorFieldRow,public cellCount : number, public startingIndex : number = 0)
   {

   }

   getCellByIndex(index : number) : VectorFieldCell | undefined
   {
        //console.log("VectorFieldLayer : Get Cell By Index :" + index);

        if (index >= this.startingIndex)
        {
            if ( index <= this.endingIndex)
            {
                //console.log("VectorFieldLayer : Index is in range :" + index);
                return this.cellsByIndex.get(index);
            }
            //console.log("VectorFieldLayer : Can't get cell for :" + index);
        }
        //console.log("VectorFieldLayer : Can't get cell for :" + index);
        return undefined;
    }

    getCellByPrice( price : currency ) : VectorFieldCell | undefined
    {   

        //let cell : VectorFieldCell = null;

        for(let cell  of Array.from( this.cellsByPrice.values()) )
        {
            if (cell.price.value === price.value)
                return cell;        
        }
        //console.log("VectorFieldLayer :Couldn't Find Cell For price :" + price);
        //return null;
    }

    public addCell(price : currency, cell : VectorFieldCell)
    {
        if (this.cellsByPrice != null)
            this.cellsByPrice.set(price,cell);

        if (this.cellsByIndex != null)
        {
            this.cellsByIndex.set(this.currentIndex,cell);
            this.currentIndex ++;
        }

        this.row.currentIndex ++;
    }

    public initialize()
    {
        delete this.cellsByPrice;
        this.cellsByPrice = new Map<currency,VectorFieldCell>();
        this.startingIndex = 0;

        this.onInitialize();  
    }

    protected onInitialize() { }
 
}

/*
export class OrderBookLayer extends VectorFieldLayer
{
    constructor(public row:VectorFieldRow, public cellCount : number)
    {
        super(row,cellCount);
    }

    getCellByPrice(price : currency) : VectorFieldCell
    {
        if (this.cells.has(price))
            return this.cells.get(price);
        return null;
    }
}

export class TradeReportLayer extends VectorFieldLayer
{    
    constructor(public row:VectorFieldRow, public cellCount : number, public startingIndex : number = 0)
    {
        super(row,cellCount,startingIndex);
    }


    protected onInitialize()
    {
    }

}
*/