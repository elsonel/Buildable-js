const Module = function(addToGlobal, removeFromGlobal) {
  this._id = uuidv4();
  this._attachedHTML = (() => {
    const moduleElement = document.createElement('div');
    moduleElement.dataset.moduleId = this._id;
    moduleElement.style.boxSizing = "border-box";

    moduleElement.className = "module";
    moduleElement.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
    moduleElement.innerHTML = `<div>${this._id}<div>`;

    return moduleElement;
  })();

  this._cursor = 'default';
  this.DRAG = new ModuleDrag();
  this.SIZE = new ModuleSize();
  
  this._posX = 500;
  this._posY = 500;
  this._posX_Rest = this._posX;
  this._posY_Rest = this._posY;

  this._width = 200;
  this._height = 200;

  this.setCursor = function(offsetX, offsetY, width, height) {
    // Its actually not possible for offsetX, offsetY to be < 0 since the mouse cannot be outside of an element and detect it
    const tol = 10;

    if      (Math.abs(offsetX) < tol          && Math.abs(offsetY) < tol)         this._cursor = this.SIZE.canSize_N && this.SIZE.canSize_W ? 'nw-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY) < tol)         this._cursor = this.SIZE.canSize_N && this.SIZE.canSize_E ? 'ne-resize' : 'default'; 
    else if (Math.abs(offsetX) < tol          && Math.abs(offsetY-height) < tol)  this._cursor = this.SIZE.canSize_S && this.SIZE.canSize_W ? 'sw-resize' : 'default'; 
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY-height) < tol)  this._cursor = this.SIZE.canSize_S && this.SIZE.canSize_E ? 'se-resize' : 'default';
    else if (Math.abs(offsetX) < tol)                                             this._cursor = this.SIZE.canSize_W                        ? 'w-resize'  : 'default';
    else if (Math.abs(offsetX-width) < tol)                                       this._cursor = this.SIZE.canSize_E                        ? 'e-resize'  : 'default';
    else if (Math.abs(offsetY) < tol)                                             this._cursor = this.SIZE.canSize_N                        ? 'n-resize'  : 'default';
    else if (Math.abs(offsetY-height) < tol)                                      this._cursor = this.SIZE.canSize_S                        ? 's-resize'  : 'default';
    else if (offsetX >= tol && 
             offsetX <= width-tol && 
             offsetY >= tol && 
             offsetY <= height-tol)                                               this._cursor = this.DRAG.canMoveX || this.DRAG.canMoveY   ? 'move' : 'default';
    else                                                                          this._cursor = 'default';
  }

  this._parent = null;
  this._children = [];

  this.updateChildren = function () {
    // update the resize settings of child modules
    this._children.forEach((childModule) => {
      childModule.SIZE.canSize_S = true;
    });

    // prevent resizing on the last child
    if (this._children[0]) this._children[0].SIZE.canSize_S = false;
  }

  this.updateChildrenSize = function () {
    const totalHeight = this.getHeight();
    const availableHeight = totalHeight - this.getChildrenNonModuleHeight();
    console.log(availableHeight);
    this._children.forEach(childModule => childModule._height = availableHeight / this._children.length);
  }

  this.getAvailableDivisionSize = function() {
    const totalHeight = this.getHeight();
    const availableHeight = totalHeight - this.getChildrenNonModuleHeight();
    
    return availableHeight / this._children.length;
  }

  /* Snap Settings */

  this.addChild = function(module, index) {
    // TODO the index should consider normal elements as well that are not modules
    this._children.splice(index, 0, module);
    this.updateChildren();
    this.updateChildrenSize();
  }

  this.removeChild = function(module) {
    const index = this._children.indexOf(module);
    if (index > -1) this._children.splice(index, 1);
    this.updateChildren();
  }

  this.mount = function(parentModule, index) {
    this.SIZE.canSize_N = false;
    this.SIZE.canSize_S = false;
    this.SIZE.canSize_W = false;
    this.SIZE.canSize_E = false;

    parentModule.addChild(this, index);
    this._parent = parentModule;

    removeFromGlobal(this);

    this._height = (parentModule.getHeight() - parentModule.getChildrenNonModuleHeight()) / parentModule._children.length;

  }

  this.unmount = () => {
    const rect = this._attachedHTML.getBoundingClientRect();
    this._posX = rect.left + (this._posX - this._posX_Rest);
    this._posY = rect.top + (this._posY - this._posY_Rest);
    this._width = this._parent._width;
   
    this.SIZE.canSize_N = true;
    this.SIZE.canSize_S = true;
    this.SIZE.canSize_W = true;
    this.SIZE.canSize_E = true;
    
    this._parent.removeChild(this);
    this._parent = null;

    addToGlobal(this);
  }

  this.onActive = function () {
    this._posX_Rest = this._posX;
    this._posY_Rest = this._posY;
    //console.log("active");
  }

  this.onDeactive = function () {
    //console.log("released");
  }

  /* Utility */

  this.getIndexOfChild = function(childModule) {
    return this._children.indexOf(childModule);
  }

  this.getHeight = function() {
    const data = CSSgetSizeProperties(this._attachedHTML);
    return data.height;
  }

  this.getChildrenAllHeight = function() {
    const childElements = this._attachedHTML.children;

    let childrenHeight = 0;
    for (let i = 0; i < childElements.length; i++) 
      childrenHeight += childElements[i].offsetHeight;
    
    return childrenHeight;
  }

  this.getChildrenNonModuleHeight = function() {
    const childElements = this._attachedHTML.children;

    let childrenHeight = 0;
    for (let i = 0; i < childElements.length; i++)
      if (!childElements[i].dataset.moduleId) childrenHeight += childElements[i].offsetHeight;

    return childrenHeight;
  }

  this.getChildrenModuleHeight = function() {
    const childElements = this._attachedHTML.children;

    let childrenHeight = 0;
    for (let i = 0; i < childElements.length; i++)
      if (childElements[i].dataset.moduleId) childrenHeight += childElements[i].offsetHeight;

    return childrenHeight;
  }

}

