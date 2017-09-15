class vec3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	get length() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}

	toString() {
		return `< ${this.x}, ${this.y}, ${this.z} >`
	}

	static neg(v) {
		return new vec3(-v.x, -v.y, -v.z);
	}


	static add(v1, v2) {
		return new vec3(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
	}


	static sub(v1, v2) {
		return vec3.add(v1, vec3.neg(v2));
	}

	static cross(v1, v2) {
		return new vec3(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x - v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
	}

	static dot(v1, v2) {
		return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
	}
}

alert("Vector test");
let v1 = new vec3(1, 2, 3);
let v2 = new vec3(0, -1, 5);

alert(v1.length);
alert(vec3.neg(v1));
alert(vec3.add(v1, v2));
alert(vec3.sub(v1, v2));
alert(vec3.cross(v1, v2));
alert(vec3.dot(v1, v2));