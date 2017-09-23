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

class material {
	constructor(ambient, diffuse, specular, specpow) {
		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
		this.specpow = specpow;
	}
}

class sphere {
	constructor(origin, radius, material) {
		this.origin = origin;
		this.init_origin = new vec3(origin.x, origin.y, origin.z);
		this.radius = radius;
		this.material = material;
	}

	sdf(point) {
		return vec3.sub(this.origin, point).length - this.radius;
	}
}

class sdf_record {
	constructor(distance, material) {
		this.distance = distance;
		this.material = material;
	}
}

class intersection_record {
	constructor(intersection_point, material) {
		this.intersection_point = intersection_point;
		this.material = material;
	}
}

let c = document.getElementById("rmCanvas");
let ctx = c.getContext("2d");
const WINDOW_WIDTH = c.width;
const WINDOW_HEIGHT = c.height;

let imgData = ctx.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);
let pixelData = imgData.data;

const MAX_DEPTH = 1000;
const MAX_STEPS = 5000;
const EPSILON = 0.000001;
const GAMMA = 2.2
const GAMMA_CORRECT = false;

let camera_center = new vec3(0, 0, -5);

//Scene data
let light_center = new vec3(-3, -3, 17)
let light_color = [1, 1, 1]

let sphere1_mat = new material([0.025, 0.04, 0.075], [0.1, 0.3, 0.5], [0.3, 0.3, 0.3], 16);
let sphere1 = new sphere(new vec3(1, 0, 25), 0.3, sphere1_mat);

let sphere2_mat = new material([0.075, 0, 0], [0.5, 0, 0], [0.3, 0.3, 0.3], 16);
let sphere2 = new sphere(new vec3(0, 0, 25), 0.9, sphere2_mat);

let sphere3_mat = new material ([0, 0.075, 0], [0, 0.5, 0], [0.3, 0.3, 0.3], 16);
let sphere3 = new sphere(new vec3(-1, 1, 25), 0.15, sphere3_mat);

let scene_objects = [sphere1, sphere2, sphere3];

//Timing data
let start_time = Date.now();
let elapsed_time = 0;

function getPixelIndex(x, y) {
	return (x + y*WINDOW_WIDTH)*4;
}

function sdf_union(point, scene_objs) {
	let f = MAX_DEPTH;
	let mat = null;
	for (let obj of scene_objs) {
		let obj_dist = obj.sdf(point);
		if (obj_dist < f) {
			mat = obj.material;
			f = obj_dist;
		}
	}
	return new sdf_record(f, mat);
}

function sdf(point) {
	return sdf_union(point, scene_objects);
}

function marchRay(r) {
	let march_depth = 0;
	let steps = 0;

	while (march_depth < MAX_DEPTH && steps < MAX_STEPS) {
		let int_pt = r.stepBy(march_depth);
		let step_record = sdf(int_pt);
		
		march_depth += step_record.distance;
		steps++;

		if (step_record.distance < EPSILON) {
			return new intersection_record(int_pt, step_record.material);
		}
	}

	return null;
}

