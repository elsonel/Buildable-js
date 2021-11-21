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

  const allModules = {};
  let outerModules = [];
  let activeModule = null;
  let hoverModule = null;
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
    console.log(hoverModules.map(e => e.cursor));

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

      if (hoverModules.at(-1)) hoverModule = hoverModules.at(-1);
      else hoverModule = null;
  
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
    isMouseDown = false;
    setActiveModule(null);
  }


   /* Private Functions */

  function getOuterModule(target) {
    if (target.parentElement.id == canvasElement.id || target.id == canvasElement.id) return target;
    else return getOuterModule(target.parentElement);
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
      outerModules = outerModules.filter((m) => m !== module);
      outerModules.unshift(module);
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
        moduleElement.style.height = `${module.height * 0.5}px`;

        module.parent._attachedHTML.appendChild(moduleElement);
      }
      
      render(module.children);
    });

    canvasElement.style.cursor = hoverModule ? hoverModule.cursor : "default";
  }


  this.setChildToParent = function (childModule, parentModule) {
    childModule.canMoveX = false;
    childModule.canMoveY = false;    
    childModule.canSize_N = false;
    childModule.canSize_S = true;
    childModule.canSize_W = false;
    childModule.canSize_E = false;

    childModule.parent = parentModule;
    parentModule.children.push(childModule);

    const index = outerModules.indexOf(childModule);
    if (index > -1) outerModules.splice(index, 1);
  }

   /* Public Functions */

  this.createModule = function () {   
    const module = new Module();
    
    allModules[module.id] = module;
    outerModules.push(module); 

    render(outerModules);

    return module;
  }

}

const Module = function() {
  this.id = uuidv4();
  this.cursor = 'default';

  /* parent information */
  this.xPos = 400;
  this.yPos = 400;
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
    
    //moduleElement.innerHTML = this.id;

    return moduleElement;
  })();

  this.parent = null;
  this.children = [];

  this.addPos = function(xPos, yPos) {
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
    const tol = 4;

    if      (Math.abs(offsetX) < tol        && Math.abs(offsetY) < tol)         this.cursor = this.canSize_N && this.canSize_W ? 'nw-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol  && Math.abs(offsetY) < tol)         this.cursor = this.canSize_N && this.canSize_E ? 'ne-resize' : 'default'; 
    else if (Math.abs(offsetX) < tol        && Math.abs(offsetY-height) < tol)  this.cursor = this.canSize_S && this.canSize_W ? 'sw-resize' : 'default'; 
    else if (Math.abs(offsetX-width) < tol  && Math.abs(offsetY-height) < tol)  this.cursor = this.canSize_S && this.canSize_E ? 'se-resize' : 'default';
    else if (Math.abs(offsetX) < tol)                                           this.cursor = this.canSize_W ? 'w-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol)                                     this.cursor = this.canSize_E ? 'e-resize' : 'default';
    else if (Math.abs(offsetY) < tol)                                           this.cursor = this.canSize_N ? 'n-resize' : 'default';
    else if (Math.abs(offsetY-height) < tol)                                    this.cursor = this.canSize_S ? 's-resize' : 'default';
    else if (offsetX >= tol && 
             offsetX <= width-tol && 
             offsetY >= tol && 
             offsetY <= height-tol)                                             this.cursor = this.canMoveX || this.canMoveY ? 'move' : 'default';
    else                                                                        this.cursor = 'default';
  }

}

const b = new Library("canvas");
const mod1 = b.createModule();
const mod2 = b.createModule();
b.setChildToParent(mod1, mod2);