var canvas, gl, program

var phi, theta, radius
var cameraPosition, up, target
var angle, ar, near, far

var game_env

// var a=-15,b=116,c=18
var a=-40,b=24,c=6
// -40/24/6
//b=116

var l_x = -39, l_y = 100, l_z = 100;
var step_x = 10, step_y = 10, step_z = 10;


// settings
var free_view = false

function loadTrack(){
  readMesh('track/track3.obj')
  .then((mesh)=>{
    game_env['track'] = new Track(mesh)
    // render()
    console.log("track caricato")
    readMesh('track/terrain.obj')
    .then((mesh)=>{
      game_env['terrain'] = new Track(mesh)
      // render()
      console.log("terrain caricato")
    })
  })
}

function loadF1(){
  var temp = []
  readMesh('f1_car/chassis.obj', 'car')
  .then((mesh)=>{ temp.push(mesh); return readMesh('f1_car/w0.obj', 'w0') })
  .then((mesh)=>{ temp.push(mesh); return readMesh('f1_car/w1.obj', 'w0') })
  .then((mesh)=>{ temp.push(mesh); return readMesh('f1_car/w2.obj', 'w0') })
  .then((mesh)=>{ temp.push(mesh); return readMesh('f1_car/w3.obj', 'w0') })
  .then((mesh)=>{ temp.push(mesh);
   game_env['car'] = new Car(temp, "car1")

   target = game_env['car'].center

   cameraPosition = [game_env['car'].center[0]+a,game_env['car'].center[1]+b,game_env['car'].center[2]+c]

   // game_env['car'].setCollisionBox(game_env['car'].chassis)

   render() })
}

function render(){
  clear()

  for (const [type, mesh] of Object.entries(game_env)) {

    if(free_view === true){
      cameraPosition = [radius*Math.sin(phi)*Math.cos(theta),
                        radius*Math.sin(phi)*Math.sin(theta),
                        radius*Math.cos(phi)]
    }else{
      if(game_env['car'] !== undefined){
        target = game_env['car'].center
        cameraPosition = [game_env['car'].center[0]+a,game_env['car'].center[1]+b,game_env['car'].center[2]+c]
      }
    }

    var matrix = m4.inverse(m4.lookAt(cameraPosition, target, up))
    var projectionMatrix = m4.perspective(degToRad(angle), ar, near, far);

    mesh.draw(matrix, projectionMatrix)
  }
  document.getElementById("a-b-c").innerHTML = ""+a+"/"+b+"/"+c
  // window.requestAnimationFrame(render)
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


  document.getElementById("Button7").onclick = function(){a+=5; render()};
  document.getElementById("Button8").onclick = function(){a-=5; render()};
  document.getElementById("Button9").onclick = function(){b+=1; render()};
  document.getElementById("Button10").onclick = function(){b-=1; render()};
  document.getElementById("Button11").onclick = function(){c+=1; render()};
  document.getElementById("Button12").onclick = function(){c-=1; render()};
  document.getElementById("a-b-c").innerHTML = ""+a+"/"+b+"/"+c

  webglLessonsUI.setupSlider("#button_x", {value: l_x, slide: updateX, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_y", {value: l_y, slide: updateY, min: -100, max: 100});
  webglLessonsUI.setupSlider("#button_z", {value: l_z, slide: updateZ, min: -100, max: 100});
}

function updateX(event, ui) {
  l_x = ui.value;
  render();
}
function updateY(event, ui) {
  l_y = ui.value;
  render();
}
function updateZ(event, ui) {
  l_z = ui.value;
  render();
}

const FRAMES_PER_SECOND = 30;
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5;
var lastFrameTime = 0;
function update(time){
    if(time-lastFrameTime < FRAME_MIN_TIME){
      if(game_env['car']!==undefined){
        (game_env['car']).carStep();
        // if(game_env['car2'].collisionBox!==undefined)
        //   (game_env['car']).collisionBox.hasCollided(game_env['car2'].collisionBox)
      }
      window.requestAnimationFrame(update);
      return;
    }
    lastFrameTime = time;
    render();
    console.log("render")
    window.requestAnimationFrame(update);
}

init_canvas()
init_param()
init_gl()
loadTrack()
loadF1()
render()
window.requestAnimationFrame(update);
