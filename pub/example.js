
function injectContent(module) {
    const moduleElement = module._attachedHTML;

    // Random color generator code is from stack overflow
    moduleElement.className = "module";
    moduleElement.style.backgroundColor = '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);

    return;
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

const mod11 = $$.createModule();
injectContent(mod11);

mod7.mount(mod8);
