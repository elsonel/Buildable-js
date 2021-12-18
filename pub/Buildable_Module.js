const Module = function(manager) {
  this._id = uuidv4();
  this._attachedHTML = (() => {
    const moduleElement = document.createElement('div');
    moduleElement.dataset.moduleId = this._id;
    return moduleElement;
  })();

  this._cursor = 'default';

  // Move settings:
  this.xDefault = 500;
  this.yDefault = 500;
  this.x = this.xDefault;
  this.y = this.yDefault;

  this.canMove = true;          
  this.canMoveX = true;
  this.canMoveY = true;

  // Size settings:
  this.cursorTol = 10;

  this.widthDefault = 200;
  this.heightDefault = 200;
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
      moduleElement.style.margin = `0px`;
      moduleElement.style.position = 'static';

      // Vertical Alignment
      moduleElement.style.width = ``;
      moduleElement.style.height = ``;

      moduleElement.style.flexBasis = `50%`;//`${this.height}px`;
      moduleElement.style.flexGrow = 1;

      /*
      if (moduleElement === dfhdfh._attachedHTML.lastElementChild) {
        moduleElement.style.flexBasis = ``;
        moduleElement.style.flexGrow = 1;
      }*/

      //manager.showModule(manager.getModuleGlobalParent(this));

    } else {
      moduleElement.style.margin = `0px`;
      moduleElement.style.position = 'absolute';

      moduleElement.style.top = this.y;
      moduleElement.style.left = this.x;
      moduleElement.style.width = `${this.width}px`;
      moduleElement.style.height = `${this.height}px`;

      moduleElement.style.display = `flex`;
      moduleElement.style.flexDirection = this.storeMode === "VERTICAL" ? `column` : `row`;

      //manager.showModule(this);
    }

    return moduleElement;
  }

  this.mount = (parentModule, clientX, clientY) => {
    if (!this.canMount) return false;
    if (!parentModule.canStore) return false;

    this.canSize_N = false;
    this.canSize_S = parentModule.storeMode === "VERTICAL" ? true : false;
    this.canSize_W = parentModule.storeMode === "HORIZONTAL" ? true : false;
    this.canSize_E = false;

    const index = "VERTICAL" ? 
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

    const rect = this._attachedHTML.getBoundingClientRect();
    this.x = rect.left;
    this.y = rect.top;

    const size = getSizeCSS(this._attachedHTML);
    this.width = size.contentWidth;
    this.height = size.contentHeight;

    const parentModule = manager.getModuleParent(this);
    this._attachedHTML.remove();
    this.render();
    manager.showModule(this);
    manager.snapUtility.setAutoBounds(parentModule);

    return true;
  }
}