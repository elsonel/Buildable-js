// https://cdnjs.com/libraries/highlight.js
// https://highlightjs.org/static/demo/


const rightSidebarOnClick = function (id) {
    const element = document.getElementById(id);
    element.scrollIntoView({behavior: "smooth"});
}

function buttonOnClick(element) {
    const parent = element.parentElement;

    [...parent.children].forEach(e => {
        e.style.fontWeight = 500;
    })

    element.style.fontWeight = 700;



}

function render(entry) {
    const wrapper = document.createElement("div");    
    wrapper.id = entry.id;
    wrapper.innerHTML = `
    <div class="class-header-title">${entry.title}</div>
    <div class="class-header-text">${entry.text}</div>
    <div class="canvas"></div>
    <div class="button-container">
       <button class="button" onClick="buttonOnClick(this)" type="button">JS</button>
       <button class="button" onClick="buttonOnClick(this)" type="button">HTML</button>
       <button class="button" onClick="buttonOnClick(this)" type="button">CSS</button>
    </div>
    <pre><code class="test-code"></code></pre>
    `;

    const rootElement = wrapper.getElementsByClassName("canvas")[0];
    entry.callback(rootElement);

    const codeElement = wrapper.getElementsByClassName("test-code")[0];
    codeElement.innerHTML = entry.JS;

    const buttons = wrapper.getElementsByClassName("button");
    buttons[0].addEventListener("click", () => {
        codeElement.innerHTML = entry.JS;
        hljs.highlightAll(); // Calling highlight.js library to render stylized text
    });
    buttons[1].addEventListener("click", () => {
        codeElement.innerHTML = entry.HTML.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        hljs.highlightAll(); // Calling highlight.js library to render stylized text
    });
    buttons[2].addEventListener("click", () => {
        codeElement.innerHTML = entry.CSS;
        hljs.highlightAll(); // Calling highlight.js library to render stylized text
    });

    // appending to document
    document.getElementsByClassName('wrapper')[0].append(wrapper);

    hljs.highlightAll(); // Calling highlight.js library to render stylized text
}

// Initization
render({
    id:"1",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];

    const BUILDABLE = new Buildable(rootElement);
    const module = BUILDABLE.createModule();`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Initization',
    text: `Initialize the library by passing in the root element and call createModule() to begin create modules. 

    Each individual module can be dragged and resized.`,
    callback: (rootElement) => {
        const BUILDABLE = new Buildable(rootElement);
        const module = BUILDABLE.createModule();
    },
});

// Changing dynamic properties manually
render({
    id:"2",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];

    const BUILDABLE = new Buildable(rootElement);
    const module = BUILDABLE.createModule();

    const button = document.createElement("button");
    button.innerHTML = "Restart"
    button.addEventListener("click", () => {
        BUILDABLE.dragUtility.setPos(module, 0, 0);
        BUILDABLE.sizeUtility.setSize(module, 100, 100);
    });

    rootElement.append(button);`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Dynamic Properties',
    text: `Dynamic module properties such as size and position can be manually changed through utility class (ModuleDrag, ModuleSize and ModuleSnap) functions.`,
    callback: (rootElement) => {        

        const BUILDABLE = new Buildable(rootElement);
        const module = BUILDABLE.createModule();

        const button = document.createElement("button");
        button.innerHTML = "Restart"
        button.addEventListener("click", () => {
            // set module position
            BUILDABLE.dragUtility.setPos(module, 0, 0);

            // set module size
            BUILDABLE.sizeUtility.setSize(module, 100, 100);
        });

        rootElement.append(button);

    },
});

