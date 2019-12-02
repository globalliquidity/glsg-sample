import Game from "./Game";
import { imgLogo } from "./Assets/AssetManager";
import { router, createCanvasElement } from "./router";
import './styles/style.scss';

// Load proper scene by route.
const canvasRenderer = (event: Event) => {
    router(event);

    const url: string = window.location.hash.slice(1) || "/";

    // Initialize canvas element
    const canvas: HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const canvasContainer: HTMLDivElement = document.getElementById("canvasArea") as HTMLDivElement;

    if (canvas) {
        canvasContainer.removeChild(canvas);
    }

    if (url !== "/") {
        const exampleTitleElement: HTMLDivElement = document.getElementById("exampleTitle") as HTMLDivElement;
        exampleTitleElement.style.display = "none";

        const canvasRender: HTMLCanvasElement = createCanvasElement();
        canvasContainer.appendChild(canvasRender);
        const game = new Game('renderCanvas', url);
    } else {
        const imgLogoElement: HTMLImageElement = document.getElementById("logoImage") as HTMLImageElement;
        imgLogoElement.src = imgLogo;
        imgLogoElement.width = 100;
        imgLogoElement.height = 100;

        const exampleTitleElement: HTMLDivElement = document.getElementById("exampleTitle") as HTMLDivElement;
        exampleTitleElement.style.display = "flex";
    }
}

// For first load or when routes are changed in browser url box.
window.addEventListener('load', canvasRenderer);
window.addEventListener('hashchange', canvasRenderer);
