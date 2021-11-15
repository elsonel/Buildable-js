function uuidv4() {
  /*https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid*/
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const library = function (id) {
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

    setActiveModule(allModules.find((module) => module.id == e.target.id));
  }

  function onMove (e) {
    if (!isMouseDown || !activeModule) return;

    const deltaX = (e.clientX - startX);
    const deltaY = (e.clientY - startY);
    addPos(deltaX, deltaY, activeModule);

    startX = e.clientX;
    startY = e.clientY;
  }

  function onRelease(e) {
    isMouseDown = false;
    setActiveModule(null);
  }


   /* Private Functions */

  function setActiveModule(module) {
    activeModule = module;
    
    if (module != null) {
      allModules = allModules.filter((m) => m !== module);
      allModules.unshift(module);
    }

    render();
  }

  function addPos(xPos, yPos, module) {
    module.xPos += xPos;
    module.yPos += yPos;

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
        moduleElement.innerHTML = module.id;
      }

      moduleElement.style.top = module.yPos;
      moduleElement.style.left = module.xPos;
      moduleElement.style.width = module.width;
      moduleElement.style.height = module.height;

      canvasElement.appendChild(moduleElement)
    });
  }


   /* Public Functions */

  this.createModule = function () {
    const module = {};
    module.id = uuidv4();

    module.xPos = 0;
    module.yPos = 0;
    module.width = "20%";
    module.height = "20%";

    allModules.push(module); 

    render();
  }

}

const l = new library("canvas");
l.createModule();
l.createModule();
l.createModule();