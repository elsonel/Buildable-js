const Buildable = function (rootId) {
  const canvasElement = document.getElementById(rootId);
  canvasElement.addEventListener("mousedown", onPress);
  canvasElement.addEventListener("mousemove", onMove);
  canvasElement.addEventListener("mouseup", onRelease);
  canvasElement.addEventListener('mouseleave', onRelease);

  const allModules = {};
  const globalModules = [];

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
    render(globalModules);
  }

  function onMove (e) {
    hoverModules = getHoveredModules(e.clientX, e.clientY);

    if (!activeModule) {

      // Figure out what action to perform at each layer for each hovered module
      setModuleCursors(hoverModules, e.clientX, e.clientY);

      // Determine the module to perform an action on 
      hoverModule = getPriorityModule(hoverModules);
      
    } else {
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);
      startX = e.clientX;
      startY = e.clientY;

      if (activeModule._cursor === 'move')                           
        activeModule.DRAG.addPos(activeModule, deltaX, deltaY);
      else if (activeModule._cursor !== 'default' && activeModule._cursor !== 'move') 
        activeModule.SIZE.addSize(activeModule, deltaX, deltaY);
    }

    render(globalModules);
  }

  function onRelease(e) {    
    const moduleArray = getForegroundModules(getBackgroundModules(hoverModules));
    for (let i = 0; i < moduleArray.length; i++) {
      const module = moduleArray[i];
      
      if (module._cursor === 'n-resize') {
        activeModule.mount(module, module._children.length); 
        break;
      } else if (module._cursor === 's-resize') {
        activeModule.mount(module, 0);
        break;
      }
    }

    isMouseDown = false;
    setActiveModule(null);
  }

  /* Events */

  const setModuleCursors = (moduleArray, xPos, yPos) => {
    // https://htmldom.dev/calculate-the-mouse-position-relative-to-an-element/
    // https://javascript.info/bubbling-and-capturing
    // module.setCursor(e.offsetX, e.offsetY, e.target.clientWidth, e.target.clientHeight);

    moduleArray.forEach(module => {
      const bounds = module._attachedHTML.getBoundingClientRect();
      const x = xPos - bounds.left;
      const y = yPos - bounds.top;
      const width = bounds.width;
      const height = bounds.height;

      module.setCursor(x, y, width, height);
    });
  }

  const setActiveModule = (module) => {    
    if (activeModule) activeModule.onDeactive();
    activeModule = module;

    if (module) {
      this.addToGlobal(getGlobalModule(module));
      module.onActive();
    }

    render(globalModules);
  }

  const render = (moduleArray) => {    
    [...moduleArray].reverse().forEach(module => {
      const moduleElement = module._attachedHTML;

      if (!module._parent) {
        moduleElement.style.position = 'absolute';
        moduleElement.style.top = module._posY;
        moduleElement.style.left = module._posX;
        moduleElement.style.width = `${module._width}px`;
        moduleElement.style.height = `${module._height}px`;

        canvasElement.appendChild(moduleElement);
      } else {

        const parentElement = module._parent._attachedHTML;

        moduleElement.style.position = 'static';
        moduleElement.style.width = '100%';
        moduleElement.style.height = `${module._height}px`;

        parentElement.appendChild(moduleElement);
      }
      
      render(module._children);
    });

    canvasElement.style.cursor = hoverModule ? hoverModule._cursor : "default";
  }

  /* Utility */

  const getPriorityModule = (moduleArray) => {
    const culledModules = getForegroundModules(moduleArray);
    for (let i = 0; i < culledModules.length; i++) {
      const module = culledModules[i];

      if      (module._cursor === 'default')                              continue;
      else if (module._cursor !== 'default' && module._cursor !== 'move') return module;
      else if (module._cursor === 'move')                                 return module;
    }

    return null;
  }

  const getGlobalModule = (module) => {
    if (module._parent) return getGlobalModule(module._parent);
    else return module;
  }

  const getModuleById = (id) => {
    return allModules[id];
  }

  const getHoveredModules = (xPos, yPos) => {
    const hoverElements = document.elementsFromPoint(xPos, yPos);   
    const hoverModuleElements = hoverElements.filter(element => getModuleById(element.dataset.moduleId));

    return hoverModuleElements.map(moduleElement => getModuleById(moduleElement.dataset.moduleId));
  }

  const getForegroundModules = (moduleArray) => {
    if (moduleArray.length != 0) 
      return moduleArray.filter(module => getGlobalModule(module) === getGlobalModule(moduleArray[0]));
    else 
      return [];
  }

  const getBackgroundModules = (moduleArray) => {
    if (moduleArray.length != 0) 
      return moduleArray.filter(module => getGlobalModule(module) !== getGlobalModule(moduleArray[0]));
    else 
      return [];
  }

   /* Public Functions */

  this.removeFromGlobal = (module) => {
    const index = globalModules.indexOf(module);
    if (index > -1) globalModules.splice(index, 1);
  }

  this.addToGlobal = (module) => {
    if (module.parent) module.unmount();
    this.removeFromGlobal(module);
    globalModules.unshift(module);
  }

  this.createModule = () => {   
    const module = new Module(this.addToGlobal, this.removeFromGlobal);
    
    allModules[module._id] = module;
    globalModules.push(module); 

    return module;
  }

}