const ModuleDrag = function () {
  this.canMove = true;          
  this.canMoveX = true;
  this.canMoveY = true;

  this.boundX = [-Infinity, Infinity];
  this.boundY = [-Infinity, Infinity];
  this.boundBySize = true; 

  this.unmountDist = 30;

  this.addPos = function(module, xDelta, yDelta) {
    // Drag Event Restrictions
    if (!this.canMove)  xDelta = yDelta = 0;
    if (!this.canMoveX) xDelta = 0;
    if (!this.canMoveY) yDelta = 0;

    // Drag Bound Restrictions
    if (module._posX + xDelta < this.boundX[0]) xDelta = this.boundX[0] - module._posX;
    if (module._posX + xDelta > this.boundX[1]) xDelta = this.boundX[1] - module._posX;
    if (module._posY + yDelta < this.boundY[0]) yDelta = this.boundY[0] - module._posY;
    if (module._posY + yDelta > this.boundY[1]) yDelta = this.boundY[1] - module._posY;

    if (this.boundBySize) {
      if (module._posX + module._width + xDelta > this.boundX[1]) xDelta = this.boundX[1] - (module._posX + module._width);
      if (module._posY + module._height + yDelta > this.boundY[1]) yDelta = this.boundY[1] - (module._posY + module._height);
    }

    // Change Position
    module._posX += xDelta;
    module._posY += yDelta;

    // Callbacks
    this.onMove(module);
  }

  this.onMove = function(module) { 
    if (module._parent) {
      const dist = Math.hypot(module._posX_Rest - module._posX, module._posY_Rest - module._posY);
      if (dist > this.unmountDist) module.unmount();
    }
  }

}

