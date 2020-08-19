class Car {
  constructor(components, name) {
    this.id = name
    this.chassis = components[0]
    this.w0 = components[1]
    this.w1 = components[2]
    this.w2 = components[3]
    this.w3 = components[4]

    initialize_position_car(components);

    var dimensions = computeDimensions([this.chassis,this.w0, this.w1, this.w2, this.w3])
    this.width = dimensions[0]
    this.length = dimensions[1]
    this.height = dimensions[2]

    this.centerw0 = computeCenter(this.w0)
    this.centerw1 = computeCenter(this.w1)
    this.centerw2 = computeCenter(this.w2)
    this.centerw3 = computeCenter(this.w3)

    this.acceleration = 1.9
    this.attritoZ = 0.991; this.attritoX = 0.8; this.attritoY = 1.0
    this.vx = 0; this.vy = 0; this.vz = 0
    this.facing = 0; this.grip = 0.45
    this.sterzo = 0; this.vsterzo = 1.4; this.rsterzo = 0.75
    this.mozzo = 0;
    this.raggio = 1.8

    this.boost = 1; this.setBoost = false
  }

  carStep(){
    if (key_forward === true){
      // this.acceleration += 0.2
      // if(this.acceleration >= 1.2)  this.acceleration = 1.2
      this.vx += this.acceleration * this.boost
    }
    if (key_backward === true){
      // this.acceleration += 0.2
      // if(this.acceleration >= 1.2)  this.acceleration = 1.2
      this.vx -= this.acceleration
    }
    // this.acceleration *= 0.9; if(Math.abs(this.acceleration) < 0.0001) this.acceleration = 0
    document.getElementById("acceleration").innerHTML = "acc " + this.acceleration

    if (key_left === true)
      this.sterzo += this.vsterzo;
    if (key_right === true)
      this.sterzo -= this.vsterzo;
    this.sterzo *= this.rsterzo;
    if(Math.abs(this.sterzo) < 0.0001) this.sterzo = 0

    this.vx *= this.attritoX; if(Math.abs(this.vx) < 0.0001) this.vx = 0
    this.vy *= this.attritoY; if(Math.abs(this.vy) < 0.0001) this.vy = 0
    this.vz *= this.attritoZ; if(Math.abs(this.vz) < 0.0001) this.vz = 0

    this.facing = (this.vx*this.grip)*this.sterzo * 0.4;

    var da ;
    da = (180.0*this.vx)/(Math.PI*this.raggio);
    this.mozzo+=da;

    this.updatePosition()
  }

  updatePosition(){
    var mtx = m4.translate(this.chassis.getMatrix(), this.vx, this.vy, this.vz)
    var sterzo_multiplier = 30/4.2

    // chassis
    var mtx_c = m4.copy(mtx)
    mtx_c = m4.zRotate(mtx_c, degToRad(this.facing));
    this.chassis.setMatrix(mtx_c)

    // wheel 1
    var mtx_w0 = m4.copy(this.chassis.getMatrix())
    mtx_w0 = m4.translate(mtx_w0, this.centerw0[0],this.centerw0[1],this.centerw0[2])
    mtx_w0 = m4.zRotate(mtx_w0, degToRad(this.sterzo*sterzo_multiplier));
    mtx_w0 = m4.yRotate(mtx_w0, degToRad(this.mozzo));
    mtx_w0 = m4.translate(mtx_w0, -this.centerw0[0],-this.centerw0[1],-this.centerw0[2])
    this.w0.setMatrix(m4.copy(mtx_w0))

    // wheel 2
    var mtx_w1 = m4.copy(this.chassis.getMatrix())
    mtx_w1 = m4.translate(mtx_w1, this.centerw1[0],this.centerw1[1],this.centerw1[2])
    mtx_w1 = m4.yRotate(mtx_w1, degToRad(this.mozzo));
    mtx_w1 = m4.translate(mtx_w1, -this.centerw1[0],-this.centerw1[1],-this.centerw1[2])
    this.w1.setMatrix(m4.copy(mtx_w1))

    // wheel 3
    var mtx_w2 = m4.copy(this.chassis.getMatrix())
    mtx_w2 = m4.translate(mtx_w2, this.centerw2[0],this.centerw2[1],this.centerw2[2])
    mtx_w2 = m4.yRotate(mtx_w2, degToRad(this.mozzo));
    mtx_w2 = m4.translate(mtx_w2, -this.centerw2[0],-this.centerw2[1],-this.centerw2[2])
    this.w2.setMatrix(m4.copy(mtx_w2))

    // wheel 4
    var mtx_w3 = m4.copy(this.chassis.getMatrix())
    mtx_w3 = m4.translate(mtx_w3, this.centerw3[0],this.centerw3[1],this.centerw3[2])
    mtx_w3 = m4.zRotate(mtx_w3, degToRad(this.sterzo*sterzo_multiplier));
    mtx_w3 = m4.yRotate(mtx_w3, degToRad(this.mozzo));
    mtx_w3 = m4.translate(mtx_w3, -this.centerw3[0],-this.centerw3[1],-this.centerw3[2])
    this.w3.setMatrix(m4.copy(mtx_w3))


    var box_mtx = m4.copy(this.chassis.getMatrix())
    box_mtx = m4.translate(box_mtx, 0, 0, 3.5)
    this.collisionBox.update(box_mtx)
  }

  setCollisionBox(){
    var box = new CollisionBox(this.width/2, this.length/2, this.height/2, this, 'box')
    this.collisionBox = box
    this.updatePosition()
  }

  hasCollisionBox(){
    return this.collisionBox !== undefined
  }

  onCollision(){

  }

  speedBoost(value, time){
    this.boost = value
    var self = this

    if (this.setBoost === false){
      setInterval(function(){
         self.boost = 1;
      }, time)
      setInterval(function(){
         self.setBoost = false
      }, 5000)
    }

    this.setBoost = true
  }

  draw(view_mtx, projection_matrix, mode){
    this.chassis.draw(view_mtx, projection_matrix, mode)
    this.w0.draw(view_mtx, projection_matrix, mode)
    this.w1.draw(view_mtx, projection_matrix, mode)
    this.w2.draw(view_mtx, projection_matrix, mode)
    this.w3.draw(view_mtx, projection_matrix, mode)

    this.collisionBox.draw(view_mtx, projection_matrix, mode)
  }
}