// Changing module behavior
render({
    id:"3",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];

    const BUILDABLE = new Buildable(rootElement);
    const module = BUILDABLE.createModule();

    // restrict movement along the y axis
    module.canMoveY = false;

    // restrict resizing in the west direction
    module.canSize_W = false;
    
    // restrict the final size
    module.boundWidth = [50, 200];`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Module behavior',
    text: `Certain module properties can be changed directly to alter behavior on user interaction.`,
    callback: (rootElement) => {        

        const BUILDABLE = new Buildable(rootElement);
        const module = BUILDABLE.createModule();

        // restrict movement
        module.canMoveY = false;

        // restrict size changes
        module.canSize_W = false;
        
        // restrict final size
        module.boundWidth = [50, 200];

    },
});

// Nesting Modules
render({
    id:"4",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];
    const BUILDABLE = new Buildable(rootElement);
        
    const moduleA = BUILDABLE.createModule();
    const moduleB = BUILDABLE.createModule();
    const moduleC = BUILDABLE.createModule();
    const moduleD = BUILDABLE.createModule();
    const moduleE = BUILDABLE.createModule();`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Nesting Modules',
    text: `Modules can be snapped into one another by dragging and releasing them over another module, with all nesting relationships being reflected in the DOM.

    Dragging and releasing a module between the border of two siblings will insert that module in-between them (you have to be precisely on the border). 
    
    If there are multiple siblings, Buildable will attempt to insert the released module at the index closest to the mouse position. 
    
    Buildable will automatically attempt to adjust the parent module's boundaries in respect to the boundaries of all its children.`,
    callback: (rootElement) => {        

        const BUILDABLE = new Buildable(rootElement);
        
        const moduleA = BUILDABLE.createModule();
        const moduleB = BUILDABLE.createModule();
        const moduleC = BUILDABLE.createModule();
        const moduleD = BUILDABLE.createModule();
        const moduleE = BUILDABLE.createModule();

    },
});

// Snap Settings 1
render({
    id:"5",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];
    const BUILDABLE = new Buildable(rootElement);
        
    const moduleA = BUILDABLE.createModule();
    const moduleB = BUILDABLE.createModule();
    const moduleC = BUILDABLE.createModule();
    const moduleD = BUILDABLE.createModule();        
    moduleA.storeMode = "HORIZONTAL";
    moduleB.storeMode = "HORIZONTAL";
    moduleC.storeMode = "HORIZONTAL";
    moduleD.storeMode = "HORIZONTAL";

    document.addEventListener("DOMContentLoaded", function(event){
        moduleB.mount(moduleA);
        moduleC.mount(moduleA);
        moduleD.mount(moduleA);
    });`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Snap Settings 1',
    text: `Modules can also be stored horizontally and mounted programmatically. To unmount a child module, just drag it out. Keep in mind that there is a small tolerance to drag past for the event to trigger to prevent accidental unmounting.`,
    callback: (rootElement) => {        

        const BUILDABLE = new Buildable(rootElement);
        
        const moduleA = BUILDABLE.createModule();
        const moduleB = BUILDABLE.createModule();
        const moduleC = BUILDABLE.createModule();
        const moduleD = BUILDABLE.createModule();  

        moduleA.storeMode = "HORIZONTAL";
        moduleB.storeMode = "HORIZONTAL";
        moduleC.storeMode = "HORIZONTAL";
        moduleD.storeMode = "HORIZONTAL";

        document.addEventListener("DOMContentLoaded", function(event){
            moduleB.mount(moduleA);
            moduleC.mount(moduleA);
            moduleD.mount(moduleA);
        });

    },
});

// Snap Settings 2
render({
    id:"6",
    JS: `
    const rootElement = document.getElementsByClassName("canvas")[0];
    const BUILDABLE = new Buildable(rootElement);
        
    const moduleA = BUILDABLE.createModule();
    const moduleB = BUILDABLE.createModule();

    // Since moduleB cannot move, it cannot be unmounted. Attempting to move moduleB moves moduleA instead
    document.addEventListener("DOMContentLoaded", function(event){
        moduleB.mount(moduleA);
        moduleB.canMove = false;
    });

    // This module can be mounted onto other modules, but not the other way around
    const moduleC = BUILDABLE.createModule();
    moduleC.canStore = false;`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Snap Settings 2',
    text: `Snapping behavior can be restricted. Furthermore, Buildable will automatically attempt to propagate events upwards towards parent modules if the child module has limited interactions.`,
    callback: (rootElement) => {        

        const BUILDABLE = new Buildable(rootElement);
        
        const moduleA = BUILDABLE.createModule();
        const moduleB = BUILDABLE.createModule();

        // Since moduleB cannot move, it cannot be unmounted. Attempting to move moduleB moves moduleA instead
        document.addEventListener("DOMContentLoaded", function(event){
            moduleB.mount(moduleA);
            moduleB.canMove = false;
        });

        // This module can be mounted onto other modules, but not the other way around
        const moduleC = BUILDABLE.createModule();
        moduleC.canStore = false;

    },
});

// Content Injection
render({
    id:"7",
    JS: `
    function injectContent(module) {
        const moduleElement = module._attachedHTML;
    
        const newDiv = document.createElement("div");
        newDiv.innerHTML = module._id;
        moduleElement.appendChild(newDiv);
    
        return;
    }
    
    const rootElement = document.getElementsByClassName("canvas")[0];
    const BUILDABLE = new Buildable(rootElement);
    
    const moduleA = BUILDABLE.createModule();
    const moduleB = BUILDABLE.createModule();

    injectContent(moduleA);
    injectContent(moduleB);`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .canvas {
        background-color: blue;
        width: 100%;
        height: 500px;
        overflow: hidden;
        position: relative;
    }`,
    title: 'Content Injection',
    text: `UI content can be injected directly on top of modules by accessing the associated HTMLCanvasElement via ._attachedHTML. Unfortunately, new sizing boundaries may have to be recalculated manually.`,
    callback: (rootElement) => {        

        function injectContent(module) {
            const moduleElement = module._attachedHTML;
        
            const newDiv = document.createElement("div");
            newDiv.innerHTML = module._id;
            moduleElement.appendChild(newDiv);
        
            return;
        }
        
        const BUILDABLE = new Buildable(rootElement);
        
        const moduleA = BUILDABLE.createModule();
        const moduleB = BUILDABLE.createModule();

        injectContent(moduleA);
        injectContent(moduleB);
    },
});

