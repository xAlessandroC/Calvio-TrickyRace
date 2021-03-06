var canvas, overlay, gl, ctx_2d, program

var phi, theta, radius
var cameraPosition, up, target
var angle, ar, near, far

var game_env


var speedBoost_number = 0
var score = 9999

var a=-7,b=56,c=-45


var l_x = 0, l_y = 100, l_z = 0;
var step_x = 10, step_y = 10, step_z = 10;

var light = [l_x, l_y, l_z]

// settings
var third_person = false
var startPlayed = false
var finished = false
var activeBox = false
var activeEnvironmentBox = false
var activeEnvironmentMap = true
var activeLighting = true

///////////////////////// INIT FUNCTIONS /////////////////////////////////////////////////
function init_gl(){
  program = webglUtils.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

  var matrix = m4.inverse(m4.lookAt(cameraPosition, target, up))
  var projectionMatrix = m4.perspective(degToRad(angle), ar, near, far);
  var res = m4.multiply(projectionMatrix, matrix)

  gl.useProgram(program.program)
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
  overlay = document.getElementById("overlay_canvas_2d")
  gl = canvas.getContext("webgl")
  ctx_2d = overlay.getContext("2d")

  // Adatto il canvas a ricoprire il browser
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  overlay.width = window.innerWidth
  overlay.height = window.innerHeight

  //mouse controls
  setUpMouseInteraction()
  keyboardSetUp()
  ButtonSetUp()
  setUpEnvironmentMapping()

  // Inizializzo game environment
  game_env = {}

  document.getElementById("activeCollisionBox").addEventListener('click', function(e){activeBox = !activeBox})
  document.getElementById("activeEnvironmentBox").addEventListener('click', function(e){activeEnvironmentBox = !activeEnvironmentBox})
  document.getElementById("activeLighting").addEventListener('click', function(e){activeLighting = !activeLighting})
  document.getElementById("activeEnvironmentMap").addEventListener('click', function(e){activeEnvironmentMap = !activeEnvironmentMap})
}

const FRAMES_PER_SECOND = 30;
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5;
var lastFrameTime = 0;
function update(time){
    if(time-lastFrameTime < FRAME_MIN_TIME){
      frameStep()
      window.requestAnimationFrame(update);
      if(completion === toComplete && startPlayed === true && finished === false)
        score = Math.floor( score * 0.9999 )
      return;
    }
    lastFrameTime = time;
    render();
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
  var collidedWith = new Object()
  var i = 0, j = 0

  for(i=0;i<size;i++){
    temp[i] = "false"
    collidedWith[i] = []
  }

  for(i=0;i<size;i++){
    for(j=i+1;j<size;j++){
      if(game_env[keys[i]].hasCollisionBox() && game_env[keys[j]].hasCollisionBox()){
        var collision = game_env[keys[i]].collisionBox.hasCollided(game_env[keys[j]].collisionBox)

        if(collision){
          temp[i] = "true"
          temp[j] = "true"
          collidedWith[i].push(keys[j])
          collidedWith[j].push(keys[i])
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
        collidedWith[i].forEach((tag) => {
          game_env[keys[i]].onCollision(tag)
        });
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
