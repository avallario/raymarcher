class vec3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	get length() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}

	scale(r) {
		return new vec3(this.x*r, this.y*r, this.z*r);
	}

	normalize() {
		let r = this.length;
		return new vec3(this.x/r, this.y/r, this.z/r);
	}

	toString() {
		return `< ${this.x}, ${this.y}, ${this.z} >`
	}


	neg() {
		return new vec3(-this.x, -this.y, -this.z);
	}

	static add(v1, v2) {
		return new vec3(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
	}

	static sub(v1, v2) {
		return vec3.add(v1, v2.neg());
	}

	static cross(v1, v2) {
		return new vec3(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x - v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
	}

	static dot(v1, v2) {
		return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
	}
}

class ray {
	constructor(origin, dir) {
		this.origin = origin;
		this.dir = dir.normalize();
	}

	stepBy(dist) {
		return vec3.add(this.origin, this.dir.scale(dist));
	}
}

let c = document.getElementById("rmCanvas");
let ctx = c.getContext("2d");
const WINDOW_WIDTH = c.width;
const WINDOW_HEIGHT = c.height;

let imgData = ctx.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);
let pixelData = imgData.data;

const MAX_DEPTH = 1000;
const MAX_STEPS = 100;
const EPSILON = 0.0000001;

//Test data
let sphere_center = new vec3(255, 255, 150);
let sphere_radius = 128;
let camera_center = new vec3(0, 0, -1);

function getPixelIndex(x, y) {
	return (x + y*WINDOW_WIDTH)*4;
}

function sdf(point) {
	return vec3.sub(sphere_center, point).length - sphere_radius;
}

for (let y = 0; y < WINDOW_HEIGHT; y++) {
	for (let x = 0; x < WINDOW_WIDTH; x++) {
		let i = getPixelIndex(x, y);
		pixelData[i] = 0;
		pixelData[i+1] = 0;
		pixelData[i+2] = 0;
		pixelData[i+3] = 255;

		let march_depth = 0;
		let steps = 0;
		let view_ray = new ray(camera_center, vec3.sub(new vec3(x, y, 0), camera_center));

		while (march_depth < MAX_DEPTH && steps < MAX_STEPS) {
			let f = sdf(view_ray.stepBy(march_depth));
			
			march_depth += f;
			steps++;

			if (f < EPSILON) {
				pixelData[i] = 255-(march_depth/300)*245;
				break;
			}
		}
	}
}

ctx.putImageData(imgData, 0, 0);