# Buildable.js Library

Demonstrations for this library can be found [here](https://infinite-brook-99829.herokuapp.com/)

## Setup

Use the library in your projects by referencing it in your HTML heading.

```html
<head>
    <script src="Buildable.js"></script>
</head>
```

Create a root element and ensure that it has position style relative.

```html
<body>
	<div class="canvas" style="position: relative;"></div>
</body>
```

## Getting Started

### Initialization

Initialize the library by passing in the root element and call createModule() to begin create modules. 

Each individual module can be dragged and resized.

```javascript
const rootElement = document.getElementsByClassName("canvas")[0];

const BUILDABLE = new Buildable(rootElement);
const module = BUILDABLE.createModule();
```
### Dynamic Properties

Dynamic module properties such as size and position can be manually changed through utility class (ModuleDrag, ModuleSize and ModuleSnap) functions.

```javascript
BUILDABLE.dragUtility.setPos(module, 100, 100);
BUILDABLE.sizeUtility.setSize(module, 200, 200);
``` 


### Module Behavior

Certain module properties can be changed directly to alter behaviour on user interaction.

```javascript
// restrict movement along the y axis
module.canMoveY = false;

// restrict resizing in the west direction
module.canSize_W = false;
    
// restrict the final size
module.boundWidth = [50, 200];
```

### Nesting Modules

Modules can be snapped into one another by dragging and releasing, with all results being reflected in the DOM. 

Dragging and releasing a module between the border of two siblings will insert that module in-between them (you have to be precisely on the border). 

If there are multiple siblings, Buildable will attempt to insert the released module at the index closest to the mouse position. 

Buildable will automatically attempt to adjust the parent module's boundaries in respect to the boundaries of all its children.

Modules can also be stored horizontally and mounted programmatically.

```javascript
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
```

Snapping behavior can be restricted. Furthermore, Buildable will automatically attempt to propagate events upwards towards parent modules if the child module has limited interactions.

```javascript
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
});
```

### Injecting HTML Content

UI content can be injected directly on top of modules by accessing the associated HTMLCanvasElement via ._attachedHTML. Unfortunately, new sizing boundaries may have to be recalculated manually.

```javascript
function injectContent(module) {
	const moduleElement = module._attachedHTML;

	const newDiv = document.createElement("div");
	newDiv.innerHTML = module._id;
	moduleElement.appendChild(newDiv);

	return;
}

const moduleA = BUILDABLE.createModule();
const moduleB = BUILDABLE.createModule();

injectContent(moduleA);
injectContent(moduleB);
});
```

### Styling

HTML classes and ids can be assigned to Buildable modules. Buildable modules work with both paddings, borders and border-box box sizing, but not margins. Other CSS properties such as position, width, height, left and top are overwritten by the library and should be left untouched.

```javascript
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
```

## Documentation
The full documentation can be viewed [here](https://infinite-brook-99829.herokuapp.com/docs/)
