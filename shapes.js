/* eslint-disable no-unused-vars */
/* global Matrix createProgram */

class Shape {
// Base class for Cube and Tetra to contain common code
    constructor() {
    // create identity matrix here
        this.translatedMatrix = new Matrix([]);
        this.rotatedMatrix = new Matrix([]);
        this.scaledMatrix = new Matrix([]);
        this.world = new Matrix([]);
        this.newLoc = [0, 0, 0];
    }

    /**
     * Takes 3 numbers and moves the shape to that location.
     * @param {number} x - 'x' location
     * @param {number} y - 'y' location
     * @param {number} z - 'z' location
     */
    move(x, y, z) {
        let newMatrix = new Matrix([]);
        this.translatedMatrix = newMatrix.translate(x, y, z);
        this.newLoc = [x, y, z];
    }

    /**
     * @return returns an array of numbers with the current location (x, y, z)
     */
    getLocation() {
        return this.newLoc;
    }

    /**
     * @param {number} w - 'width'
     * @param {number} h - 'height'
     * @param {number} d - 'depth'
     */
    resize(w, h, d) {
        let resizedMatrix = new Matrix([]);
        this.scaledMatrix = resizedMatrix.scale(w, h, d);

        this.scaledArray = [w, h, d];
    }

    /**
     * @return an array of numbers with the current size(width, height, depth)
     */
    getSize() {
        return this.scaledArray;
    }

    /**
     * takes 3 numbers representing the angle of rotation (in degrees) in each of the dimensions
     * @param {number} tx - 'x' angle
     * @param {number} ty - 'y' angle
     * @param {number} tz - 'z' angle
     */
    orient(tx, ty, tz) {
        let matrixOriented = new Matrix([]);
        this.rotatedMatrix = matrixOriented.rotate(tx, ty, tz);

        this.rotateArray = -[tx, ty, tz];
    }

    /**
     * @return an array of numbers with the current rotation(x theta, y, theta, z theta)
     */
    getOrientation() {
        return this.rotateArray;
    }

    /**
     * @return Returns a Matrix with that places the shape into the world with the
        current location, size and orientation. By default, this should return a
        Matrix that places the shape centered at the origin and so that it fills a 1
        x 1 x 1 cube.
     */
    getModel() {
        this.model = this.translatedMatrix.mult(this.rotatedMatrix).mult(this.scaledMatrix).mult(this.world);
        return this.model;
    }
}

/**
 * vertex shader
 */
const cubeVertex = `
    attribute vec4 locationCube;
	attribute vec4 colorCube;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * view * model * locationCube;
       cColor = colorCube;
    }
`;

/**
 * fragment shader
 */
const cubeFragment = `
    precision lowp float;
    varying lowp vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

class Cube extends Shape {
    constructor() {
        super();
        // create a shape fills a 1 x 1 x 1 cube centered at the origin.
        // shaders
        this.wire = false;
        // vertices
        this.vertices = new Float32Array([
            0, 0, 0,
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
            1, 1, 0,
            1, 0, 1,
            0, 1, 1,
            1, 1, 1
        ]);

        // triangles
        this.triangles = new Uint8Array([
            0, 1, 3, 5, // bottom
            6, 7, // front
            2, 4, // top
            0, 1, // back
            1, 4, 5, 7, // right
            6, 2, 3, 0 // left
        ]);
        // colors
        this.colors = new Float32Array([
            0, 0, 0, 1, // black
            1, 0, 0, 1, // red
            0, 1, 0, 1, // grean
            0, 0, 1, 1, // blue
            1, 1, 0, 1, // yellow
            1, 0, 1, 1, // magenta
            0, 1, 1, 1, // cyan
            1, 1, 1, 1 // white
        ]);

        this.edges = new Uint8Array([
            0, 1,
            1, 4,
            4, 2,
            2, 0,
            3, 6,
            6, 7,
            7, 5,
            5, 3,
            0, 3,
            1, 5,
            2, 6,
            4, 7
        ]);

        // edge colors
        this.edgeColors = new Float32Array([
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1 // black
        ]);

        // move from model coordinates to world coordinates.
        // TODO The cube is defined to be 1 unit is size with one corner on the origin
        // TODO Move it so it is centered on the origin and scale it so it is half size.
        // TODO Assign the value to this.world.
        this.world = new Matrix([
            1, 0, 0, -0.5,
            0, 1, 0, -0.5,
            0, 0, 1, -0.5,
            0, 0, 0, 1
        ]);

        this.buffered = false;
    }

    render(gl, projection, view) {
        if (!this.buffered) {
            this.bufferData(gl);
        }

        // Create bindings between cube data and shaders
        // Bind bufferVertices to the locationCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        let loc = gl.getAttribLocation(this.program, "locationCube");

        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        // Bind colorsBuffer to the colorCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        let col = gl.getAttribLocation(this.program, "colorCube");

        gl.vertexAttribPointer(col, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(col);

        gl.useProgram(this.program);

        // Bind projection (get its data as an array) to the projection uniform
        let proj = gl.getUniformLocation(this.program, "projection");
        gl.uniformMatrix4fv(proj, false, projection.getData());

        // Bind this.model (get its data as an array) to the matView uniform
        let model = gl.getUniformLocation(this.program, "model");
        gl.uniformMatrix4fv(model, false, this.getModel().getData());

        let viewDiff = gl.getUniformLocation(this.program, "view");
        gl.uniformMatrix4fv(viewDiff, false, view.getData());

        if (!this.wire) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);
        }

        // Bind edgeColorsBuffer to the colorCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.vertexAttribPointer(col, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(col);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
    }

    /**
     * Creates the buffers for the program. Intended for internal use
     * @param {WebGLRenderingContext} gl WebGL context
     */
    bufferData(gl) {
        this.program = createProgram(gl, cubeVertex, cubeFragment);

        this.bufferVertices = gl.createBuffer();
        this.trianglesBuffer = gl.createBuffer();
        this.colorsBuffer = gl.createBuffer();
        this.edgesBuffer = gl.createBuffer();
        this.edgeColorsBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.edgeColors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);

        this.buffered = true;
    }
}


/**
 * vertex shader
 */
const tetraVertex = `
    attribute vec4 locationTetra;
	attribute vec4 colorTetra;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * view * model * locationTetra;
       cColor = colorTetra;
    }
