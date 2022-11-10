let fft // p5 feuroye algorithm

let Particle = function(position) {
  this.position = position
  this.speed = createVector(random(-1,1),1)
  // this.color = [random(255), random(165), random(0)]
  this.color = [28, random(0,255), 131]

  this.draw = function() {
    square(this.position.x, this.position.y, this.diameter)
    fill(this.color)
  }

  this.update = function(energy) {
    this.diameter = random(5,7) + energy * 100
    this.position.y += this.speed.y * energy * 10
    this.position.x += this.speed.x * energy * 10
    if (this.position.x >= width || position.x <= 0)
    {
      this.speed.x = -1 * this.speed.x
    }
    
    if (this.position.y > height) {
      this.position.y = 0
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  noStroke()

  let mic = new p5.AudioIn()
  mic.start()

  fft = new p5.FFT()
  fft.setInput(mic)

  positionParticles()
}

function draw() {
  background(0,0,0)
  let spectrum = fft.analyze()
  updateParticles(spectrum)
}