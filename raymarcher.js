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
		this.origin = origin
		this.dir = dir.normalize()
	}

	stepBy(dist) {
		return new vec3(this.origin + this.dir.scale(dist))
	}
}

let c = document.getElementById("rmCanvas");
let ctx = c.getContext("2d");
const WINDOW_WIDTH = c.width;
const WINDOW_HEIGHT = c.height;

let imgData = ctx.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);
let pixelData = imgData.data;

function getPixelIndex(x, y) {
	return (x + y*WINDOW_WIDTH)*4;
}

for (let y = 0; y < WINDOW_HEIGHT; y++) {
	for (let x = 0; x < WINDOW_WIDTH; x++) {
		let i = getPixelIndex(x, y);
		pixelData[i] = 255*(x/(WINDOW_WIDTH-1));
		pixelData[i+1] = 255*(y/(WINDOW_HEIGHT-1));
		pixelData[i+2] = 0;
		pixelData[i+3] = 255;
	}
}

ctx.putImageData(imgData, 0, 0);

// alert("Vector test");
// let v1 = new vec3(1, 2, 3);
// let v2 = new vec3(0, -1, 5);

// alert(v1.length);
// alert(vec3.neg(v1));
// alert(vec3.add(v1, v2));
// alert(vec3.sub(v1, v2));
// alert(vec3.cross(v1, v2));
// alert(vec3.dot(v1, v2));