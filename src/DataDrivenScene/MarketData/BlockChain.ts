export class BlockChainMarketData
{
    conntectionUrl: string = 'wss://ws.blockchain.info/inv';
    webSocket: WebSocket = null;

    public connectData(callback ?: Function) {
        this.webSocket = new WebSocket(this.conntectionUrl);

        this.webSocket.addEventListener('open', (event) => {
            this.sendData({ "op":"ping" });
        });

        this.webSocket.onmessage = async (event: MessageEvent) => {
            const blockData = JSON.parse(event.data);

            switch (blockData.op) {
                case 'pong':
                    this.sendData({
                        "op": "unconfirmed_sub"
                    });

                    // this.sendData({
                    //     "op": "addr_sub",
                    //     "addr": "$bitcoin_address"
                    // });
                    break;
                case 'block':
                    console.log('block data: ', blockData);
                    break;
                case 'utx':
                    if (callback) {
                        callback(blockData.x);
                    }
                    break;
                default:
                    break;
            }
        };
    }

    private sendData(obj: Object) {
        this.webSocket.send(JSON.stringify(obj));
    }

    public closeConnection() {
        this.sendData({
            "op": "addr_unsub",
            "addr": "$bitcoin_address"
        });

        this.sendData({
            "op": "blocks_unsub"
        });

        this.sendData({
            "op": "unconfirmed_unsub"
        });

        this.webSocket.close();
    }
}