const ModuleSize = function () {
  this.canSize = true;
  this.canSizeWidth = true;
  this.canSizeHeight = true;

  this.canSize_N = true;
  this.canSize_S = true;
  this.canSize_W = true;
  this.canSize_E = true;

  this.boundWidth = [60, Infinity];
  this.boundHeight = [60, Infinity];


  this.addSizeX = (module, direction, xDelta) => {
    if      (direction === 'e-resize' && !this.canSize_E) xDelta = 0;
    else if (direction === 'w-resize' && !this.canSize_W) xDelta = 0;

    if      (direction === 'e-resize' && module._width + xDelta < this.boundWidth[0]) xDelta = this.boundWidth[0] - module._width;
    else if (direction === 'e-resize' && module._width + xDelta > this.boundWidth[1]) xDelta = this.boundWidth[1] - module._width;
    else if (direction === 'w-resize' && module._width - xDelta < this.boundWidth[0]) xDelta = this.boundWidth[0] - module._width;
    else if (direction === 'w-resize' && module._width - xDelta > this.boundWidth[1]) xDelta = this.boundWidth[1] - module._width;

    if (direction === 'e-resize') {
      module._width += xDelta;
    } else if (direction === 'w-resize') {
      module._width -= xDelta;
      module._posX += xDelta;
    }

  }

  const canSizeYBounds = (module, direction, yDelta) => {
    if      (direction === 's-resize' && module._height + yDelta < module.SIZE.boundWidth[0]) return module.SIZE.boundWidth[0] - module._height;
    else if (direction === 's-resize' && module._height + yDelta > module.SIZE.boundWidth[1]) return module.SIZE.boundWidth[1] - module._height;
    else if (direction === 'n-resize' && module._height - yDelta < module.SIZE.boundWidth[0]) return module.SIZE.boundWidth[0] - module._height;
    else if (direction === 'n-resize' && module._height - yDelta > module.SIZE.boundWidth[1]) return module.SIZE.boundWidth[1] - module._height;
    else                                                                                      return yDelta;
  }

  this.addSizeY = (module, direction, yDelta) => {
    // As Parent
    //if (!module._children.every(childModule => canSizeYBounds(childModule, direction, yDelta))) yDelta = 0;

    // As Element
    yDelta = canSizeYBounds(module, direction, yDelta);


    if (direction === 's-resize') {

      // As the Current Element
      module._height += yDelta;

      // As Child: Sizing siblings accordingly
      if (module._parent) {
        const allSiblings = [...module._parent._children].reverse();
        const index = allSiblings.indexOf(module);
        const remaining = allSiblings.slice(index + 1);
        
        if (remaining.length > 0) remaining[0]._height -= yDelta;
        // remaining.forEach(childModule => childModule._height -= yDelta / remaining.length);
      }
      
      // As Parent:
      module._children.forEach(childModule => childModule._height += yDelta / module._children.length);

    } else if (direction === 'n-resize') {

      // As the Current Element
      module._height -= yDelta;
      module._posY += yDelta;
      
      // As Parent:
      module._children.forEach(childModule => childModule._height -= yDelta / module._children.length);
    }

  }

  this.addSize = function(module, xDelta, yDelta) {

    // Size Event Restrictions
    if (!this.canSize)       xDelta = yDelta = 0;
    if (!this.canSizeWidth)  xDelta = 0;
    if (!this.canSizeHeight) yDelta = 0;

    switch(module._cursor) {
      case 'nw-resize':
        this.addSizeY(module, "n-resize", yDelta);
        this.addSizeX(module, "w-resize", xDelta);
        break;
      case 'ne-resize':
        this.addSizeY(module, "n-resize", yDelta);
        this.addSizeX(module, "e-resize", xDelta);
        break;
      case 'sw-resize':
        this.addSizeY(module, "s-resize", yDelta);
        this.addSizeX(module, "w-resize", xDelta);
        break;
      case 'se-resize':
        this.addSizeY(module, "s-resize", yDelta);
        this.addSizeX(module, "e-resize", xDelta);
        break;
      case 'w-resize':
        this.addSizeX(module, "w-resize", xDelta);
        break;
      case 'e-resize':
        this.addSizeX(module, "e-resize", xDelta);
        break;
      case 'n-resize':
        this.addSizeY(module, "n-resize", yDelta);
        break;
      case 's-resize':
        this.addSizeY(module, "s-resize", yDelta);
        break;
    }

  }

}