// This is the example used to create the landing page

const rootElement = document.getElementById("canvas");
const BUILDABLE = new Buildable(rootElement);
        
// background module, move to middle and restrict movement
const moduleA = BUILDABLE.createModule();
moduleA.canMove = false;
moduleA.canSize = false;
BUILDABLE.sizeUtility.setSize(moduleA, 800, 400);
const moduleARect = moduleA._attachedHTML.getBoundingClientRect();
BUILDABLE.dragUtility.setPos(moduleA, (window.innerWidth / 2) - moduleARect.width / 2, (window.innerHeight / 2) - moduleARect.height / 2);
moduleA.backgroundLock = true;

// title module
const moduleB = BUILDABLE.createModule();
moduleB.boundWidth = [450, Infinity];
moduleB.boundHeight = [100, Infinity];

// subtitle module
const moduleC = BUILDABLE.createModule();
moduleC.boundWidth = [300, Infinity];
moduleC.boundHeight = [50, Infinity];

// container module to hold buttons horizontally
const moduleD = BUILDABLE.createModule();
moduleD.canMove = false;
moduleD.storeMode = "HORIZONTAL";

// mount all content modules onto the background module
moduleB.mount(moduleA);
moduleC.mount(moduleA);
moduleD.mount(moduleA);

// button modules
const module1 = BUILDABLE.createModule();
module1.boundWidth = [160, Infinity];

const module2 = BUILDABLE.createModule();
module2.boundWidth = [140, Infinity];

const module3 = BUILDABLE.createModule();
module3.boundWidth = [90, Infinity];

// mount all button modules onto container module
module1.mount(moduleD);
module2.mount(moduleD);
module3.mount(moduleD);

// injecting content

moduleB._attachedHTML.innerHTML = `<div class="heading">Buildable.js</div>`;
moduleC._attachedHTML.innerHTML = `<div class="subtext">Create dynamic UI backboards for customizable workspaces (try me!)</div>`;

module1._attachedHTML.innerHTML = `<a class="button" href="/gettingstarted">GET STARTED</a>`;
module2._attachedHTML.innerHTML = `<button class="button" type="button">EXAMPLES</button>`;
module3._attachedHTML.innerHTML = `<button class="button" type="button">API</button>`;

// Styling

moduleA._attachedHTML.style.border = "3px solid #cfcfcf";
moduleA._attachedHTML.style.backgroundColor = "#ededed";
moduleA._attachedHTML.style.padding = '20px';

moduleB._attachedHTML.style.border = "3px solid #cfcfcf";
moduleB._attachedHTML.style.color = "#e3e3e3";
moduleB._attachedHTML.style.backgroundColor = "#383838";

moduleC._attachedHTML.style.border = "3px solid #cfcfcf";
moduleC._attachedHTML.style.color = "#e3e3e3";
moduleC._attachedHTML.style.backgroundColor = "#808080";

moduleD._attachedHTML.style.border = "3px solid #cfcfcf";
moduleD._attachedHTML.style.color = "#e3e3e3";
moduleD._attachedHTML.style.backgroundColor = "#b0b0b0";

module1._attachedHTML.style.border = "3px solid #474747";
module2._attachedHTML.style.border = "3px solid #474747";
module3._attachedHTML.style.border = "3px solid #474747";