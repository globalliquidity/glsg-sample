import { SceneElementPresenter } from './SceneElementPresenter';
import { PresenterUpdateMessage } from './PresenterUpdateMessage';
import { VectorFieldCell } from './VectorFieldCell';
import { VectorFieldLayerType } from './Enums';
import { VectorFieldLayer } from './VectorFieldLayer';
import { VectorFieldRow } from './VectorFieldRow';

export class VectorFieldPresenter extends SceneElementPresenter<PresenterUpdateMessage>
{
    rows: Array<VectorFieldRow>;

    public numParticlesRemoved : number = 0;

    constructor(public rowCount : number, public columnCount : number)
    {
        super();

        this.rows = new Array<VectorFieldRow>();
        /*
        for (let y = 0; y <= rowCount; y++) {
          let row:VectorFieldRow  = new VectorFieldRow(columnCount);        
          this.rows.push(row);
        }
        */
    }

    addLayer(layerType : VectorFieldLayerType, layer : VectorFieldLayer)
    {
        this.rows.forEach( row => {
            row.addLayer(layerType,layer);
        });
    }

    /*
    getCell(row : number, column : number) : VectorFieldCellPresenter
    {
        if  ( (row < this.rowCount) && (column < this.columnCount))
        {
            return this.rows[row].getCell(column);
        }
    }
    */

    protected processMessage(message : PresenterUpdateMessage) : void
    {
        //TODO : In subclass transform message into data
    }

    getRow(rowIndex : number) : VectorFieldRow | undefined
    {
        if ( (rowIndex >= 0) && (rowIndex < this.rows.length) )
        {
            return this.rows[rowIndex];
        }
        return undefined;
    }

    getCurrentRow() : VectorFieldRow | undefined
    {
        return this.getRow(0);
    }

    getCurrentRowLayer(layerType : VectorFieldLayerType) : VectorFieldLayer | undefined
    {
        //console.log("DepthFinderPresenter : Get Current Row Layer");
        {
            if (this.rows.length > 0)
            {
                //console.log(this.rows);
                let  currentRow : VectorFieldRow | undefined = this.getCurrentRow();

                if (currentRow)
                {
                    let layer : VectorFieldLayer | undefined = currentRow.getLayer(layerType);

                    if (layer)
                    {
                        return layer;
                    }
                    else
                    {
                        console.log("DepthFinderPresenter : Get Current Row Layer : Can't get layer");
                    }
                }
                else
                {
                    console.log("DepthFinderPresenter : Get Current Row Layer : Can't get current row");
                }

            }
            else
            {
                console.log("DepthFinderPresenter : Get Current Row Layer : No Rows");
                //return null;
            }
        }
        return undefined;
        //return this.getRow(0).getLayer(layerType);
    }

    /*
    getCellForParticle(layerType : VectorFieldLayerType, particleIndex : number) : VectorFieldCellPresenter
    {
        let layer : VectorFieldLayer = null
        layer = this.getLayer(layerType);

        if (layer != null)
        {
            let cellRow = Math.floor(particleIndex / this.columnCount / 2);
            let cellColumn =  particleIndex % this.columnCount;
            let cell : VectorFieldCellPresenter = null
            
            cell = layer.getCell(cellRow,cellColumn);

            if (cell != null)
            {
                return cell;
            }
        }
        return null;
    }
    */

}
