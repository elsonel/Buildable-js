
function injectContent(module) {
    const moduleElement = module._attachedHTML;

    moduleElement.className = "module";
    moduleElement.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);

    const newDiv = document.createElement("div");
    newDiv.innerHTML = module._id;
    moduleElement.appendChild(newDiv);

    return;
}

// Initalize library by passing in root element id 
const $$ = new Buildable("canvas");

const mod7 = $$.createModule();
injectContent(mod7);

const mod8 = $$.createModule();
injectContent(mod8);

const mod9 = $$.createModule();
injectContent(mod9);

const mod10 = $$.createModule();
injectContent(mod10);

mod7.mount(mod8);
