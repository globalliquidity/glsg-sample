export default class SoundPlayer {
    audioBuffer: any = null;
    context: any = null;
    URL: string;

    constructor(URL: string) {
        this.URL = URL;
        var AudioContext: any = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
    }

    async loadAudioStream() {
        const request: XMLHttpRequest = new XMLHttpRequest();

        request.open("GET", this.URL, true);
        // Set the responseType to blob
        request.responseType = "arraybuffer";

        request.onload = () => {
            this.context.decodeAudioData(request.response, 
                audioBuffer => {
                    this.audioBuffer = audioBuffer;
                },
                error =>
                    console.error(error)
            );
        }
        request.send();
    }

    async loadAudioStreamFromOnline() {
        window.fetch('https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer,
            audioBuffer => {
                this.audioBuffer = audioBuffer;
            },
            error =>
                console.error(error)
        ));
    }

    resume() {
        this.context.resume();
    }

    play() {
        try {
            const source = this.context.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(this.context.destination);
            source.start(0);
        } catch (e) {
            alert(e);
        }
    }

    isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    };
};
