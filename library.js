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

  let allModules = [];
  let activeModule = null;

  let isMouseDown = false;
  let startX = 0;
  let startY = 0;

  /* Event Callbacks */

  function onPress (e) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;

    const clickedModule = getModuleByID(getOuterModule(e.target).id);
    if (clickedModule) {
      setActiveModule(clickedModule);
      clickedModule.setCursor(e.offsetX, e.offsetY, e.target.clientWidth, e.target.clientHeight)
    }

    render();
  }

  function onMove (e) {
    if (!isMouseDown && !activeModule) {
      const module = getModuleByID(getOuterModule(e.target).id);
      if (module) module.setCursor( e.offsetX, 
                                    e.offsetY, 
                                    e.target.clientWidth, 
                                    e.target.clientHeight)
    }

    if (isMouseDown && activeModule) {
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);
      startX = e.clientX;
      startY = e.clientY;

      if (activeModule.cursor == 'move') activeModule.addPos(deltaX, deltaY);
      else activeModule.addSize(deltaX, deltaY);
    }

    render();
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
    /*https://javascript.info/bubbling-and-capturing*/
    return allModules.find((module) => module.id == id);
  }

  function setActiveModule(module) {
    activeModule = module;
    
    if (module != null) {
      allModules = allModules.filter((m) => m !== module);
      allModules.unshift(module);
    }

    render();
  }

  function render() {
    [...allModules].reverse().forEach(module => {

      let moduleElement = null;
      const array = canvasElement.children;
      for(let i = 0; i < array.length; i++)
        if (array[i].id === module.id) {
          moduleElement = array[i];
          break;
        }

      if (!moduleElement) {
        moduleElement = document.createElement('div');
        moduleElement.className = "module";
        moduleElement.id = module.id;
        moduleElement.style.position = 'absolute';
        //moduleElement.style.paddingTop = '10px';
        //moduleElement.innerHTML = module.id;

        /* snapping test */

        const parent = moduleElement;

        child1 = document.createElement('div');
        child1.style.width = '100%';
        child1.style.height = `${module.height * 0.5}px`;
        child1.style.backgroundColor = 'red';

        parent.appendChild(child1);
      }

      moduleElement.style.cursor = module.cursor;
      //canvasElement.style.cursor = activeModule ? module.cursor : "default";

      moduleElement.style.top = module.yPos;
      moduleElement.style.left = module.xPos;
      moduleElement.style.width = `${module.width}px`;
      moduleElement.style.height = `${module.height}px`

      canvasElement.appendChild(moduleElement)
    });
  }

   /* Public Functions */

  this.createModule = function () {    
    allModules.push(new Module()); 

    render();
  }

}

const Module = function() {

  this.id = uuidv4();
  this.cursor = null;

  this.xPos = 400;
  this.yPos = 400;
  this.width = 200;
  this.height = 200;

  this.canMoveX = true;
  this.canMoveY = true;
  
  this.canSize_N = true;
  this.canSize_S = true;
  this.canSize_W = true;
  this.canSize_E = true;

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
        this.width -= value;
        this.xPos += value;
        break;
      case 'e-resize':
        if (!this.canSize_E) break;
        this.width += value;
        break;
      case 'n-resize':
        if (!this.canSize_N) break;
        if (this.yPos + value > this.yPos + this.height) break;
        this.height -= value;
        this.yPos += value;
        break;
      case 's-resize':
        if (!this.canSize_S) break;
        this.height += value;
        break;
    }
  }

  this.setCursor = function(offsetX, offsetY, width, height) {
    const tol = 4;

    if      (offsetX < 0+tol      && offsetY < 0+tol)       this.cursor = 'nw-resize';
    else if (offsetX > width-tol  && offsetY < 0+tol)       this.cursor = 'ne-resize';
    else if (offsetX < 0+tol      && offsetY > height-tol)  this.cursor = 'sw-resize';
    else if (offsetX > width-tol  && offsetY > height-tol)  this.cursor = 'se-resize';
    else if (offsetX < 0+tol)                               this.cursor = 'w-resize';
    else if (offsetX > width-tol)                           this.cursor = 'e-resize';
    else if (offsetY < 0+tol)                               this.cursor = 'n-resize';
    else if (offsetY > height-tol)                          this.cursor = 's-resize';
    else if (offsetX >= 0+tol && 
             offsetX <= width-tol && 
             offsetY >= 0+tol && 
             offsetY <= height-tol)                         this.cursor = 'move';
  }

}

const l = new Library("canvas");
l.createModule();
l.createModule();