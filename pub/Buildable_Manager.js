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
      const parent = manager.getModuleParent(module);
      const allChildModules = manager.getChildModules(parent);
      
      let sumGrow = 0;
      allChildModules.forEach(m => {
        sumGrow += parseFloat(m._attachedHTML.style.flexGrow);
      })

      let thisHeight = 0;
      let otherHeight = 0;
      allChildModules.forEach(m => {
        const size = getSizeCSS(m._attachedHTML);
        const width = size.widthPaddingBorderMargin;
        const height = size.heightPaddingBorderMargin;

        if (m === module) thisHeight += height;
        else otherHeight += height;
      })

      thisHeight += yDelta;
      otherHeight -= yDelta;

      let sumHeight = thisHeight + otherHeight;

      //console.log(sumGrow, thisHeight, otherHeight);

      const prevGrowNew = sumGrow * (thisHeight / sumHeight);
      const nextGrowNew = sumGrow * (otherHeight / sumHeight);

      console.log(thisHeight / sumHeight);*/

      //module._attachedHTML.style.flexGrow = parseFloat(module._attachedHTML.style.flexGrow) + yDelta * 0.01;
      //module._attachedHTML.nextSibling.style.flexGrow = parseFloat(module._attachedHTML.nextSibling.style.flexGrow) - yDelta * 0.01;

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

      return module;
    }
}