function update() {
	elapsed_time = Date.now() - start_time;
	let sphere_offset_angle = 2*Math.PI*(elapsed_time/10000);
//	sphere1.origin = new vec3(sphere1.init_origin.x + Math.cos(sphere_offset_angle), sphere1.init_origin.y + Math.sin(sphere_offset_angle), sphere1.init_origin.z + Math.sin(sphere_offset_angle*2)*5);
	sphere2.origin = new vec3(sphere2.init_origin.x, sphere2.init_origin.y + Math.sin(sphere_offset_angle/3)*0.2, sphere2.init_origin.z);
	sphere1.origin = new vec3(sphere2.origin.x + Math.sin(sphere_offset_angle*1.2-Math.PI/2)*2, sphere2.origin.y + Math.cos(sphere_offset_angle)*2, sphere2.origin.z + Math.sin(sphere_offset_angle)*2);
	sphere3.origin = new vec3(sphere1.origin.x + Math.sin(sphere_offset_angle*3+Math.PI/2)*0.5, sphere1.origin.y + Math.cos(sphere_offset_angle*3.2)*0.5, sphere1.origin.z + Math.sin(sphere_offset_angle*3)*0.5);

	for (let y = 0; y < WINDOW_HEIGHT; y++) {
		for (let x = 0; x < WINDOW_WIDTH; x++) {
			let i = getPixelIndex(x, y);
			pixelData[i] = 0;
			pixelData[i+1] = 0;
			pixelData[i+2] = 0;
			pixelData[i+3] = 255;

			let view_ray = new ray(camera_center, vec3.sub(new vec3(x/WINDOW_WIDTH-0.5, y/WINDOW_HEIGHT-0.5, 0), camera_center));
			let int_record = marchRay(view_ray)

			if (int_record !== null) {
				let int_pt = int_record.intersection_point;
				let mat = int_record.material;

				let grad_x = sdf(new vec3(int_pt.x + EPSILON, int_pt.y, int_pt.z)).distance - sdf(new vec3(int_pt.x - EPSILON, int_pt.y, int_pt.z)).distance;
				let grad_y = sdf(new vec3(int_pt.x, int_pt.y + EPSILON, int_pt.z)).distance - sdf(new vec3(int_pt.x, int_pt.y - EPSILON, int_pt.z)).distance;
				let grad_z = sdf(new vec3(int_pt.x, int_pt.y, int_pt.z + EPSILON)).distance - sdf(new vec3(int_pt.x, int_pt.y, int_pt.z - EPSILON)).distance;
				let gradient = new vec3(grad_x, grad_y, grad_z);
				let normal = gradient.normalize();
				let normal_ray = new ray(int_pt, normal);

				let to_light = vec3.sub(light_center, int_pt);
				let dist_to_light = to_light.length;
				to_light = to_light.normalize();
				let ray_to_light = new ray(normal_ray.stepBy(EPSILON*2), to_light);
				let to_light_int_record = marchRay(ray_to_light);

				if (to_light_int_record !== null) {
					let to_light_int = to_light_int_record.intersection_point;
					let dist_to_light_int = vec3.sub(to_light_int, int_pt).length;
					if (dist_to_light_int < dist_to_light) {
						pixelData[i] = mat.ambient[0]*light_color[0]*255;
						pixelData[i+1] = mat.ambient[1]*light_color[1]*255;
						pixelData[i+2] = mat.ambient[2]*light_color[2]*255;
						continue;
					}
				}
				
				let view = view_ray.dir.neg().normalize();
				let bisector = vec3.add(view, to_light).normalize();

				let r = mat.ambient[0]*light_color[0];
				let g = mat.ambient[1]*light_color[1];
				let b = mat.ambient[2]*light_color[2];

				let diffuse_factor = Math.max(0, vec3.dot(normal, to_light));
				r += mat.diffuse[0]*light_color[0]*diffuse_factor;
				g += mat.diffuse[1]*light_color[1]*diffuse_factor;
				b += mat.diffuse[2]*light_color[2]*diffuse_factor;

				let spec_factor = Math.pow(Math.max(0, vec3.dot(normal, bisector)), mat.specpow);
				r += mat.specular[0]*light_color[0]*spec_factor;
				g += mat.specular[1]*light_color[1]*spec_factor;
				b += mat.specular[2]*light_color[2]*spec_factor;

				if (r > 1) r = 1;
				if (g > 1) g = 1;
				if (b > 1) b = 1;

				if (GAMMA_CORRECT) {
					r = Math.pow(r, 1/GAMMA);
					g = Math.pow(g, 1/GAMMA);
					b = Math.pow(b, 1/GAMMA);
				}

				pixelData[i] = r*255;
				pixelData[i+1] = g*255;
				pixelData[i+2] = b*255;
			}
		}
	}


	ctx.putImageData(imgData, 0, 0);
}

window.setInterval(update, 10);