// Styling 
render({
    id:"8",
    JS: `    
    const rootElement = document.getElementsByClassName("canvas")[0];
    const BUILDABLE = new Buildable(rootElement);
        
    const moduleA = BUILDABLE.createModule();
    const moduleB = BUILDABLE.createModule();

    // Clear all JS assigned CSS styles
    moduleA._attachedHTML.attributeStyleMap.clear();
    moduleB._attachedHTML.attributeStyleMap.clear();
    
    // Resync essential properties
    moduleA.render();
    moduleB.render();

    moduleA._attachedHTML.className = "module";
    moduleB._attachedHTML.className = "module";`,
    HTML:`
    <div class="canvas"></div>`,
    CSS:`
    .module {
        user-select: none;
        background-color: white;
        padding: 15px;
        border: 10px solid black;
        /*box-sizing: border-box;*/
    }`,
    title: 'Styling',
    text: `HTML classes and ids can be assigned to Buildable modules. Buildable modules work with both paddings, borders and border-box box sizing, but not margins. Other CSS properties such as position, width, height, left and top are overwritten by the library and should be left untouched.`,
    callback: (rootElement) => {                
        const BUILDABLE = new Buildable(rootElement);
        
        const moduleA = BUILDABLE.createModule();
        const moduleB = BUILDABLE.createModule();

        // Clear all JS assigned CSS styles
        moduleA._attachedHTML.attributeStyleMap.clear();
        moduleB._attachedHTML.attributeStyleMap.clear();

        // Resync essential properties
        moduleA.render();
        moduleB.render();

        // Assign stylesheet
        moduleA._attachedHTML.className = "module";
        moduleB._attachedHTML.className = "module";
    },
});