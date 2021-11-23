const Buildable = function (id) {
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

  this.removeFromGlobal = function(module) {
    const index = outerModules.indexOf(module);
    if (index > -1) outerModules.splice(index, 1);
  }

  this.createModule = function () {   
    const module = new Module(this.addToGlobal, this.removeFromGlobal);
    
    allModules[module.id] = module;
    outerModules.push(module); 
    console.log(outerModules === module.root);

    return module;
  }

}