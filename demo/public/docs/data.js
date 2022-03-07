const moduleDragMethods = [
  {
    "NAME": "setPos",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module's to be affected<br><br>\n<span>x: number</span><br>\nThe module's new x position<br><br>\n<span>y: number</span><br>\nThe module's new y position",
    "RETURNS": "void",
    "DESCRIPTION": "Set the specified module's current position. Does nothing if module is currently a child of another module"
  },
  {
    "NAME": "addPos",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module's to be affected<br><br>\n<span>xDelta: number</span><br>\nThe value to be added to the module's current width<br><br>\n<span>yDelta: number</span><br>\nThe value to be added to the module's current height",
    "RETURNS": "void",
    "DESCRIPTION": "Add to the specified module's current position. Does nothing if module is currently a child of another module"
  }
]

const moduleSizeMethods = [
  {
    "NAME": "setSize",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module's to be affected<br><br>\n<span>width: number</span><br>\nThe module's new width. Must be a positive value<br><br>\n<span>height: number</span><br>\nThe module's new height. Must be a positive value",
    "RETURNS": "void",
    "DESCRIPTION": "Set the specified module's current size. Considers min and max size restrictions but ignores permissions. Does nothing if module is currently a child of another module"
  },
  {
    "NAME": "addSize",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module's to be affected<br><br>\n<span>width: number</span><br>\nThe module's new width. Must be a positive value<br><br>\n<span>height: number</span><br>\nThe module's new height. Must be a positive value",
    "RETURNS": "void",
    "DESCRIPTION": "Add to the specified module's current size. Considers min and max size restrictions but ignores permissions. Does nothing if module is currently a child of another module"
  }
]

const moduleSnapMethods = [
  {
    "NAME": "setAutoBounds",
    "PARAMETERS": "<span>parentModule: Module</span><br>\nThe parentModule to automatically set sizing boundaries",
    "RETURNS": "void",
    "DESCRIPTION": "Recursively determine and set the specified module's sizing bounds based on the bounds of child elements. If there are no child elements, then the specified module's bounds are set to default. If there is a contradiction between child bounds, then the specified module's bounds will remain unchanged"
  },
  {
    "NAME": "getChildBounds",
    "PARAMETERS": "<span>parentModule: Module</span><br>\nThe parentModule to get bounding data for",
    "RETURNS": "Object",
    "DESCRIPTION": "Get an object containing summarizing all child bounds for the specified parent module"
  },
  {
    "NAME": "insertIndex",
    "PARAMETERS": "<span>parentModule: Module</span><br>\nThe container module to append to<br><br>\n<span>module: Module</span><br>\nThe child module<br><br>\n<span>index: number</span><br>\nThe index of elements to append the child module between. If the index is invalid, then the module is appended to the end of the parent module.",
    "RETURNS": "void",
    "DESCRIPTION": "Append the specified module to another at the specified index. This function manipulates the DOM directly and avoids all hooks called by the mount() function in module"
  }
]

const buildableProperties = [
  {
    "NAME": "canvasElement",
    "READONLY": "TRUE",
    "TYPE": "HTMLCanvasElement",
    "DEFAULT": "",
    "DESCRIPTION": "The root HTMLCanvasElement that contains all modules"
  },
  {
    "NAME": "dragUtility",
    "READONLY": "TRUE",
    "TYPE": "ModuleDrag",
    "DEFAULT": "",
    "DESCRIPTION": "Reference to the class instance containing helper functions for dragging modules"
  },
  {
    "NAME": "sizeUtility",
    "READONLY": "TRUE",
    "TYPE": "ModuleSize",
    "DEFAULT": "",
    "DESCRIPTION": "Reference to the class instance containing helper functions for resizing modules"
  },
  {
    "NAME": "snapUtility",
    "READONLY": "TRUE",
    "TYPE": "ModuleSnap",
    "DEFAULT": "",
    "DESCRIPTION": "Reference to the class instance containing helper functions for mounting modules onto other modules"
  },
  {
    "NAME": "allModules",
    "READONLY": "TRUE",
    "TYPE": "Object",
    "DEFAULT": "",
    "DESCRIPTION": "An object containing every single initialized module accessible by their id."
  }
]

