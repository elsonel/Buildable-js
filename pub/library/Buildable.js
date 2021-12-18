(function(global, document) { 

  // General global utility functions
  function uuidv4() {
    // Function from:
    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
  
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  
  }
  
  function colorGen() {
    // Function from:
    // https://stackoverflow.com/questions/1484506/random-color-generator?page=2&tab=Votes
    return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);
  }
  
  function getSizeCSS(element) {
    const computed = getComputedStyle(element);
    const paddingWidth = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
    const paddingHeight = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const marginWidth = parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
    const marginHeight = parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
    const boxSizing = computed.boxSizing;
  
    const data = {
      contentWidth:               boxSizing === "border-box" ? element.offsetWidth : element.clientWidth - paddingWidth,
      contentHeight:              boxSizing === "border-box" ? element.offsetHeight : element.clientHeight - paddingHeight,
      width:                      element.clientWidth - paddingWidth,
      height:                     element.clientHeight - paddingHeight,
      widthPadding:               element.clientWidth,
      heightPadding:              element.clientHeight,
      widthPaddingBorder:         element.offsetWidth,
      heightPaddingBorder:        element.offsetHeight,
      widthPaddingBorderMargin:   element.offsetWidth + marginWidth,
      heightPaddingBorderMargin:  element.offsetHeight + marginHeight,
      boxSizing:                  boxSizing,
    }
  
    return data;
  }

  // Main module class
  const Module = function(manager) {
    this._id = uuidv4();
    this._attachedHTML = (() => {
      const moduleElement = document.createElement('div');
      moduleElement.dataset.moduleId = this._id;
      return moduleElement;
    })();
  
    this._cursor = 'default';
  
    // Move settings:
    this.xDefault = 0;
    this.yDefault = 0;
    this.x = this.xDefault;
    this.y = this.yDefault;
  
    this.canMove = true;          
    this.canMoveX = true;
    this.canMoveY = true;
  
    // Size settings:
    this.cursorTol = 10;
  
    this.widthDefault = 100;
    this.heightDefault = 100;
    this.width = this.widthDefault;
    this.height = this.heightDefault;
  
    this.canSize = true;
    this.canSizeWidth = true;
    this.canSizeHeight = true;
    this.canSize_N = true;
    this.canSize_S = true;
    this.canSize_W = true;
    this.canSize_E = true;
    this.boundWidthDefault = [50, Infinity];
    this.boundHeightDefault = [50, Infinity];
    this.boundWidth = this.boundWidthDefault;
    this.boundHeight = this.boundHeightDefault;
  
    // Child Settings
    this.canMount = true;
    this.canUnmount = true;
  
    // Parent Settings
    this.canStore = true;
    this.storeMode = "VERTICAL";
  
    // Misc Settings
    this.backgroundLock = false;
  
    this.setCursor = (clientX, clientY) => {
  
      const checks = () => {
        const cursor = this.getCursor(clientX, clientY);
  
        if      (cursor === 'nw-resize' && this.canSize && this.canSize_N && this.canSize_W)   return cursor; 
        else if (cursor === 'sw-resize' && this.canSize && this.canSize_S && this.canSize_W)   return cursor; 
        else if (cursor === 'ne-resize' && this.canSize && this.canSize_N && this.canSize_E)   return cursor;
        else if (cursor === 'sw-resize' && this.canSize && this.canSize_S && this.canSize_W)   return cursor;
        else if (cursor === 'se-resize' && this.canSize && this.canSize_S && this.canSize_E)   return cursor;
        else if (cursor === 'w-resize' && this.canSize && this.canSizeWidth && this.canSize_W) return cursor;
        else if (cursor === 'e-resize' && this.canSize && this.canSizeWidth && this.canSize_E) return cursor;
        else if (cursor === 'n-resize' && this.canSize && this.canSizeWidth && this.canSize_N) return cursor;
        else if (cursor === 's-resize' && this.canSize && this.canSizeWidth && this.canSize_S) return cursor;
        else if (cursor === 'move' && this.canMove && (this.canMoveX || this.canMoveY))        return cursor;
  
        return 'default';
      }
  
      this._cursor = checks();
    }
  
    this.getCursor = (clientX, clientY) => {
      // assumption that cursor is within element
      // https://htmldom.dev/calculate-the-mouse-position-relative-to-an-element/
      // https://javascript.info/bubbling-and-capturing
  
      const bounds = this._attachedHTML.getBoundingClientRect();
      const offsetX = clientX - bounds.left;
      const offsetY = clientY - bounds.top;
      const width = bounds.width;
      const height = bounds.height;
  
      const tol = this.cursorTol;
  
      if      (Math.abs(offsetX) < tol          && Math.abs(offsetY) < tol)         return 'nw-resize';
      else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY) < tol)         return 'ne-resize';
      else if (Math.abs(offsetX) < tol          && Math.abs(offsetY-height) < tol)  return 'sw-resize'; 
      else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY-height) < tol)  return 'se-resize';
      else if (Math.abs(offsetX) < tol)                                             return 'w-resize';
      else if (Math.abs(offsetX-width) < tol)                                       return 'e-resize';
      else if (Math.abs(offsetY) < tol)                                             return 'n-resize';
      else if (Math.abs(offsetY-height) < tol)                                      return 's-resize';
      
      return 'move';
    }
  
    this.render = () => {
      const moduleElement = this._attachedHTML;
  
      if (manager.getModuleParent(this)) {
        moduleElement.style.position = 'static';
  
        // Vertical Alignment
        moduleElement.style.width = ``;
        moduleElement.style.height = ``;
  
      } else {
  
        moduleElement.style.position = 'absolute';
  
        moduleElement.style.top = `${this.y}px`;
        moduleElement.style.left = `${this.x}px`;
        moduleElement.style.width = `${this.width}px`;
        moduleElement.style.height = `${this.height}px`;
      }
  
      moduleElement.style.margin = `0px`;
      moduleElement.style.display = `flex`;
      moduleElement.style.flexDirection = this.storeMode === "VERTICAL" ? `column` : `row`;
  
      return moduleElement;
    }
  
    this.mount = (parentModule, clientX, clientY) => {
      if (!this.canMount) return false;
      if (!parentModule.canStore) return false;
  
      this.canSize_N = false;
      this.canSize_S = parentModule.storeMode === "VERTICAL" ? true : false;
      this.canSize_W = false;
      this.canSize_E = parentModule.storeMode === "HORIZONTAL" ? true : false;
      this._attachedHTML.style.flexGrow = 1 //<=========================================== should probably move this
  
      const index = parentModule.storeMode === "VERTICAL" ? 
        manager.snapUtility.getVerticalMountIndex(parentModule, clientY) : 
        manager.snapUtility.getHorizontalMountIndex(parentModule, clientX); 
      
      manager.snapUtility.insertIndex(parentModule, this, index);
      manager.snapUtility.setAutoBounds(parentModule);
  
      return true;
    }
  
    this.unmount = () => {
      if (!this.canUnmount) return false;
  
      this.canSize_N = true;
      this.canSize_S = true;
      this.canSize_W = true;
      this.canSize_E = true;
  
      const parentRect = manager.canvasElement.getBoundingClientRect();
      const rect = this._attachedHTML.getBoundingClientRect();
  
      this.x = rect.left - parentRect.left;
      this.y = rect.top - parentRect.top;
  
      const size = getSizeCSS(this._attachedHTML);
      this.width = size.contentWidth;
      this.height = size.contentHeight;
  
      const parentModule = manager.getModuleParent(this);
      
      this._attachedHTML.remove();
      manager.showModule(this);
      this.render();
  
      manager.snapUtility.setAutoBounds(parentModule);
  
      return true;
    }
  }

  // Module utility classes
  const ModuleDrag = function (manager) {
    this.setPos = function(module, x, y) {
      module.x = x;
      module.y = y;
      
      module.render();
    }
  
    this.addPos = function(module, x, y) {
      
      module.x += x;
      module.y += y;
      
      module.render();
    }
  
    this.addPosEvent = function(module, xDelta, yDelta) {
      if (!module.canMove)     return;
      if (!module.canMoveX)    xDelta = 0;
      if (!module.canMoveY)    yDelta = 0;
  
      this.addPos(module, xDelta, yDelta);
    }
  
  }
  
  const ModuleSize = function (manager) {
    
    this.setSize = (module, width, height) => {
      if (width < module.boundWidth[0]) width = module.boundWidth[0];
      if (width > module.boundWidth[1]) width = module.boundWidth[1];
      if (height < module.boundHeight[0]) height = module.boundHeight[0];
      if (height > module.boundHeight[1]) height = module.boundHeight[1];
  
      module.width = width;
      module.height = height;
  
      module.render();
    }
  
    this.addSize = (module, xDelta, yDelta) => {
      if (manager.getModuleParent(module) && module._attachedHTML.nextSibling) {
        /*
  
        // Originally some attempt here at offseting sibling positions when one is moved, but
        // code got too complicated.

        //module._attachedHTML.style.flexGrow = parseFloat(module._attachedHTML.style.flexGrow) + yDelta * 0.01;
        //module._attachedHTML.nextSibling.style.flexGrow = parseFloat(module._attachedHTML.nextSibling.style.flexGrow) - yDelta * 0.01;
  
        */
        return;
      }
        
      this.setSize(module, module.width + xDelta, module.height + yDelta);
    
    }
  
    this.addSizeReverse = (module, xDelta, yDelta) => {
      const oldWidth = module.width;
      const oldHeight = module.height;
  
      this.setSize(module, module.width - xDelta, module.height - yDelta);
  
      const widthDelta = module.width - oldWidth;
      const heightDelta = module.height - oldHeight;
  
      manager.dragUtility.addPos(module, -widthDelta, -heightDelta)
    }
  
    this.addTotal = (module, eDelta, sDelta, wDelta, nDelta) => {
      if (!module.canSize)        return;
      if (!module.canSizeWidth)   eDelta = wDelta = 0;
      if (!module.canSizeHeight)  sDelta = nDelta = 0;
      if (!module.canSize_E)      eDelta = 0;
      if (!module.canSize_S)      sDelta = 0;
      if (!module.canSize_W)      wDelta = 0;
      if (!module.canSize_N)      nDelta = 0;    
        
      this.addSize(module, eDelta, sDelta);
      this.addSizeReverse(module, wDelta, nDelta);
    }
  
    this.addSizeEvent = function(module, xDelta, yDelta) {
      switch(module._cursor) {
        case 'nw-resize':
          this.addTotal(module, 0, 0, xDelta, yDelta);
          break;
        case 'ne-resize':
          this.addTotal(module, xDelta, 0, 0, yDelta);
          break;
        case 'sw-resize':
          this.addTotal(module, 0, yDelta, xDelta, 0);
          break;
        case 'se-resize':
          this.addTotal(module, xDelta, yDelta, 0, 0);
          break;
        case 'w-resize':
          this.addTotal(module, 0, 0, xDelta, 0);
          break;
        case 'e-resize':
          this.addTotal(module, xDelta, 0, 0, 0);
          break;
        case 'n-resize':
          this.addTotal(module, 0, 0, 0, yDelta);
          break;
        case 's-resize':
          this.addTotal(module, 0, yDelta, 0, 0);
          break;
      }
    }
  
  }
  
  const ModuleSnap = function (manager) {
  
    // Boundaries
  
    this.setAutoBounds = (parentModule) => {    
      const allChildModules = manager.getChildModules(parentModule);
      
      if (allChildModules.length === 0) {
        parentModule.boundWidth = parentModule.boundWidthDefault;
        parentModule.boundHeight = parentModule.boundHeightDefault;
        manager.sizeUtility.addSize(parentModule, 0, 0);
  
        if (manager.getModuleParent(parentModule))
          this.setAutoBounds(manager.getModuleParent(parentModule));
  
        return;
      }
  
      const boundData = this.getChildBounds(parentModule);
  
      if (parentModule.storeMode === "VERTICAL") {
        // Contradiction error
        if (boundData.minWidth > boundData.maxWidth || boundData.minHeightTotal > boundData.maxHeightTotal) {
          console.error('Min max contradicton error encountered');
          return; 
        }
  
        parentModule.boundWidth = [boundData.minWidth, boundData.maxWidth];
        parentModule.boundHeight = [boundData.minHeightTotal, boundData.maxHeightTotal];
  
      } else if (parentModule.storeMode === "HORIZONTAL") {
        // Contradiction error
        if (boundData.minHeight > boundData.maxHeight || boundData.minWidthTotal > boundData.maxWidthTotal) {
          console.error('Min max contradicton error encountered');
          return; 
        }
  
        parentModule.boundWidth = [boundData.minWidthTotal, boundData.maxWidthTotal];
        parentModule.boundHeight = [boundData.minHeight, boundData.maxHeight];
  
      }
  
      manager.sizeUtility.addSize(parentModule, 0, 0);
  
      if (manager.getModuleParent(parentModule))
        this.setAutoBounds(manager.getModuleParent(parentModule));
  
    }
  
    this.getChildBounds = (parentModule) => {
      const information = {
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        minWidthTotal: 0,
        maxWidthTotal: Infinity,
        minHeightTotal: 0,
        maxHeightTotal: Infinity,
      }
  
      const allChildModules = manager.getChildModules(parentModule);
      if (allChildModules.length === 0) return information;
  
      const allMinWidth = [];
      const allMaxWidth = [];
      const allMinHeight = [];
      const allMaxHeight = [];
  
      allChildModules.forEach(module => {
        const size = getSizeCSS(module._attachedHTML);
        const miscWidth = size.widthPaddingBorderMargin - size.contentWidth;
        const miscHeight = size.heightPaddingBorderMargin - size.contentHeight;
  
        allMinWidth.push(module.boundWidth[0] + miscWidth);
        allMaxWidth.push(module.boundWidth[1] + miscWidth);
        allMinHeight.push(module.boundHeight[0] + miscHeight);
        allMaxHeight.push(module.boundHeight[1] + miscHeight);
      })
  
      information.minWidth = Math.max(...allMinWidth);
      information.maxWidth = Math.min(...allMaxWidth);
      information.minHeight = Math.max(...allMinHeight);
      information.maxHeight = Math.min(...allMaxHeight);
  
      information.minWidthTotal = allMinWidth.reduce((a, b) => a + b, 0);
      information.maxWidthTotal = allMaxWidth.reduce((a, b) => a + b, 0);
      information.minHeightTotal = allMinHeight.reduce((a, b) => a + b, 0);
      information.maxHeightTotal = allMaxHeight.reduce((a, b) => a + b, 0);
  
      return information;
    }
  
    // Insertions
  
    this.insertIndex = (parentModule, module, index) => {
      const allChildElements = manager.getChildElements(parentModule._attachedHTML);
      const parentElement = parentModule._attachedHTML;
      const moduleElement = module._attachedHTML;
      
      const siblingElement = allChildElements[index];
      if (siblingElement) {
        parentElement.insertBefore(moduleElement, siblingElement);
        module.render();
        return;
      }
  
      parentElement.appendChild(moduleElement);
      module.render();
    }
  
    this.getVerticalMountIndex = (parentModule, clientY) => {
      // All elements currently in this module
      const allChildElements = manager.getChildElements(parentModule._attachedHTML);
      
      // If length is 0, just append an element 
      if (allChildElements.length === 0) return 0;
  
      // Check if to append at ends
      const firstElementRect = allChildElements[0].getBoundingClientRect();
      const lastElementRect = allChildElements[allChildElements.length - 1].getBoundingClientRect();
      
      if (clientY < firstElementRect.top) return 0;
      if (clientY > lastElementRect.bottom) return allChildElements.length;
  
      // check to append in middle
      for (let i = 0; i < allChildElements.length; i++) {
        const element = allChildElements[i];
        const rect = element.getBoundingClientRect();
  
        if (clientY > rect.top && clientY < rect.bottom) {
          const centerY = (rect.top + rect.bottom) / 2;
        
          if (clientY < centerY) return i;
          else return i + 1;
        }
      }
  
    }
    
    this.getHorizontalMountIndex = (parentModule, clientX) => {
      // All elements currently in this module
      const allChildElements = manager.getChildElements(parentModule._attachedHTML);
      
      // If length is 0, just append an element 
      if (allChildElements.length === 0) return 0;
  
      // Check if to append at ends
      const parentRect = parentModule._attachedHTML.getBoundingClientRect();
      const firstElementRect = allChildElements[0].getBoundingClientRect();
      const lastElementRect = allChildElements[allChildElements.length - 1].getBoundingClientRect();
      
      if (clientX < firstElementRect.left) return 0;
      if (clientX > lastElementRect.right) return allChildElements.length;
  
      // check to append in middle
      for (let i = 0; i < allChildElements.length; i++) {
        const element = allChildElements[i];
        const rect = element.getBoundingClientRect();
  
        if (clientX > rect.left && clientX < rect.right) {
          const centerX = (rect.left + rect.right) / 2;
        
          if (clientX < centerX) return i;
          else return i + 1;
        }
      }
    }
  
  }

  // Main class for managing all modules
  const ModuleManager = function (rootElement) {
  
      this.canvasElement = rootElement;
      this.dragUtility = new ModuleDrag(this);
      this.sizeUtility = new ModuleSize(this);
      this.snapUtility = new ModuleSnap(this);
      this.allModules = {};
    
      // DOM as Child
    
      this.getModuleById = (id) => {
        if (this.allModules.hasOwnProperty(id)) return this.allModules[id];
        return null;
      }
    
      this.getModuleByElement = (element) => {
        if (element == null) return null
        else return this.getModuleById(element.dataset.moduleId);
      }
  
      this.getElementByModule = (module) => {
        return module._attachedHTML;
      }
    
      this.getModuleParent = (module) => {
        const moduleElement = this.getElementByModule(module);
        const parentElement = moduleElement.parentElement;
        const parentModule = this.getModuleByElement(parentElement);
    
        if (parentModule) return parentModule;
    
        return null;
      }
    
      this.getModuleGlobalParent = (module) => {
        const parentModule = this.getModuleParent(module);
        if (parentModule) return this.getModuleGlobalParent(parentModule);
    
        return module;
      }
    
      // DOM as parent
    
      this.getChildElements = (element) => {
        return [...element.children];
      }
      
      this.getChildModules = (module) => {
        const allChildModules = [];
    
        let allChildElements = this.getElementByModule(module).children;
        [...allChildElements].forEach(element => {
          const associatedModule = this.getModuleByElement(element);
          if (associatedModule) allChildModules.push(associatedModule);
        })
    
        return allChildModules;
      }
    
      // External
  
      this.moveModuleBack = (module) => {
        if (!rootElement.contains(this.getElementByModule(module))) return;
  
        if (this.getModuleParent(module)) {
          rootElement.insertBefore(this.getElementByModule(this.getModuleGlobalParent(module)), rootElement.firstChild);
        } else {
          rootElement.insertBefore(this.getElementByModule(module), rootElement.firstChild);
        }
      }
  
      this.moveModuleFront = (module) => {
        if (!rootElement.contains(this.getElementByModule(module))) return;
  
        if (this.getModuleParent(module)) {
          rootElement.appendChild(this.getElementByModule(this.getModuleGlobalParent(module)));
        } else {
          rootElement.appendChild(this.getElementByModule(module));  
        }
      }
  
      this.styleModule = (module) => {
        const moduleElement = module._attachedHTML;
  
        moduleElement.style.backgroundColor = colorGen();
        moduleElement.style.userSelect = "none";
        moduleElement.style.padding = "10px";
        moduleElement.style.border = "5px solid red";
      }
    
      this.showModule = (module) => {
        if (!rootElement.contains(this.getElementByModule(module))) rootElement.appendChild(this.getElementByModule(module));  
      }
    
      this.hideModule = (module) => {
        this.getElementByModule(module).remove();
      }
    
      this.deleteModule = (module) => {
        let allChildModules = this.getChildModules(module);
        [...allChildModules].forEach(childModule => {
          childModule.unmount();
        })
        
        this.hideModule(module);
        delete this.allModules[module._id];
      }
    
      this.createModule = () => {   
        const module = new Module(this);
        this.allModules[module._id] = module;
        
        module.render();
        this.showModule(module);
        this.styleModule(module);
  
        return module;
      }
  }

  // Initialization class, responsible for creating other classes and attaching user events, returns ModuleManager
  const Buildable = function (rootElement) {
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
      if (activeModule && activeModule._cursor === "move") snapModule(activeModule, e.clientX, e.clientY);

      isMouseDown = false;
      setActiveModule(null);
    }

    /* Module Actions */

    const moveModule = (module, deltaX, deltaY) => {
      if (moduleManager.getModuleParent(module)) module.unmount();
      else moduleManager.dragUtility.addPosEvent(module, deltaX, deltaY);

    }

    const sizeModule = (module, deltaX, deltaY) => {
      moduleManager.sizeUtility.addSizeEvent(module, deltaX, deltaY)
    }

    const snapModule = (module, clientX, clientY) => {
      const allHoveredModules = getHoveredModules(clientX, clientY);
      const target = allHoveredModules.find(m => moduleManager.getModuleGlobalParent(m) !== moduleManager.getModuleGlobalParent(module));
      
      if (target) {
        const cursor = target.getCursor(clientX, clientY);
        const parentModule = moduleManager.getModuleParent(target);
        if (cursor !== "move" && parentModule) {
          if (module.mount(parentModule, clientX, clientY)) return;
        }
        
        module.mount(target, clientX, clientY);
        
        //console.log(target._id, cursor);
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
      if (module) {
        if (moduleManager.getModuleGlobalParent(module).backgroundLock) moduleManager.moveModuleBack(module);
        else moduleManager.moveModuleFront(module);
      }
    }

    const setCanvasCursor = () => {    
      rootElement.style.cursor = hoverModule ? hoverModule._cursor : "default";
    }

    return moduleManager;

  }

  global.Buildable = global.Buildable || Buildable;

})(window, window.document);