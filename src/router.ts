// Id of Application div
const appDiv = "leftNavbar";
// Both set of different routes and template generation functions
let routes = {};
let templates = {};

// Register a leftNavbar template (this is to mimic a template engine)
const leftMenuGenerator = () => {
    const myDiv: HTMLDivElement = document.getElementById(appDiv) as HTMLDivElement;
    myDiv.innerHTML = "<div class='navbar-title'>Example Scenes</div>";
    const simpleSceneLink: HTMLAnchorElement = createLinkElement('SimpleScene', 'Go to SimpleScene', '#/SimpleScene');
    const dataDrivenSceneLink: HTMLAnchorElement = createLinkElement('DataDrivenScene', 'Go to DataDrivenScene', '#/DataDrivenScene');
    const pieMenuSceneLink: HTMLAnchorElement = createLinkElement('PieMenuScene', 'Go to PieMenuScene', '#/PieMenuScene');
    myDiv.appendChild(simpleSceneLink);
    myDiv.appendChild(dataDrivenSceneLink);
    return myDiv.appendChild(pieMenuSceneLink);
}

// Generate DOM tree from a string
export const createDivElement = (id: string, xmlString: string): HTMLDivElement => {
    const div: HTMLDivElement = document.createElement('div');
    div.id = id;
    div.innerHTML = xmlString;

    return div.firstChild as HTMLDivElement;
};

// Helper function to create a link.
export const createLinkElement = (title: string, text: string, href: string): HTMLAnchorElement => {
    const a: HTMLAnchorElement = document.createElement('a');
    const linkText: Text = document.createTextNode(text);
    a.appendChild(linkText);
    a.title = title;
    a.href = href;

    return a;
};

// Helper function to create canvas
export const createCanvasElement = (): HTMLCanvasElement => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = "renderCanvas";

    return canvas;
}

// Define the routes. Each route is described with a route path & a template to render
// when entering that path. A template can be a string (file name), or a function that
// will directly create the DOM objects.
export const route = (path: string, template: any): void => {
    leftMenuGenerator();
    
    if (typeof template === "string") {
        return routes[path] = templates[template];
    }

    return;
};

// Define the mappings route->template.
route('/', 'template-MainView');
route('/SimpleScene', 'template-SimpleScene');
route('/DataDrivenScene', 'template-DataDrivenScene');
route('/PieMenuScene', 'template-PieMenuScene');

// Give the correspondent route (template) or fail
export const resolveRoute = (route: string) => {
    try {
        return routes[route];
    } catch (error) {
        throw new Error("The route is not defined");
    }
};

// The actual router, get the current URL and generate the corresponding template
export const router = (evt: Event) => {
    const url = window.location.hash.slice(1) || "/";
    const routeResolved = resolveRoute(url);

    if (typeof routeResolved === 'function') {
        routeResolved();
    }
};