`;

/**
 * fragment shader
 */
const tetraFragment = `
    precision lowp float;
    varying lowp vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

class Tetra extends Shape {
    constructor() {
        super();
        // shaders
        this.wire = false;
        // vertices
        this.vertices = new Float32Array([
            1, -1 / Math.sqrt(3), -1 / Math.sqrt(6),
            0, 2 / Math.sqrt(3), -1 / Math.sqrt(6),
            0, 0, 3 / Math.sqrt(6),
            -1, -1 / Math.sqrt(3), -1 / Math.sqrt(6)
        ]);

        // triangles
        this.triangles = new Uint8Array([
            0, 1, 2,
            1, 2, 3,
            2, 3, 0,
            3, 0, 1
            // 0, 1, 2
        ]);

        // colors
        this.colors = new Float32Array([
            1, 0, 0, 1, // red
            0, 1, 0, 1, // green
            0, 0, 1, 1, // blue
            1, 1, 0, 1 // yellow
        ]);

        this.edges = new Uint8Array([
            0, 1,
            0, 2,
            0, 3,
            1, 2,
            1, 3,
            2, 3
        ]);

        // edge colors
        this.edgeColors = new Float32Array([
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1, // black
            0, 0, 0, 1 // black
        ]);

        // Move from model to world coordinates
        // Cube is defined to be 1 unit is size with one corner on the origin
        // Move it so it is centered on the origin and scale it so it is half size
        // Assign value to this.world
        this.world = new Matrix([
            1, 0, 0, -0.5,
            0, 1, 0, -0.5,
            0, 0, 1, -0.5,
            0, 0, 0, 1
        ]);

        // Create identityTransY matrix for model
        this.model = new Matrix(); // Model matrix
        this.buffered = false;
    }

    render(gl, projection, world) {	// takes a gl context and 2 matrix values for the projection and the world
        // the shape on the screen using its current position, size and rotation
        if (!this.buffered) {
            this.bufferData(gl);
        }

        // Create bindings between cube data and shaders
        // Bind bufferVertices to the locationCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        let loc = gl.getAttribLocation(this.program, "locationTetra");

        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        // Bind colorsBuffer to the colorCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        let col = gl.getAttribLocation(this.program, "colorTetra");

        gl.vertexAttribPointer(col, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(col);

        gl.useProgram(this.program);

        // Bind projection (get its data as an array) to the projection uniform
        let proj = gl.getUniformLocation(this.program, "projection");
        gl.uniformMatrix4fv(proj, false, projection.getData());

        // Bind this.model (get its data as an array) to the matView uniform
        let model = gl.getUniformLocation(this.program, "model");
        gl.uniformMatrix4fv(model, false, this.getModel().getData());

        let viewDiff = gl.getUniformLocation(this.program, "view");
        gl.uniformMatrix4fv(viewDiff, false, world.getData());

        if (!this.wire) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);
        }

