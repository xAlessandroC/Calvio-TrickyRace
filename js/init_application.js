var canvas, gl, program

var phi, theta, radius
var cameraPosition, up, target
var angle, ar, near, far

var game_env

var speedBoost_number = 0

var light2 = [0,0,0]

// var a=-15,b=116,c=18
var a=-7,b=56,c=-45
// -40/24/6
// OK -7/56/-45
// FIRST PERSON 0 0 -1
//b=116

var l_x = -39, l_y = 100, l_z = 100;
var step_x = 10, step_y = 10, step_z = 10;


// settings
var free_view = false
var first_person = false

function render(){
  clear()

  for (const [type, mesh] of Object.entries(game_env)) {

    if(game_env['car'] === undefined){
      cameraPosition = [radius*Math.sin(phi)*Math.cos(theta),
                        radius*Math.sin(phi)*Math.sin(theta),
                        radius*Math.cos(phi)]
    }else{
      target = game_env['car'].center
      document.getElementById("target").innerHTML = "[" + target[0] + " / " + target[1] + " / " + target[2] + "]"
      cameraPosition = [game_env['car'].center[0]+a,game_env['car'].center[1]+b,game_env['car'].center[2]+c]
    }

    var matrix = m4.inverse(m4.lookAt(cameraPosition, target, up))
    var projectionMatrix = m4.perspective(degToRad(angle), ar, near, far);

    mesh.draw(matrix, projectionMatrix)
  }
  document.getElementById("a-b-c").innerHTML = ""+a+"/"+b+"/"+c
}

function clear(){
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  // console.log(canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

///////////////////////// INIT FUNCTIONS /////////////////////////////////////////////////
function init_gl(){
  program = webglUtils.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

  var matrix = m4.inverse(m4.lookAt(cameraPosition, target, up))
  var projectionMatrix = m4.perspective(degToRad(angle), ar, near, far);
  var res = m4.multiply(projectionMatrix, matrix)

  gl.useProgram(program.program)

  render()
}

function init_param(){
  phi = degToRad(0); theta = degToRad(0); radius = 80
  cameraPosition = [radius*Math.sin(phi)*Math.cos(theta),
                    radius*Math.sin(phi)*Math.sin(theta),
                    radius*Math.cos(phi)]
  up = [0, 1, 0]
  target = [0, 0, 0]

  ar = canvas.clientWidth/canvas.clientHeight
  angle = 50
  near = 1
  far = 1000
}

function init_canvas(){
  canvas = document.getElementById("my_Canvas")
  gl = canvas.getContext("webgl")

  // Adatto il canvas a ricoprire il browser
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  //mouse controls
  setUpMouseInteraction()
  keyboardSetUp()

  // Inizializzo game environment
  game_env = {}

  webglLessonsUI.setupSlider("#button_a", {value: a, slide: updateA, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_b", {value: b, slide: updateB, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_c", {value: c, slide: updateC, min: -100, max: 100});

  webglLessonsUI.setupSlider("#button_x", {value: l_x, slide: updateX, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_y", {value: l_y, slide: updateY, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_z", {value: l_z, slide: updateZ, min: -100, max: 100});

  webglLessonsUI.setupSlider("#button_phi", {value: phi, slide: updatePhi, min: -360, max: 360});
  webglLessonsUI.setupSlider("#button_theta", {value: theta, slide: updateTheta, min: -360, max: 360});
  webglLessonsUI.setupSlider("#button_r", {value: radius, slide: updateR, min: -360, max: 360});
}

const FRAMES_PER_SECOND = 30;
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5;
var lastFrameTime = 0;
function update(time){
    if(time-lastFrameTime < FRAME_MIN_TIME){
      frameStep()
      window.requestAnimationFrame(update);
      return;
    }
    lastFrameTime = time;
    render();
    document.getElementById("n_boost").innerHTML = "boost " + speedBoost_number
    window.requestAnimationFrame(update);
}

function frameStep(){
  if(game_env['car'] !== undefined){
    (game_env['car']).carStep();
    checkCollision()
  }

  var size = Object.keys(game_env).length
  var keys = Object.keys(game_env)

  for(i=0;i<size;i++){
    if(keys[i].startsWith("obstacle")){
      game_env[keys[i]].obstacleStep()
    }
  }

  for(i=0;i<size;i++){
    if(keys[i].startsWith("boost")){
      game_env[keys[i]].boostStep()
    }
  }
}

function checkCollision(){
  var size = Object.keys(game_env).length
  var keys = Object.keys(game_env)
  var temp = new Object()
  var i = 0, j = 0

  for(i=0;i<size;i++){
    temp[i] = "false"
  }

  for(i=0;i<size;i++){
    for(j=i+1;j<size;j++){
      if(game_env[keys[i]].hasCollisionBox() && game_env[keys[j]].hasCollisionBox()){
        var collision = game_env[keys[i]].collisionBox.hasCollided(game_env[keys[j]].collisionBox)

        if(collision){
          temp[i] = "true"
          temp[j] = "true"
          console.log("Collided " + game_env[keys[i]].id + " and " + game_env[keys[j]].id)
        }
      }
    }
  }

  for(i=0;i<size;i++){
    if(game_env[keys[i]].hasCollisionBox()){
      if(temp[i] == "false"){
        game_env[keys[i]].collisionBox.clean()
      }else{
        game_env[keys[i]].collisionBox.collided()
        game_env[keys[i]].onCollision()
      }
    }
  }
}

init_canvas()
init_param()
init_gl()
initScene()
render()
window.requestAnimationFrame(update);
