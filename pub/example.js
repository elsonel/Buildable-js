
function injectContent(module) {
    // This can be done however you like 
    // Just make sure that location, size and position styles are not overwritten
    // You can even add your own CSS classes and IDs!

    const moduleElement = module._attachedHTML;

    moduleElement.className = "module";
    moduleElement.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);

    const newDiv = document.createElement("div");
    newDiv.innerHTML = module._id;
    moduleElement.appendChild(newDiv);
}

// Initalize library by passing in root element id 
const $$ = new Buildable("canvas");

// Create module settings

const setting1 = new ModuleDrag();
setting1.posX_Default = 400;
setting1.posY_Default = 100;

// Create modules and pass in settings
const mod1 = $$.createModule(setting1);
const mod2 = $$.createModule(setting1);
const mod3 = $$.createModule(setting1);
const mod4 = $$.createModule(setting1);
const mod5 = $$.createModule(setting1);
const mod6 = $$.createModule(setting1);

// Inject ui content into module
injectContent(mod1)
injectContent(mod2)
injectContent(mod3)
injectContent(mod4)
injectContent(mod5)
injectContent(mod6)

// Snap modules
mod2.mount(mod1);
mod3.mount(mod1);
mod4.mount(mod1);
mod5.mount(mod4);
mod6.mount(mod4);

// Create some more Modules

const drag = new ModuleDrag();
drag.posX_Default = 100;
drag.posY_Default = 200;

const size = new ModuleSize();
size.width_Default = 200;
size.height_Default = 200;

const mod7 = $$.createModule(drag, size);
injectContent(mod7);