const buildableMethods = [
  {
    "NAME": "getModuleById",
    "PARAMETERS": "<span>id: string</span><br>\nThe id of the module to search for",
    "RETURNS": "Module",
    "DESCRIPTION": "Get the corresponding module given the specified HTMLCanvasElement"
  },
  {
    "NAME": "getModuleByElement",
    "PARAMETERS": "<span>element: HTMLCanvasElement</span><br>\nThe HTMLCanvasElement of the module to search for",
    "RETURNS": "Module",
    "DESCRIPTION": "Get the corresponding HTMLCanvasElement given the specified module"
  },
  {
    "NAME": "getElementByModule",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module of the HTMLCanvasElement to search for",
    "RETURNS": "HTMLCanvasElement",
    "DESCRIPTION": "Append the specified module to another at the specified index. This function manipulates the DOM directly and avoids all hooks called by the mount() function in module"
  },
  {
    "NAME": "getModuleParent",
    "PARAMETERS": "<span>module: Module</span><br>\nThe child module of the parent module to search for",
    "RETURNS": "Module | null",
    "DESCRIPTION": "Get the specified module's immediate parent module or null if it has no parent module."
  },
  {
    "NAME": "getModuleGlobalParent",
    "PARAMETERS": "<span>module: Module</span><br>\nThe child module of the parent module to search for",
    "RETURNS": "Module",
    "DESCRIPTION": "Get the specified module's outermost parent module. If the module has no parent module, then it itself is returned"
  },
  {
    "NAME": "getChildModules",
    "PARAMETERS": "<span>module: Module</span><br>\nthe parent module to search for immediate child modules",
    "RETURNS": "Module[]",
    "DESCRIPTION": "Get all child modules mounted on the specified parent module"
  },
  {
    "NAME": "moveModuleBack",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module to move to the back of the root element",
    "RETURNS": "void",
    "DESCRIPTION": "Move the specified module to the back of the root element. Nothing happens if the specified module is not a child of the root element"
  },
  {
    "NAME": "moveModuleFront",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module to move to the front of the root element",
    "RETURNS": "void",
    "DESCRIPTION": "Move the specified module to the front of the root element. Nothing happens if the specified module is not a child of the root element"
  },
  {
    "NAME": "showModule",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module to append to the root element",
    "RETURNS": "void",
    "DESCRIPTION": "Show the specified module by appending it directly to the root element. Nothing will happen if the module is already a child of the root element. Hooks are not called unlike unmount() in module"
  },
  {
    "NAME": "hideModule",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module of the element to remove from the document",
    "RETURNS": "void",
    "DESCRIPTION": "Hide the specified module by removing it from whatever element it is a child off. Hooks are not called unlike unmount() in module"
  },
  {
    "NAME": "deleteModule",
    "PARAMETERS": "<span>module: Module</span><br>\nThe module to delete",
    "RETURNS": "void",
    "DESCRIPTION": "Delete the specified module"
  },
  {
    "NAME": "createModule",
    "PARAMETERS": "",
    "RETURNS": "Module",
    "DESCRIPTION": "Create a new module"
  }
]

