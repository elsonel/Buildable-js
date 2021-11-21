function uuidv4() {
  /*https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid*/
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const Library = function (id) {
  const canvasElement = document.getElementById("canvas");
  canvasElement.addEventListener("mousedown", onPress);
  canvasElement.addEventListener("mousemove", onMove);
  canvasElement.addEventListener("mouseup", onRelease);
  canvasElement.addEventListener('mouseleave', onRelease);

  let cursor = "default";
  const allModules = {};
  let outerModules = [];

  let hoverModule = null;
  let activeModule = null;

  let hoverModules = [];

  let isMouseDown = false;
  let startX = 0;
  let startY = 0;

  /* Event Callbacks */
  function onPress (e) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;

    setActiveModule(hoverModule);
    render(outerModules);
  }

  function onMove (e) {
    hoverModules = getHoveredModules(e.clientX, e.clientY);

    if (!activeModule) {
      hoverModules.forEach(module => {
        // https://htmldom.dev/calculate-the-mouse-position-relative-to-an-element/
        // https://javascript.info/bubbling-and-capturing
        // module.setCursor(e.offsetX, e.offsetY, e.target.clientWidth, e.target.clientHeight);
  
        const bounds = module._attachedHTML.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const width = bounds.width;
        const height = bounds.height;
  
        module.setCursor(x, y, width, height);
      });

      
      let outerModule = null
      if (hoverModules.length === 0) hoverModule = null;
      else outerModule = getOuterModule(hoverModules[0]);   

      for (let i = 0; i < hoverModules.length; i++) {
        const module = hoverModules[i];

        if (getOuterModule(module) != outerModule) break; //focus on one window

        if (module.cursor === 'default') {
          continue;
        } else if (module.cursor !== 'default' && module.cursor !== 'move') {
          hoverModule = module;
          break;
        } else if (module.cursor === 'move') {
          hoverModule = module;
          break;
        }
      }
      
    } else {
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);
      startX = e.clientX;
      startY = e.clientY;

      if (activeModule.cursor == 'move') activeModule.addPos(deltaX, deltaY);
      else activeModule.addSize(deltaX, deltaY);
    }

    render(outerModules);
  }

  function onRelease(e) {
    // Snapping
    /* TO DO: Snap depending on what you hover over, special icon, snap to anything...*/
    let outerModule = null
    if (hoverModules.length !== 0) outerModule = getOuterModule(hoverModules[0]);   

    for (let i = 0; i < hoverModules.length; i++) {
      const module = hoverModules[i];

      if (getOuterModule(module) === outerModule) continue;

      if (module.cursor !== 'default' && module.cursor !== 'move') {
        activeModule.mount(module);
        break;
      }
    }

    isMouseDown = false;
    setActiveModule(null);

    render(outerModules);
  }


   /* Private Functions */

  function getOuterModule(module) {
    if (module.parent) return getOuterModule(module.parent);
    else return module;
  }

  function getModuleByID(id) {
    return allModules[id];
  }

  function getHoveredModules(x, y) {
    const hoverElements = document.elementsFromPoint(x, y);   
    const hoverModuleElements = hoverElements.filter(e => getModuleByID(e.id));

    return hoverModuleElements.map(e => getModuleByID(e.id));
  }

  function setActiveModule(module) {
    activeModule = module;
    
    if (module != null) {
      module = getOuterModule(module);
      outerModules = outerModules.filter((m) => m !== module);
      outerModules.unshift(module);
      module.onStart();
    }

    render(outerModules);
  }

  function render(allModules) {    
    [...allModules].reverse().forEach(module => {
      let moduleElement = module._attachedHTML;
    
      if (!module.parent) {
        moduleElement.style.position = 'absolute';
        moduleElement.style.top = module.yPos;
        moduleElement.style.left = module.xPos;
        moduleElement.style.width = `${module.width}px`;
        moduleElement.style.height = `${module.height}px`;

        canvasElement.appendChild(moduleElement);
      } else {
        moduleElement.style.position = 'static';
        moduleElement.style.width = '100%';
        moduleElement.style.height = `${module.height}px`;

        module.parent._attachedHTML.appendChild(moduleElement);
      }
      
      render(module.children);
    });

    canvasElement.style.cursor = hoverModule ? hoverModule.cursor : "default";
  }

   /* Public Functions */

  this.addToGlobal = function(module) {
    outerModules.unshift(module); //TODO find better way to organize this
  }

  this.createModule = function () {   
    const module = new Module(outerModules, this.addToGlobal);
    
    allModules[module.id] = module;
    outerModules.push(module); 
    console.log(outerModules === module.root);

    return module;
  }

}

const Module = function(root, addToGlobal) {
  this.id = uuidv4();
  this.cursor = 'default';
  this.root = root;

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

    const index = root.indexOf(this);
    if (index > -1) root.splice(index, 1);
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

const $ = new Library("canvas");
const mod1 = $.createModule();
const mod2 = $.createModule();
mod1.mount(mod2);

const mod3 = b.createModule();