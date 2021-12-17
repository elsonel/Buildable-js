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

  // Parenting Functions 

  this.getMinMaxWidth = (moduleArray) => {
    const mins = moduleArray.map(module => {
      const moduleElement = module._attachedHTML;
      const size = getSizeCSS(moduleElement);
      const misc = size.widthPaddingBorderMargin - size.contentWidth;
      return misc + module.boundWidth[0];
    })

    const maxs = moduleArray.map(module => {
      const moduleElement = module._attachedHTML;
      const size = getSizeCSS(moduleElement);
      const misc = size.widthPaddingBorderMargin - size.contentWidth;
      return misc + module.boundWidth[1];
    })

    const min = Math.min(...mins);
    const max = Math.max(...maxs);

    if (min > max) { 
      console.error("Error encountered due to sizing contradiction");
      return null;
    }

    return [min, max];
  }

  this.getMinMaxHeight = (moduleArray) => {
    const mins = moduleArray.map(module => {
      const moduleElement = module._attachedHTML;
      const size = getSizeCSS(moduleElement);
      const misc = size.heightPaddingBorderMargin - size.contentHeight;
      return misc + module.boundHeight[0];
    })

    const maxs = moduleArray.map(module => {
      const moduleElement = module._attachedHTML;
      const size = getSizeCSS(moduleElement);
      const misc = size.heightPaddingBorderMargin - size.contentHeight;
      return misc + module.boundHeight[1];
    })

    const min = Math.min(...mins);
    const max = Math.max(...maxs);

    if (min > max) { 
      console.error("Error encountered due to sizing contradiction");
      return null;
    }

    return [min, max];
  }

  this.getNonModuleHeight = function(module, storedModule) {
    const allChildElements = manager.getChildElements(module._attachedHTML);

    let acc = 0;
    allChildElements.forEach(element => {
      if (storedModule._attachedHTML !== element) {
        const rect = element.getBoundingClientRect();
        acc += rect.height;
      }
    })

    return acc;
  }

  this.getModuleAvailableHeight = (module, storedModule) => {
    const allChildElements = manager.getChildElements(module._attachedHTML);

    let acc = 0;
    allChildElements.forEach(element => {
      if (storedModule._attachedHTML !== element) {
        const size = getSizeCSS(element);
        acc += size.heightPaddingBorderMargin;
      }
    })

    const size = getSizeCSS(module._attachedHTML);
    const moduleHeight = size.height;

    return moduleHeight - acc;

  }

  // Insertions

  this.insertStart = (parentModule, module) => {
    const parentElement = parentModule._attachedHTML;
    const childElement = module._attachedHTML;
    parentElement.insertBefore(childElement, parentElement.firstChild);
  }

  this.insertEnd = (parentModule, module) => {
    const parentElement = parentModule._attachedHTML;
    const childElement = module._attachedHTML;
    parentElement.appendChild(childElement);
  }

  this.insertBefore = (parentModule, siblingModule, module) => {
    const parentElement = parentModule._attachedHTML;
    const siblingElement = siblingModule._attachedHTML;
    const childElement = module._attachedHTML;
    parentElement.insertBefore(childElement, siblingElement);
  }

  this.insertAfter = (parentModule, siblingModule, module) => {
    const parentElement = parentModule._attachedHTML;
    const siblingElement = siblingModule._attachedHTML;
    const childElement = module._attachedHTML;
    parentElement.insertBefore(childElement, siblingElement.nextSibling);
  }

  this.insertModule = (parentModule, module, index) => {

    const allChildModules = manager.getChildModules(parentModule);
    const parentElement = parentModule._attachedHTML;
    const moduleElement = module._attachedHTML;
    const siblingModule = allChildModules[index];

    if (!siblingModule) {
      parentElement.appendChild(moduleElement);
    }
    else {
      const siblingElement = allChildModules[index]._attachedHTML;
      parentElement.insertBefore(moduleElement, siblingElement);
    }

  }

  this.getVerticalMountIndex = (parentModule, clientY) => {
    const allChildModules = manager.getChildModules(parentModule);

    // Container is empty, return 0
    if (allChildModules.length === 0) return 0;

    // Position is before first element, return 0
    const firstModule = allChildModules[0];
    const rect1 = firstModule._attachedHTML.getBoundingClientRect();
    if (clientY < rect1.top) return 0;
    
    // Position is after last element, return child array length
    const lastModule = allChildModules[allChildModules.length - 1];
    const rect2 = lastModule._attachedHTML.getBoundingClientRect();
    if (clientY > rect2.bottom) return allChildModules.length;
    
    // Find the closest module to position 
    const found = allChildModules.find(m => {
      const rect = m._attachedHTML.getBoundingClientRect();
      return (clientY < rect.bottom) && (clientY > rect.top);
    })

    // return that modules position if above center, otherwise return next index
    const rect = found._attachedHTML.getBoundingClientRect();
    const centerY = (rect.bottom + rect.top) / 2;

    if (clientY < centerY) return allChildModules.indexOf(found);
    else return allChildModules.indexOf(found) + 1;

  }
  
}

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
      return this.getModuleById(element.dataset.moduleId);
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
  
    this.showModule = (module) => {
      rootElement.appendChild(this.getElementByModule(module));
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
  
      return module;
    }
}