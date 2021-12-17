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
  this.boundWidth = [50, Infinity];
  this.boundHeight = [50, Infinity];

  this.setCursor = (clientX, clientY) => {
    // assumption that cursor is within element
    // https://htmldom.dev/calculate-the-mouse-position-relative-to-an-element/
    // https://javascript.info/bubbling-and-capturing

    const bounds = this._attachedHTML.getBoundingClientRect();
    const offsetX = clientX - bounds.left;
    const offsetY = clientY - bounds.top;
    const width = bounds.width;
    const height = bounds.height;

    // Its actually not possible for offsetX, offsetY to be < 0 since the mouse cannot be outside of an element and detect it
    const tol = this.cursorTol;

    if      (Math.abs(offsetX) < tol          && Math.abs(offsetY) < tol)         this._cursor = this.canSize_N && this.canSize_W ? 'nw-resize' : 'default';
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY) < tol)         this._cursor = this.canSize_N && this.canSize_E ? 'ne-resize' : 'default'; 
    else if (Math.abs(offsetX) < tol          && Math.abs(offsetY-height) < tol)  this._cursor = this.canSize_S && this.canSize_W ? 'sw-resize' : 'default'; 
    else if (Math.abs(offsetX-width) < tol    && Math.abs(offsetY-height) < tol)  this._cursor = this.canSize_S && this.canSize_E ? 'se-resize' : 'default';
    else if (Math.abs(offsetX) < tol)                                             this._cursor = this.canSize_W                   ? 'w-resize'  : 'default';
    else if (Math.abs(offsetX-width) < tol)                                       this._cursor = this.canSize_E                   ? 'e-resize'  : 'default';
    else if (Math.abs(offsetY) < tol)                                             this._cursor = this.canSize_N                   ? 'n-resize'  : 'default';
    else if (Math.abs(offsetY-height) < tol)                                      this._cursor = this.canSize_S                   ? 's-resize'  : 'default';
    else                                                                          this._cursor = this.canMoveX && this.canMove || this.canMoveY && this.canMove ? 'move' : 'default';
  
    return this._cursor;
  }

  this.getCursor = (clientX, clientY) => {
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

    if (this._container) {
      //moduleElement.style.boxSizing = `border-box`;
      moduleElement.style.margin = `0px`;
      moduleElement.style.position = 'static';

      moduleElement.style.display = 'block';
      moduleElement.style.width = 'auto';
      //moduleElement.style.height = `${manager.snapUtility.getModuleAvailableHeight(this._container, this)}px`;
      //moduleElement.style.height = `100%`;
      //moduleElement.style.height = `calc(100% - ${manager.snapUtility.getNonModuleHeight(this._container, this)}px)`;
      moduleElement.style.height = `${this.height}px`;

      //console.log(manager.snapUtility.getNonModuleHeight(this._container, this));      
      // Append the container's global parent to the global scope
      manager.showModule(manager.getModuleGlobalParent(this._container));

    } else {

      const allChildModules = manager.getChildModules(this);
      if (allChildModules.length > 0) {
        /*
        allChildModules.forEach(m => {
          m.render();
        })*/
      }

      //moduleElement.style.boxSizing = `border-box`;
      moduleElement.style.margin = `0px`;
      moduleElement.style.position = 'absolute';

      moduleElement.style.top = this.y;
      moduleElement.style.left = this.x;
      moduleElement.style.width = `${this.width}px`;
      moduleElement.style.height = `${this.height}px`;

      manager.showModule(this);
    }

    return moduleElement;
  }

  // Parent Child Settings
  this._container = null;
  this.canMount = true;
  this.canUnmount = true;

  this.mount = (containerModule, clientX, clientY) => {
    this.canSize_N = false;
    this.canSize_S = true;
    this.canSize_W = false;
    this.canSize_E = false;

    this._container = containerModule;

    const index = manager.snapUtility.getVerticalMountIndex(containerModule, clientY);
    manager.snapUtility.insertModule(this._container, this, index);

    this.render();
  }

  this.unmount = () => {
    this.canSize_N = true;
    this.canSize_S = true;
    this.canSize_W = true;
    this.canSize_E = true;
    this._container = null;

    const rect = this._attachedHTML.getBoundingClientRect(); //ignores margin
    this.x = rect.left;
    this.y = rect.top;

    const size = getSizeCSS(this._attachedHTML);
    this.width = size.contentWidth;
    this.height = size.contentHeight;
    this.render();
  }

  this.render();

}