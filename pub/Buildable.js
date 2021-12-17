const Buildable = function (rootId) {
  const rootElement = document.getElementById(rootId);
  rootElement.addEventListener("mousedown", onPress);
  rootElement.addEventListener("mousemove", onMove);
  rootElement.addEventListener("mouseup", onRelease);
  rootElement.addEventListener('mouseleave', onRelease);

  const moduleManager = new ModuleManager(rootElement);

  let hoverModule = null;
  let activeModule = null;

  let isMouseDown = false;
  let startX = 0;
  let startY = 0;

  // Event Callbacks
  function onPress (e) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;

    setActiveModule(hoverModule);
  }

  function onMove (e) {
    if (!activeModule) {
      // Determine the module to perform an action on 

      const hoveredModules = getHoveredModules(e.clientX, e.clientY);
      hoveredModules.forEach(module => module.setCursor(e.clientX, e.clientY));
      hoverModule = getPriorityModule(hoveredModules);
      
    } else {
      // Process input events
      const deltaX = (e.clientX - startX);
      const deltaY = (e.clientY - startY);
      startX = e.clientX;
      startY = e.clientY;

      if (activeModule._cursor === 'move') moveModule(activeModule, deltaX, deltaY);
      else sizeModule(activeModule, deltaX, deltaY);

    }

    setCanvasCursor();
  }

  function onRelease(e) {
    if (activeModule) snapModule(activeModule, e.clientX, e.clientY);

    isMouseDown = false;
    setActiveModule(null);
  }

  /* Module Actions */

  const moveModule = (module, deltaX, deltaY) => {

    if (module._container && !module.canUnmount) {
      // If the module cannot be unmounted, propogate input to its parent
      const parentModule = moduleManager.getModuleParent(module);
      if (parentModule) moveModule(parentModule, deltaX, deltaY);

    } else if (module._container && module.canUnmount) {
      // Unmounting module
      module.unmount();

    } else if (!module._container) {
      // Moving global module normally
      moduleManager.dragUtility.addPosEvent(module, deltaX, deltaY);
    }

  }

  const sizeModule = (module, deltaX, deltaY) => {
    moduleManager.sizeUtility.addSizeEvent(module, deltaX, deltaY)
  }

  const snapModule = (module, clientX, clientY) => {
//    if (!module.canMount) return;

    const allHoveredModules = getHoveredModules(clientX, clientY);
    const toMount = allHoveredModules.find(m => moduleManager.getModuleGlobalParent(m) !== moduleManager.getModuleGlobalParent(module));
    
    if (toMount) {
      const cursor = toMount.getCursor(clientX, clientY);
      const parentModule = moduleManager.getModuleParent(toMount);

      if (cursor !== "move" && parentModule) module.mount(parentModule, clientX, clientY);
      else module.mount(toMount, clientX, clientY);
      
      console.log(toMount._id, cursor);
    } 

  }

  // Events

  const getPriorityModule = (moduleArray) => {
    if (moduleArray.length === 0) return null;

    const firstModule = moduleArray[0];
    const firstModuleGlobalParent = moduleManager.getModuleGlobalParent(firstModule);

    for (let i = 0; i < moduleArray.length; i++) {
      const module = moduleArray[i];
      const moduleGlobalParent = moduleManager.getModuleGlobalParent(module);

      if (moduleGlobalParent !== firstModuleGlobalParent) break;

      if (module._cursor === 'default') continue;
      else return module;
    }

    return null;
  }

  const getHoveredModules = (clientX, clientY) => {
    const hoverElements = document.elementsFromPoint(clientX, clientY);   
    const hoverModules = hoverElements.map(element => moduleManager.getModuleByElement(element));

    return hoverModules.filter(module => module !== null);
  }

  const setActiveModule = (module) => {    
    activeModule = module;
    if (module) module.render();

  }

  const setCanvasCursor = () => {    
    rootElement.style.cursor = hoverModule ? hoverModule._cursor : "default";
  }

  return moduleManager;

}