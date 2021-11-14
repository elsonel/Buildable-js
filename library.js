const library = function (id) {
  const canvasElement = document.getElementById("canvas");
  console.log(canvasElement.innerHTML);

  canvasElement.addEventListener("mousedown", onPress);
  canvasElement.addEventListener("mouseup", onRelease);
  canvasElement.addEventListener("mousemove", onMove);

  function onPress (e) {
    console.log("pressed");
  }

  function onMove (e) {
    console.log("moved");
  }

  function onRelease(e) {
    console.log("released");
  }

  this.createModule = function () {
    
  }

}


const l = new library("canvas");