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

	// static cross(v1, v2) {
	// 	return new vec3(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x - v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
	// }

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
const EPSILON = 0.000001;

//Test data
let sphere_center_start = new vec3(0, 0, 25);
let sphere_center = new vec3(sphere_center_start.x, sphere_center_start.y, sphere_center_start.z);
let sphere_radius = 0.9;

let sphere2_center_start = new vec3(0, 0, 25);
let sphere2_center = new vec3(sphere_center_start.x, sphere_center_start.y, sphere_center_start.z);
let sphere2_radius = 0.9;

let sphere_ambient = [0.075, 0, 0];
let sphere_diffuse = [0.5, 0, 0];
let sphere_specular = [0.3, 0.3, 0.3];
let sphere_specpow = 16;

let light_center = new vec3(-3, -3, 17)
let light_color = [1, 1, 1]

let camera_center = new vec3(0, 0, -5);

//Timing data
let start_time = Date.now();
let elapsed_time = 0;

function getPixelIndex(x, y) {
	return (x + y*WINDOW_WIDTH)*4;
}

function sdf(point) {
	return Math.min(vec3.sub(sphere_center, point).length - sphere_radius, vec3.sub(sphere2_center, point).length - sphere2_radius);
}

function update() {
	elapsed_time = Date.now() - start_time;
	let sphere_offset_angle = 2*Math.PI*(elapsed_time/10000);
	sphere_center = new vec3(sphere_center_start.x + Math.cos(sphere_offset_angle), sphere_center_start.y + Math.sin(sphere_offset_angle), sphere_center_start.z + Math.sin(sphere_offset_angle*2)*5);
	sphere2_center = new vec3(sphere2_center_start.x + Math.cos(sphere_offset_angle+Math.PI), sphere2_center_start.y + Math.sin(sphere_offset_angle+Math.PI), sphere2_center_start.z + Math.sin(sphere_offset_angle*2+Math.PI)*5);


	for (let y = 0; y < WINDOW_HEIGHT; y++) {
		for (let x = 0; x < WINDOW_WIDTH; x++) {
			let i = getPixelIndex(x, y);
			pixelData[i] = 0;
			pixelData[i+1] = 0;
			pixelData[i+2] = 0;
			pixelData[i+3] = 255;

			let march_depth = 0;
			let steps = 0;
			let view_ray = new ray(camera_center, vec3.sub(new vec3(x/WINDOW_WIDTH-0.5, y/WINDOW_HEIGHT-0.5, 0), camera_center));

			while (march_depth < MAX_DEPTH && steps < MAX_STEPS) {
				let int_pt = view_ray.stepBy(march_depth);
				let f = sdf(int_pt);
				
				march_depth += f;
				steps++;

				if (f < EPSILON) {
					let grad_x = sdf(new vec3(int_pt.x + EPSILON, int_pt.y, int_pt.z)) - sdf(new vec3(int_pt.x - EPSILON, int_pt.y, int_pt.z));
					let grad_y = sdf(new vec3(int_pt.x, int_pt.y + EPSILON, int_pt.z)) - sdf(new vec3(int_pt.x, int_pt.y - EPSILON, int_pt.z));
					let grad_z = sdf(new vec3(int_pt.x, int_pt.y, int_pt.z + EPSILON)) - sdf(new vec3(int_pt.x, int_pt.y, int_pt.z - EPSILON));
					let gradient = new vec3(grad_x, grad_y, grad_z);
					let normal = gradient.normalize();
					let to_light = vec3.sub(light_center, int_pt).normalize();
					let view = view_ray.dir.neg().normalize();
					let bisector = vec3.add(view, to_light).normalize();

					let r = sphere_ambient[0] * light_color[0];
					let g = sphere_ambient[1] * light_color[1];
					let b = sphere_ambient[2] * light_color[2];

					let diffuse_factor = Math.max(0, vec3.dot(normal, to_light));
					r += sphere_diffuse[0]*light_color[0]*diffuse_factor;
					g += sphere_diffuse[1]*light_color[1]*diffuse_factor;
					b += sphere_diffuse[2]*light_color[2]*diffuse_factor;

					let spec_factor = Math.max(0, vec3.dot(normal, bisector))**sphere_specpow;
					r += sphere_specular[0]*light_color[0]*spec_factor;
					g += sphere_specular[1]*light_color[1]*spec_factor;
					b += sphere_specular[2]*light_color[2]*spec_factor;

					pixelData[i] = r*255;
					pixelData[i+1] = g*255;
					pixelData[i+2] = b*255;
					break;
				}
			}
		}
	}

	ctx.putImageData(imgData, 0, 0);
}

window.setInterval(update, 10);