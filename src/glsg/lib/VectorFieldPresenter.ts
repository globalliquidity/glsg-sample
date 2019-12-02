import { SceneElementPresenter } from './SceneElementPresenter';
import { VectorField } from './VectorField';
import Logger from './Logger';

enum VectorFieldCellEntryType
{
    OrderBook,
    TradeHistory,
    UserOrder,
    UserExecution
}

export class VectorFieldCellEntry
{
    constructor(public type : VectorFieldCellEntryType, value:number, scalingFactor : number)
    {
        Logger.log('value: ' + value + ', scalingFactor: ' + scalingFactor);
    }
}

export class VectorFieldCell
{
    entries : Map<VectorFieldCellEntryType, Array<VectorFieldCellEntry>> = new Map<VectorFieldCellEntryType, Array<VectorFieldCellEntry>>();

    constructor(public row : number, public column: number)
    {
    }
}

export class VectorFieldPresenter extends SceneElementPresenter
{
    cells: VectorFieldCell[][];

    constructor(public element: VectorField, rowCount : number, columnCount : number)
    {
        super(element);

        this.cells = new Array<Array<VectorFieldCell>>();
        for (let y = 0; y <= rowCount; y++) {
          let row:VectorFieldCell[]  = new Array<VectorFieldCell>();      
          for (let x = 0; x <=columnCount; x++){
            row.push(new VectorFieldCell(y, x));
          }
          this.cells.push(row);
        }
    }
}
