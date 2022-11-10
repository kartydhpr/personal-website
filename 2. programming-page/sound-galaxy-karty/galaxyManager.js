const binCount = 1024
let particles = new Array(binCount)

function positionParticles() {
  // takes array of particles
  // puts the 'tickle' in par-tickle
  for (let i = 0; i < particles.length; i++) {
    let x = map(i, 0, binCount, 0, width * 2) // expands the particles to fit your screen using p5.map
    let y = random(0, height)
    let position = createVector(x, y)
    let partickle = new Particle(position)
    particles[i] = partickle
  }
}

function updateParticles(spectrum) {
  // update and draw all [binCount] particles!
  // Each particle gets a level that corresponds to
  // the level at one bin of the FFT spectrum. 
  // This level is like amplitude, often called "energy."
  // It will be a number between 0-255.
  spectrum.forEach((bin, i) => {
    let binLevel = map(bin, 0, 255, 0, 1)
    particles[i].update(binLevel)
    particles[i].draw()
  })
}

// Only for drawing static particles in one section of the workshop
function drawParticles() {
  particles.forEach(particle => {
    particle.diameter = 5
    particle.draw()
  })
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume()
  }
}