//REQUEST ANIM FRAME FUNCTION
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
//END REQUEST ANIM FRAME FUNCTION


//MOUSE EVT
function getMousePos(canvas, evt) {
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while(obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
    }

    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
		x: mouseX,
		y: mouseY
    };
}
//END MOUSE EVT

//GLOBAL CANVAS VAR
var canvas = document.getElementById("myCanvas");
canvas.width = 500;
canvas.height = 300;
var ctx = canvas.getContext("2d");


//CONSTANTS
var cx = canvas.width/2;
var cy = canvas.height/2;
var G = 50;
var M = 100;
var MAXV = 50;
var mouseForceMultiplier = 10;
var move = false;
var MAX_V = 10;
var MIN_DIST = 2;
var RADIUS = 0;
var RADIUS_SUBP = 1;
var MAX_LIFE = 2000;
var NUM_PARTICLES = 1; //number of particles
var MAX_SUBP = 1000;
//END CONSTANTS

//MAIN PARTICLE
function Particle(obj) {
	for (var prop in obj) {
		this[prop] = obj[prop];
	}
}

Particle.prototype = {
	x:100,
	y:100,
	r:5,
	vx:0,
	vy:0,
	color:'red',
	alpha:0.65,
	maxp: MAX_SUBP,
	nump: 0,
	subp: []
}

Particle.prototype.draw = function() {
	for (var i = this.nump-1; i >= 0; --i)
		this.subp[i].draw();

	ctx.beginPath();
	ctx.globalAlpha = this.alpha;
	ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
	ctx.fillStyle = this.color;
	ctx.fill();
	ctx.globalAlpha = 1;
}

Particle.prototype.emit = function() {
	//check dead subparticles
	for (var i = this.nump-1; i >= 0; --i) {
		if (this.subp[i].life <= 0) {
			this.subp.splice(i,1);
			--this.nump;
		}
	}
	while (this.nump < this.maxp) {
		this.subp.push(new Subparticle(this));
		++this.nump;
	}
}

Particle.prototype.logic = function(dt) {
	this.x = mousePos.x;
	this.y = mousePos.y;

	for (var i = this.nump-1; i >= 0; --i)
		this.subp[i].logic(dt);

	this.emit();
}
//END MAIN PARTICLE

//SUB PARTICLES
function Subparticle(obj) {
	this.x = obj.x;
	this.y = obj.y;
	this.vy = (Math.random()-0.5)*MAX_V*2;
	this.vx = (Math.random()-0.5)*MAX_V*2;
	this.r = (RADIUS_SUBP ? RADIUS_SUBP : obj.r/10);
	this.life = Math.random()*MAX_LIFE;
	this.color = obj.color;
}

Subparticle.prototype.logic = function(dt) {
	this.x += this.vx*dt;
	this.y += this.vy*dt;
	this.life -= dt*1000;
	this.alpha = this.life/(MAX_LIFE*2);
}
Subparticle.prototype.draw = Particle.prototype.draw;
//END SUBPARTICLES

function clear() {
	ctx.fillStyle = 'black';
	ctx.globalAlpha = 0.05;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.globalAlpha = 1;
}

//INIT
var particles = [];
for (var i = NUM_PARTICLES; i > 0; --i) {
	particles.push(new Particle( {
		x: canvas.width/2 + (Math.random()-0.5)*canvas.width/8,
		y: canvas.height/2 + (Math.random()-0.5)*canvas.height/8,
		vy: (Math.random()-0.5)*MAX_V,
		vx: (Math.random()-0.5)*MAX_V,
		color: 'rgb(' 
			+ Math.floor(Math.random()*255) + ','
			+ Math.floor(Math.random()*255) + ','
			+ Math.floor(Math.random()*255) + ')',
		r: RADIUS
	}));
}

var oldDt = new Date().getTime();

function logic() {
	var now = new Date().getTime();
	dt = (now-oldDt)/1000;
	oldDt = now;
	for (var i = NUM_PARTICLES-1; i >= 0; --i)
		particles[i].logic(dt);

}

function render() {
	clear();
	for (var i = NUM_PARTICLES-1; i >= 0; --i)
		particles[i].draw();
}

//MOUSE EVENTS
var mousePos = {
    x: canvas.width/2,
    y: canvas.height/2
};

canvas.addEventListener('mousemove', function(evt) {
	var pos = getMousePos(canvas, evt);
	mousePos.x = pos.x;
	mousePos.y = pos.y;
});

canvas.addEventListener('mouseout', function(evt) {
	mousePos.x = 10000000;
	mousePos.y = 10000000;
});
//END MOUSE EVENTS


//MAIN LOOP
(function animloop(){
  requestAnimFrame(animloop);
  logic();
  render();
})();