const moduleProperties = [
  {
    "NAME": "_id",
    "READONLY": "TRUE",
    "TYPE": "string",
    "DEFAULT": "",
    "DESCRIPTION": "The id of this module. This is not related to the id of the associated HTMLCanvasElement"
  },
  {
    "NAME": "_attachedHTML",
    "READONLY": "TRUE",
    "TYPE": "HTMLCanvasElement",
    "DEFAULT": "",
    "DESCRIPTION": "The HTMLCanvasElement associated with this module"
  },
  {
    "NAME": "_cursor",
    "READONLY": "TRUE",
    "TYPE": "'default' | 'move' | 'nw-resize' | 'sw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize' | 'w-resize' | 'e-resize' | 'n-resize' | 's-resize | 'move'",
    "DEFAULT": "'default'",
    "DESCRIPTION": "The current action to perform on this module"
  },
  {
    "NAME": "xDefault",
    "READONLY": "",
    "TYPE": "number",
    "DEFAULT": 0,
    "DESCRIPTION": "The module's default x position"
  },
  {
    "NAME": "yDefault",
    "READONLY": "",
    "TYPE": "number",
    "DEFAULT": 0,
    "DESCRIPTION": "The module's default y position"
  },
  {
    "NAME": "x",
    "READONLY": "TRUE",
    "TYPE": "number",
    "DEFAULT": 0,
    "DESCRIPTION": "The module's current x position"
  },
  {
    "NAME": "y",
    "READONLY": "TRUE",
    "TYPE": "number",
    "DEFAULT": 0,
    "DESCRIPTION": "The module's current y position"
  },
  {
    "NAME": "canMove",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Global override to permit dragging."
  },
  {
    "NAME": "canMoveX",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow dragging along the x-axis."
  },
  {
    "NAME": "canMoveY",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow dragging along the y-axis."
  },
  {
    "NAME": "cursorTol",
    "READONLY": "",
    "TYPE": "number",
    "DEFAULT": 10,
    "DESCRIPTION": "The number of pixels away from the module's border to register resize events, must be greater than 0"
  },
  {
    "NAME": "widthDefault",
    "READONLY": "",
    "TYPE": "number",
    "DEFAULT": 100,
    "DESCRIPTION": "The module's default width, must be greater than 0"
  },
  {
    "NAME": "heightDefault",
    "READONLY": "",
    "TYPE": "number",
    "DEFAULT": 100,
    "DESCRIPTION": "The module's default height, must be greater than 0"
  },
  {
    "NAME": "width",
    "READONLY": "TRUE",
    "TYPE": "number",
    "DEFAULT": 100,
    "DESCRIPTION": "The module's current width, must be greater than 0"
  },
  {
    "NAME": "height",
    "READONLY": "TRUE",
    "TYPE": "number",
    "DEFAULT": 100,
    "DESCRIPTION": "The module's current height, must be greater than 0"
  },
  {
    "NAME": "canSize",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Global override to allow resizing"
  },
  {
    "NAME": "canSizeWidth",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing along the x-axis"
  },
  {
    "NAME": "canSizeHeight",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing along the y-axis"
  },
  {
    "NAME": "canSize_N",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing in the north direction"
  },
  {
    "NAME": "canSize_S",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing in the south direction"
  },
  {
    "NAME": "canSize_W",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing in the west direction"
  },
  {
    "NAME": "canSize_E",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Allow resizing in the east direction"
  },
  {
    "NAME": "boundWidthDefault",
    "READONLY": "",
    "TYPE": "number[]",
    "DEFAULT": "[ 50, Infinity ]",
    "DESCRIPTION": "The default maximum and minimum width, both values must be greater than 0 and the maximum must be greater than the minimum"
  },
  {
    "NAME": "boundHeightDefault",
    "READONLY": "",
    "TYPE": "number[]",
    "DEFAULT": "[ 50, Infinity ]",
    "DESCRIPTION": "The default maximum and minimum height, both values must be greater than 0 and the maximum must be greater than the minimum"
  },
  {
    "NAME": "boundWidth",
    "READONLY": "",
    "TYPE": "number[]",
    "DEFAULT": "[ 50, Infinity ]",
    "DESCRIPTION": "The current maximum and minimum width, both values must be greater than 0 and the maximum must be greater than the minimum"
  },
  {
    "NAME": "boundHeight",
    "READONLY": "",
    "TYPE": "number[]",
    "DEFAULT": "[ 50, Infinity ]",
    "DESCRIPTION": "The current maximum and minimum height, both values must be greater than 0 and the maximum must be greater than the minimum"
  },
  {
    "NAME": "canMount",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Global override for whether this module can be mounted onto a parent module"
  },
  {
    "NAME": "canUnmount",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Global override for whether this module can be unmounted onto a parent module"
  },
  {
    "NAME": "canStore",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": true,
    "DESCRIPTION": "Global override for whether other modules can be mounted onto this module"
  },
  {
    "NAME": "storeMode",
    "READONLY": "",
    "TYPE": "'VERTICAL' | 'HORIZONTAL'",
    "DEFAULT": "'VERTICAL'",
    "DESCRIPTION": "Determines whether modules mounted on this module should be displayed vertically or horizontally"
  },
  {
    "NAME": "backgroundLock",
    "READONLY": "",
    "TYPE": "boolean",
    "DEFAULT": false,
    "DESCRIPTION": "If true, then this module will be moved behind all other modules when active"
  }
]

const moduleMethods = [
  {
    "NAME": "getCursor",
    "PARAMETERS": "<span>clientX: number</span><br>\nthe cursor's x position relative to the viewport<br><br>\n<span>clientY: number</span><br>\nthe cursor's y position relative to the viewport",
    "RETURNS": "'default' | 'move' | 'nw-resize' | 'sw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize' | 'w-resize' | 'e-resize' | 'n-resize' | 's-resize | 'move'",
    "DESCRIPTION": "Get the action that would be performed on this module based on the current mouse position"
  },
  {
    "NAME": "mount",
    "PARAMETERS": "<span>parentModule: Module</span><br>\nThe parent module to mount this module on. The insertion index is automatically derived from the cursor position<br>",
    "RETURNS": "boolean",
    "DESCRIPTION": "Mount this module onto another module. Hooks that optimize the child module and parent module's properties are automatically called"
  },
  {
    "NAME": "unmount",
    "PARAMETERS": "",
    "RETURNS": "boolean",
    "DESCRIPTION": "Unmount this module and append it to the root element. Hooks that optimize the child module and parent module's properties are automatically called"
  },
  {
    "NAME": "render",
    "PARAMETERS": "",
    "RETURNS": "void",
    "DESCRIPTION": "Sync this module's class properties to its associated HTMLCanvasElement. This function is called automatically on user interaction and property changes. It does not need to be called manually."
  }
]

