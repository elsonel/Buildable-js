const Module = function(addToGlobal, removeFromGlobal) {
  this.id = uuidv4();
  this.cursor = 'default';

  /* parent information */
  this.xPos = 400;
  this.yPos = 400;
  this.xPosRest = this.xPos;
  this.yPosRest = this.yPos;

  this.width = 200;
  this.height = 200;

  this.minWidth = 50;
  this.minHeight = 50;

  this.canMoveX = true;
  this.canMoveY = true;
  
  this.canSize_N = true;
  this.canSize_S = true;
  this.canSize_W = true;
  this.canSize_E = true;

  this._attachedHTML = (() => {
    const moduleElement = document.createElement('div');
    moduleElement.className = "module";
    moduleElement.id = this.id;
   
    moduleElement.style.backgroundColor = Math.floor(Math.random()*16777215).toString(16);
    moduleElement.innerHTML = this.id;

    return moduleElement;
  })();

  this.parent = null;
  this.children = [];

  this.addPos = function(xPos, yPos) {
    this.onMove();
    if (this.canMoveX) this.xPos += xPos;
    if (this.canMoveY) this.yPos += yPos;
  }

  this.addSize = function(xPos, yPos) {
    switch(this.cursor) {
      case 'nw-resize':
        this.addSizeDirection("n-resize", yPos);
        this.addSizeDirection("w-resize", xPos);
        break;
      case 'ne-resize':
        this.addSizeDirection("n-resize", yPos);
        this.addSizeDirection("e-resize", xPos);
        break;
      case 'sw-resize':
        this.addSizeDirection("s-resize", yPos);
        this.addSizeDirection("w-resize", xPos);
        break;
      case 'se-resize':
        this.addSizeDirection("s-resize", yPos);
        this.addSizeDirection("e-resize", xPos);
        break;
      case 'w-resize':
        this.addSizeDirection("w-resize", xPos);
        break;
      case 'e-resize':
        this.addSizeDirection("e-resize", xPos);
        break;
      case 'n-resize':
        this.addSizeDirection("n-resize", yPos);
        break;
      case 's-resize':
        this.addSizeDirection("s-resize", yPos);
        break;
    }
  }

  this.addSizeDirection = function(direction, value) {
    switch(direction) {
      case 'w-resize':
        if (!this.canSize_W) break;
        if (this.xPos + value > this.xPos + this.width) break;
        if (this.width - value < this.minWidth) value = this.minWidth - this.width;
        this.width -= value;
        this.xPos += value;
        break;
      case 'e-resize':
        if (!this.canSize_E) break;
        if (this.width + value < this.minWidth) value = this.minWidth - this.width;
        this.width += value;
        break;
      case 'n-resize':
        if (!this.canSize_N) break;
        if (this.yPos + value > this.yPos + this.height) break;
        if (this.height - value < this.minHeight) value = this.minHeight - this.height
        this.height -= value;
        this.yPos += value;
        break;
      case 's-resize':
        if (!this.canSize_S) break;
        if (this.height + value < this.minHeight) value = this.minHeight - this.height;
        this.height += value;
        break;
    }
  }

  this.setCursor = function(offsetX, offsetY, width, height) {
    // Its actually not possible for the mouse position to be < 0 since the element will just not get detected

    const tol = 4;

    if      (Math.abs(offsetX) < tol          && Math.abs(offsetY) < tol)         this.cursor = this.canSize_N && this.canSize_W ? 'nw-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY) < tol)         this.cursor = this.canSize_N && this.canSize_E ? 'ne-resize' : 'default'; 
    else if (Math.abs(offsetX) < tol          && Math.abs(offsetY-height) < tol)  this.cursor = this.canSize_S && this.canSize_W ? 'sw-resize' : 'default'; 
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY-height) < tol)  this.cursor = this.canSize_S && this.canSize_E ? 'se-resize' : 'default';
    else if (Math.abs(offsetX) < tol)                                             this.cursor = this.canSize_W                   ? 'w-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol)                                       this.cursor = this.canSize_E                   ? 'e-resize' : 'default';
    else if (Math.abs(offsetY) < tol)                                             this.cursor = this.canSize_N                   ? 'n-resize' : 'default';
    else if (Math.abs(offsetY-height) < tol)                                      this.cursor = this.canSize_S                   ? 's-resize' : 'default';
    else if (offsetX >= tol && 
             offsetX <= width-tol && 
             offsetY >= tol && 
             offsetY <= height-tol)                                               this.cursor = this.canMoveX || this.canMoveY   ? 'move' : 'default';
    else                                                                          this.cursor = 'default';
  }

  this.onMove = function() {
    if (!this.parent) return;
    const dist = Math.hypot(this.xPosRest - this.xPos, this.yPosRest - this.yPos);
    if (dist > 30) this.unMount();

  }

  this.onStart = function() {
    this.xPosRest = this.xPos;
    this.yPosRest = this.yPos;
  }

  /* Snap Functions */

  this.addChild = function(module) {
    this.children.unshift(module);
    //this.children.push(module);
  }

  this.removeChild = function(module) {
    const index = this.children.indexOf(module);
    if (index > -1) this.children.splice(index, 1);
  }

  this.mount = function(parentModule) {
    this.height = parentModule.height / 2;
    
    //this.canMoveX = false;
    //this.canMoveY = false;    
    this.xPosRest = this.xPos;
    this.yPosRest = this.yPos;

    this.canSize_N = false;
    this.canSize_S = true;
    this.canSize_W = false;
    this.canSize_E = false;

    this.parent = parentModule;
    parentModule.addChild(this);

    removeFromGlobal(this);
  }

  this.unMount = function () {
    const rect = this._attachedHTML.getBoundingClientRect();
    this.xPos = rect.left + (this.xPos - this.xPosRest);
    this.yPos = rect.top + (this.yPos - this.yPosRest);
    this.width = this.parent.width;

    this.canMoveX = true;
    this.canMoveY = true;    
    this.canSize_N = true;
    this.canSize_S = true;
    this.canSize_W = true;
    this.canSize_E = true;
    
    this.parent.removeChild(this);
    this.parent = null;

    //root.unshift(this);
    addToGlobal(this); //TODO why do I have to use a function here?
  }

}