        // Bind edgeColorsBuffer to the colorCube attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.vertexAttribPointer(col, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(col);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
    }

    /**
     * Creates the buffers for the program. Intended for internal use
     * @param {WebGLRenderingContext} gl WebGL context
     */
    bufferData(gl) {
        this.program = createProgram(gl, tetraVertex, tetraFragment);

        this.bufferVertices = gl.createBuffer();
        this.trianglesBuffer = gl.createBuffer();
        this.colorsBuffer = gl.createBuffer();
        this.edgesBuffer = gl.createBuffer();
        this.edgeColorsBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.edgeColors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);

        this.buffered = true;
    }
}

/**
 * vertex shader
 */
const cylinderVertex = `
    attribute vec4 locCylinder;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    void main() {
       gl_Position = projection * view * model * locCylinder;
    }
`;

/**
 * fragment shader
 */
const cylinderFragment = `
    precision lowp float;

    void main() {
		gl_FragColor = vec4(0, 0.2, 1, 1);
	}
`;

class Cylinder extends Shape {
    // constructor takes amount of sides currently being processed
    constructor(sides) {
        super();

        this.wire = false;

        let radius = 0.5;

        // theta needs to be in radians
        // degree value relates to how many vertices the user specifies
        let theta = 2 * Math.PI / sides;

        this.vertices = [];

        // vertices loop for the top circle
        for (let i = 0; i < sides; i++) {
            let xT = radius * Math.cos(2 * Math.PI - theta * i);
            let zT = radius * Math.sin(2 * Math.PI - theta * i);
            let yT = 0.5;

            this.vertices.push(xT, yT, zT);
        }
        this.topLength = this.vertices.length;

        // vertices loop for bottom circle
        for (let i = 0; i < sides; i++) {
            let xB = radius * Math.cos(theta * i);
            let zB = radius * Math.sin(theta * i);
            let yB = 0.5;

            this.vertices.push(xB, -yB, zB);
        }
        this.botLength = this.vertices.length - this.topLength;

        // loop to connect vertices diagonally
        for (let i = 0; i <= sides + 1; i++) {
            // recalculate bottom vertices
            let x = radius * Math.cos(theta * i);
            let z = radius * Math.sin(theta * i);
            let y = 0.5;

            // push points to array to draw
            this.vertices.push(x, -y, z);
            this.vertices.push(x, y, z);
        }

        this.verticesNew = new Float32Array(this.vertices);
    }

    /**
     * @param {number} w - 'width'
     * @param {number} h - 'height'
     * @param {number} d - 'depth'
     */
    resize(w, h, d) {
        let resizedMatrix = new Matrix([]);
        this.scaledMatrix = resizedMatrix.scale(w, h, d);

        this.scaledArray = [w, h, d];
    }

    /**
     * @return an array of numbers with the current size(width, height, depth)
     */
    getSize() {
        return this.scaledArray;
    }

    render(gl, projection, view) {

        if (!this.buffered) {
            this.bufferData(gl);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        let loc = gl.getAttribLocation(this.program, "locCylinder");

        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        gl.useProgram(this.program);

        let proj = gl.getUniformLocation(this.program, "projection");
        gl.uniformMatrix4fv(proj, false, projection.getData());

        // Bind this.model (get its data as an array) to the matView uniform
        let model = gl.getUniformLocation(this.program, "model");
        gl.uniformMatrix4fv(model, false, this.getModel().getData());

        let viewDiff = gl.getUniformLocation(this.program, "view");
        gl.uniformMatrix4fv(viewDiff, false, view.getData());

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.topLength / 3);
        gl.drawArrays(gl.TRIANGLE_FAN, this.topLength / 3, this.botLength / 3);
        gl.drawArrays(gl.TRIANGLE_STRIP, (this.topLength + this.botLength) / 3, this.vertices.length / 6);
    }

    bufferData(gl) {
        this.program = createProgram(gl, cylinderVertex, cylinderFragment);

        this.verticesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.verticesNew, gl.STATIC_DRAW);

        this.buffered = true;
    }
}

/**
 * vertex shader
 */
const sphereVertex = `
    attribute vec4 locSphere;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    void main() {
       gl_Position = projection * view * model * locSphere;
    }
`;

/**
 * fragment shader
 */
const sphereFragment = `
    precision lowp float;

    void main() {
		gl_FragColor = vec4(1, 0.5, 0.3, 1);
	}
`;

