var completion = 0
var toComplete = 90

function clear(){
  ctx_2d.clearRect(0, 0, overlay.width, overlay.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(175/255, 238/255, 238/255, 1);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  // console.log(canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function incrementLoading(){
  completion += 1
}

function render(){
  if(finished === false){
    if(completion === toComplete){
      // disegno i frame e la gui di gioco
      clear()
      drawGameOverlay()

      // webgl rendering
      setCamera()
      var matrix = m4.inverse(m4.lookAt(cameraPosition, target, up))
      var projectionMatrix = m4.perspective(degToRad(angle), ar, near, far);

      for (const [type, mesh] of Object.entries(game_env)) {

        if(type !== 'skybox')
          mesh.draw(matrix, projectionMatrix)
      }

      if(activeEnvironmentBox === true){
        game_env['skybox'].draw(matrix, projectionMatrix)
      }

    }else{
      // disegno la schermata di loading
      drawLoadingOverlay()
    }
  }else{
    drawEndOverlay()
  }

  console.log("COMPLETION " + completion)
}
