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

  let snapModule = null;
  let snapIndex = null;

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
      // Process input events
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);
      startX = e.clientX;
      startY = e.clientY;

      if (activeModule._cursor === 'move')                           
        activeModule.DRAG.addPos(activeModule, deltaX, deltaY);
      else if (activeModule._cursor !== 'default' && activeModule._cursor !== 'move') 
        activeModule.SIZE.addSize(activeModule, deltaX, deltaY);

      // Highlight seperate windows
    }

    highlight(e.clientX, e.clientY);

    render(globalModules);
  }

  function onRelease(e) {    
    if (snapModule) {
      snapModule._attachedHTML.style.borderLeft = null;
      snapModule._attachedHTML.style.borderRight = null;
      snapModule._attachedHTML.style.borderTop = null;
      snapModule._attachedHTML.style.borderBottom = null;
      activeModule.mount(snapModule, snapIndex);
    } 

    isMouseDown = false;
    setActiveModule(null);
  }

  /* Experiments */

  const highlight = (xPos, yPos) => {
    const moduleArray = getForegroundModules(getBackgroundModules(hoverModules));

    Object.values(allModules).forEach(module => {
      module._attachedHTML.style.borderLeft = null;
      module._attachedHTML.style.borderRight = null;
      module._attachedHTML.style.borderTop = null;
      module._attachedHTML.style.borderBottom = null;
    });

    snapModule = null;
    snapIndex = null;

    for (let i = 0; i < moduleArray.length; i++) {
      const module = moduleArray[i];

      const bounds = module._attachedHTML.getBoundingClientRect();
      const x = xPos - bounds.left;
      const y = yPos - bounds.top;
      const width = bounds.width;
      const height = bounds.height;

      const cursor = module.getCursor(x, y, width, height)

      switch(cursor) {
        case 'w-resize':
          //module._attachedHTML.style.borderLeft = "thick solid #FFFFFF";
          break;
        case 'e-resize':
          //module._attachedHTML.style.borderRight = "thick solid #FFFFFF";
          break;
        case 'n-resize':
          snapModule = module;
          snapIndex = module._children.length;
          module._attachedHTML.style.borderTop = "thick solid #FFFFFF";
          break;
        case 's-resize':
          snapModule = module;
          snapIndex = 0;
          module._attachedHTML.style.borderBottom = "thick solid #FFFFFF";
          break;  
        default:
          module._attachedHTML.style.borderLeft = null;
          module._attachedHTML.style.borderRight = null;
          module._attachedHTML.style.borderTop = null;
          module._attachedHTML.style.borderBottom = null;
      }
    
    }
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
    if (activeModule) activeModule.DRAG.onMoveEnd(activeModule);
    activeModule = module;

    if (module) {
      this.addToGlobal(getGlobalModule(module));
      module.DRAG.onMoveStart(module);
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

  this.createModule = (dragSettings, sizeSettings) => {   
    const module = new Module(this.addToGlobal, this.removeFromGlobal, dragSettings, sizeSettings);
    
    allModules[module._id] = module;
    globalModules.push(module); 

    return module;
  }

}