class Sphere extends Shape {
    // constructor takes number of sides the sphere has
    constructor(sides) {
        super();

        this.wire = false;

        this.triangles = [
            // top front left
            0, -0.5, 0, // left
            0, 0, 0.5, // front
            0.5, 0, 0, // top

            // top front right
            0, 0, 0.5, // front
            0, 0.5, 0, // right
            0.5, 0, 0, // top

            // top back right
            0, 0.5, 0, // right
            0, 0, -0.5, // back
            0.5, 0, 0, // top

            // top back left
            0, -0.5, 0, // left
            0.5, 0, 0, // top
            0, 0, -0.5, // back

            // bottom front left
            0, -0.5, 0, // left
            -0.5, 0, 0, // bottom
            0, 0, 0.5, // front

            // bottom front right
            0, 0, 0.5, // front
            -0.5, 0, 0, // bottom
            0, 0.5, 0, // right

            // bottom back right
            -0.5, 0, 0, // bottom
            0, 0, -0.5, // back
            0, 0.5, 0, // right

            // bottom back left
            0, -0.5, 0, // right
            0, 0, -0.5, // back
            -0.5, 0, 0 // bottom
        ];

        this.triLength = this.triangles.length;
        this.trianglesMid = [];

        // pull out 1 triangle at a time, then find its midpoint and divide it into 4 different triangles
        // push those new triangles into a new array
        for (let i = 0; i < this.triLength; i += 9) {
            // divide each triangle into 4 triangles
            // finds a point between each vertice, then draw lines between them
            this.v1 = [this.triangles[i], this.triangles[i + 1], this.triangles[i + 2]];
            this.v2 = [this.triangles[i + 3], this.triangles[i + 4], this.triangles[i + 5]];
            this.v3 = [this.triangles[i + 6], this.triangles[i + 7], this.triangles[i + 8]];

            this.v1v2avg0 = this.v1[0] + this.v2[0] / 2;
            this.v1v2avg1 = this.v1[1] + this.v2[1] / 2;
            this.v1v2avg2 = this.v1[2] + this.v2[2] / 2;

            this.v1v3avg0 = this.v1[0] + this.v3[0] / 2;
            this.v1v3avg1 = this.v1[1] + this.v3[1] / 2;
            this.v1v3avg2 = this.v1[2] + this.v3[2] / 2;

            this.v2v3avg0 = this.v2[0] + this.v3[0] / 2;
            this.v2v3avg1 = this.v2[1] + this.v3[1] / 2;
            this.v2v3avg2 = this.v2[2] + this.v3[2] / 2;

            // need to push each new triangle into the old triangle
            // push all points into a new array
            this.trianglesMid.push(this.v1[0], this.v1[1], this.v1[2]);
            this.trianglesMid.push(this.v1v2avg0, this.v1v2avg1, this.v1v2avg2);
            this.trianglesMid.push(this.v1v3avg0, this.v1v3avg1, this.v1v3avg2);

            this.trianglesMid.push(this.v2[0], this.v2[1], this.v2[2]);
            this.trianglesMid.push(this.v2v3avg0, this.v2v3avg1, this.v2v3avg2);
            this.trianglesMid.push(this.v1v2avg0, this.v1v2avg1, this.v1v2avg2);

            this.trianglesMid.push(this.v3[0], this.v3[1], this.v3[2]);
            this.trianglesMid.push(this.v1v3avg0, this.v1v3avg1, this.v1v3avg2);
            this.trianglesMid.push(this.v2v3avg0, this.v2v3avg1, this.v2v3avg2);
        }

        this.trianglesNew = new Float32Array(this.triangles);
    }

    /**
     * @param {number} w - 'width'
     * @param {number} h - 'height'
     * @param {number} d - 'depth'
     */
    resize(w, h, d) {
        let resizedMatrix = new Matrix([]);
        this.scaledMatrix = resizedMatrix.scale(w, h, d);

        this.scaledArray = [w, h, d];
    }

    /**
     * @return an array of numbers with the current size(width, height, depth)
     */
    getSize() {
        return this.scaledArray;
    }

    render(gl, projection, view) {

        this.bufferData(gl);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
        let loc = gl.getAttribLocation(this.program, "locSphere");

        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        gl.useProgram(this.program);

        let proj = gl.getUniformLocation(this.program, "projection");
        gl.uniformMatrix4fv(proj, false, projection.getData());

        // Bind this.model (get its data as an array) to the matView uniform
        let model = gl.getUniformLocation(this.program, "model");
        gl.uniformMatrix4fv(model, false, this.getModel().getData());

        let viewDiff = gl.getUniformLocation(this.program, "view");
        gl.uniformMatrix4fv(viewDiff, false, view.getData());

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.triLength / 3);
    }

    bufferData(gl) {
        this.program = createProgram(gl, sphereVertex, sphereFragment);

        this.trianglesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.trianglesNew, gl.STATIC_DRAW);

        this.buffered = true;
    }
}

module.exports = {
    Tetra: Tetra,
    Cube: Cube,
    Cylinder: Cylinder,
    Sphere: Sphere
};
