/* eslint-disable no-unused-vars */
/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "(Matrix)|(Vector)|(Camera)"}] */

/**
 * Represents a 4x4 matrix suitable for performing transformations
 * on a vector of homogeneous coordinates.
 */
class Matrix {
    /**
     * Creates a 4x4 matrix. If no parameter is given, the identity
     * matrix is created. If values is provided it should be an array
     * and it will provide UP TO 16 values for the matrix. If there are
     * less than 16 values, the remaining values in the array should
     * correspond to the identify matrix. If there are more than 16,
     * the rest should be ignored.
     *
     * The data is assumed to be in COLUMN MAJOR order.
     *
     * IMPORTANT NOTE: The values array will be in ROW MAJOR order
     * because that makes the most sense for people when they are
     * entering data. This array will need to be transposed so that
     * it is in COLUMN MAJOR order.
     *
     * As an example, when creating a Matrix object, the user may do
     * something like:
     *      m = new Matrix([1, 2, 3, 4,
     *                      5, 6, 7, 8,
     *                      9, 10, 11, 12,
     *                      13, 14, 15, 16]);
     *
     * This gives the constructor an array with values:
     *      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
     * (since it is in ROW MAJOR order).
     *
     * The data in the array needs to be reordered so that it is,
     * logically, in COLUMN MAJOR order. The resulting array should
     * be:
     *      [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        // identity matrix
        this.idMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        // main metrix - idMatrix is default
        this.matrix = this.idMatrix.slice(0);

        // Validation check to see if values actually have a value
        if (typeof values !== "undefined") {
            // Create matrix based off of given values
            let newMatrix = values;

            if (newMatrix.length < 16) {
                let tempMat = this.idMatrix.slice(0);
                for (let i = 0; i < newMatrix.length; i++) {
                    tempMat.shift();
                }
                newMatrix = newMatrix.concat(tempMat);
            }

            // Transpose the matrix to make it column major order
            for (let c = 0; c < 4; c++) {
                for (let r = 0; r < 4; r++) {
                    let p = r * 4 + c;
                    this.setValue(r, c, newMatrix[p]);
                }
            }
        }
    }

    /**
     * Returns a Float32Array array with the data from the matrix. The
     * data should be in COLUMN MAJOR form.
     *
     * @return {Float32Array} Array with the matrix data.
     */
    getData() {
        return new Float32Array(this.matrix);
    }

    /**
     * Gets a value from the matrix at position (r, c).
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     * @return {number} Value in the array at (r, c)
     */
    getValue(r, c) {
        // column major order search to get a value at a specific spot
        return this.matrix[c * 4 + r];
    }

    /**
     * Updates a single position (r, c) in the matrix with value.
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     * @param {number} value Value to place in the matrix.
     */
    setValue(r, c, value) {
        // column major order search to update the matrix with a value at a specific spot
        this.matrix[c * 4 + r] = value;
    }

    /**
     * Returns a new Matrix that has the identity matrix.
     * This operation should not change the current matrix.
     *
     * @return {Matrix} Identity matrix
     */
    identity() {
        let newMatrix = new Matrix(this.idMatrix);
        return newMatrix;
    }

    /**
     * Multiplies the current matrix by the parameter matrix and returns the result.
     * This operation should not change the current matrix or the parameter.
     *
     * @param {Matrix} matB Matrix to post-multiply the current matrix by.
     *
     * @return {Matrix} Product of the current matrix and the parameter.
     */
    mult(matB) {
        let matrixValues = []; // new matrix

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let n = 0;

                for (let i = 0; i < 4; i++) {
                    n += this.getValue(r, i) * matB.getValue(i, c);
                }
                matrixValues.push(n);
            }
        }

        return new Matrix(matrixValues);
    }

    /**
     * Creates a new Matrix that is the current matrix translated by
     * the parameters.
     *
     * This should not change the current matrix.
     *
     * @param {number} x Amount to translate in the x direction.
     * @param {number} y Amount to translate in the y direction.
     * @param {number} z Amount to translate in the z direction.
     *
     * @return {Matrix} Result of translating the current matrix.
     */
    translate(x, y, z) {
        let matrix = new Matrix([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ]);

        return this.mult(matrix);
    }

    /**
     * Rotatation around the x-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the x-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateX(theta, x = 0, y = 0, z = 0) {
        let cos = Math.cos(theta * (Math.PI / 180));
        let sin = Math.sin(theta * (Math.PI / 180));

        let matrix = new Matrix([
            1, 0, 0, 0,
            0, cos, -sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1
        ]);

        return this.mult(matrix);
    }

    /**
     * Rotatation around the y-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the y-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateY(theta, x = 0, y = 0, z = 0) {
        let cos = Math.cos(theta * (Math.PI / 180));
        let sin = Math.sin(theta * (Math.PI / 180));

        let matrix = new Matrix([
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1
        ]);

        return this.mult(matrix);
    }

    /**
     * Rotatation around the z-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateZ(theta, x = 0, y = 0, z = 0) {
        let cos = Math.cos(theta * (Math.PI / 180));
        let sin = Math.sin(theta * (Math.PI / 180));

        let matrix = new Matrix([
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        return this.mult(matrix);
    }

    /**
     * Rotatation around the z-axis followed by a rotation around the y-axis and then
     * the z-axis. If provided, the rotation is done around the point (x, y, z).
     * By default, that point is the origin.
     *
     * The rotation must be done in order z-axis, y-axis, x-axis.
     *
     * This should not change the current matrix.
     *
     * @param {number} thetax Amount in DEGREES to rotate around the x-axis.
     * @param {number} thetay Amount in DEGREES to rotate around the y-axis.
     * @param {number} thetaz Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotate(thetax, thetay, thetaz, x = 0, y = 0, z = 0) {
        return this.rotateX(thetax, x, y, z).rotateY(thetay, x, y, z).rotateZ(thetaz, x, y, z);
    }

    /**
     * Scaling relative to a point. If provided, the scaling is done relative to
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} sx Amount to scale in the x direction.
     * @param {number} sy Amount to scale in the y direction.
     * @param {number} sz Amount to scale in the z direction.
     * @param {number} x x coordinate of the point around which to scale. Defaults to 0.
     * @param {number} y y coordinate of the point around which to scale. Defaults to 0.
     * @param {number} z z coordinate of the point around which to scale. Defaults to 0.
     *
     * @return {Matrix} Result of scaling the current matrix.
     */
    scale(sx, sy, sz, x = 0, y = 0, z = 0) {
        let matrix = [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ];
        let newMatrix = new Matrix(matrix);
        return this.mult(newMatrix);
    }

    /**
     * Prints the matrix as an HTML table.
     *
     * @return {string} HTML table with the contents of the matrix.
     */
    asHTML() {
        let output = "<table>";

        for (let r = 0; r < 4; r++) {
            output += "<tr>";

            for (let c = 0; c < 4; c++) {
                output += "<td>" + this.getValue(r, c).toFixed(2) + "</td>";
            }

            output += "</tr>";
        }

        output += "</table>";

        return output; // TODO
    }
}


/**
 * Represents a vector in 3d space.
 */
class Vector {
    /**
     * Creates a vector. If no parameter is given, the vector is set to
     * all 0's. If values is provided it should be an array
     * and it will provide UP TO 3 values for the vector. If there are
     * less than 3 values, the remaining values in the array should
     * set to 0. If there are more than 3, the rest should be ignored.
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        this.vector = new Float32Array([0, 0, 0, 0]);

        // Validation check to see if values actually have a value
        if (typeof values !== "undefined") {
            for (let i = 0; i < values.length && i < 3; i++) {
                this.vector[i] = values[i];
            }
        }
    }

    /**
     * Calculates the cross product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to cross with the current vector.
     *
     * @return {Vector} The cross product of the current vector and the parameter.
     */
    crossProduct(v) {
        // a is vector of 3 values
        let vecA = this.vector;
        // vector sent into function
        let vecB = v.getData();

        // cross product calcuation / multiplication
        let crossVec = new Vector([
            vecA[1] * vecB[2] - vecA[2] * vecB[1],
            vecA[2] * vecB[0] - vecA[0] * vecB[2],
            vecA[0] * vecB[1] - vecA[1] * vecB[0]
        ]);

        return crossVec;
    }

    /**
     * Calculates the dot product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to dot with the current vector.
     *
     * @return {number} The dot product of the current vector and the parameter.
     */
    dotProduct(v) {
        // a is vector of 3 values
        let vecA = this.vector;
        // vector sent into function
        let vecB = v.getData();
        // dot Product initialized to zero
        let dotProd = 0;

        // add the product of both vectors at position x, y, z to the dotProduct (for final result calculation)
        for (let x = 0; x < 3; x++) {
            dotProd += vecA[x] * vecB[x];
        }

        return dotProd;
    }

    /**
     * Adds two Vectors (the current Vector and the parameter)
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to add with the current vector.
     *
     * @return {Vector} The sum of the current vector and the parameter.
     */
    add(v) {
        // a is vector of 3 values
        let vecA = this.vector;
        // vector sent into function
        let vecB = v.getData();
        // dot Product initialized to zero
        let vecSum = new Vector([]);

        for (let x = 0; x < 3; x++) {
            vecSum.vector[x] = vecA[x] + vecB[x];
        }

        return vecSum;
    }

    /**
     * Subtracts two Vectors (the current Vector and the parameter)
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to subtract from the current vector.
     *
     * @return {Vector} The difference of the current vector and the parameter.
     */
    subtract(v) {
        // a is vector of 3 values
        let vecA = this.vector;
        // vector sent into function
        let vecB = v.getData();
        // dot Product initialized to zero
        let vecSum = new Vector([]);

        for (let x = 0; x < 3; x++) {
            vecSum.vector[x] = vecA[x] - vecB[x];
        }

        return vecSum;
    }

    /**
     * Normalizes the current vector so that is has a
     * length of 1. The result is returned as a new
     * Matrix.
     *
     * This should not change the current vector.
     *
     * @return {Vector} A normalized vector with the same
     * direction as the current vector.
     */
    normalize() {
        // get magnitude from length function
        let magnitude = this.length();

        if (magnitude !== 0) {
            // divide vector by magnitude
            return this.scale(1 / magnitude);
        } else {
            return new Vector([]);
        }
    }

    /**
     * Gets the length (magnitude) of the current vector.
     *
     * @return {number} The length of the current vector.
     */
    length() {
        let magnitude = Math.sqrt(Math.pow(this.vector[0], 2) + Math.pow(this.vector[1], 2) + Math.pow(this.vector[2], 2));

        return magnitude;
    }

    /**
     * Scales the current vector by amount s and returns a
     * new Vector that is the result.
     *
     * This should not change the current vector.
     *
     * @param {number} s Amount to scale the vector.
     *
     * @returns {Vector} A new vector that is the result
     * of the current vector scaled by the parameter.
     */
    scale(s) {
        let newVector = new Vector([]);

        // multiplies each member of the vector by a scaler
        for (let x = 0; x < this.vector.length; x++) {
            newVector.vector[x] = this.vector[x] * s;
        }

        return newVector;
    }

    /**
     * Returns the x value of the vector.
     *
     * @return {number} The x value of the vector.
     */
    getX() {
        return this.vector[0];
    }

    /**
     * Returns the y value of the vector.
     *
     * @return {number} The y value of the vector.
     */
    getY() {
        return this.vector[1];
    }

    /**
     * Returns the z value of the vector.
     *
     * @return {number} The z value of the vector.
     */
    getZ() {
        return this.vector[2];
    }

    /**
     * Returns a Float32Array with the contents of the vector. The
     * data in the vector should be in the order [x, y, z, w]. This
     * makes it suitable for multiplying by a 4x4 matrix.
     *
     * The w value should always be 0.
     *
     * @return {Float32Array} The vector as a 4 element array.
     */
    getData() {
        let returnVec = this.vector.slice(0);
        return new Float32Array(returnVec);
    }
}

// // add Documentation for Camera
class Camera {


    constructor() {
        //  projection and camera Matrix variables should initially be the identity matrix.

        this.projection = new Matrix([]);
        this.camera = new Matrix([]);
    }

    /**
     * @return the current camera view matrix
     */
    getView() {
        return this.camera;
    }

    /**
     * @return the current camera projection matrix
     */
    getProjection() {
        return this.projection;
    }

    /**
     * Create a perspective matrix using this information and store it in your class variable. Use
     * your resources to determine what the matrix should be
     * @param {number} left
     * @param {number} right
     * @param {number} bottom
     * @param {number} top
     * @param {number} near
     * @param {number} far
     */
    ortho(left, right, bottom, top, near, far) {
        this.projection = new Matrix([
            2 / (right - left), 0, 0, -((left + right) / (right - left)),
            0, 2 / (top - bottom), 0, -((top + bottom) / (top - bottom)),
            0, 0, -(2 / (far - near)), -((far + near) / (far - near)),
            0, 0, 0, 1
        ]);

        // return the Matrix
        return this.projection;
    }

    /**
     * Create a perspective matrix using this information and store it in your class variable. Use
     * your resources to determine what the matrix should be
     * @param {number} left
     * @param {number} right
     * @param {number} bottom
     * @param {number} top
     * @param {number} near
     * @param {number} far
     */
    frustum(left, right, bottom, top, near, far) {
        this.projection = new Matrix([
            2 * near / (right - left), 0, (right + left) / (right - left), 0,
            0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0,
            0, 0, -((far + near) / (far - near)), -2 * far * near / (far - near),
            0, 0, -1, 0
        ]);


        // return the matrix
        return this.projection;
    }

    /**
     * Calculate the view matrix from this information and store it in your class variable.
     * @return the camera view matrix.
     * @param {Vector} eyeLocation
     * @param {Vector} location
     * @param {Vector} upVec
     */
    lookAt(eyeLocation, location, upVec) {
        // subtracting the at vector from the eye vector
        let n = new Vector([
            eyeLocation.getX() - location.getX(),
            eyeLocation.getY() - location.getY(),
            eyeLocation.getZ() - location.getZ()
        ]);

        // use Subtract within the Vector class

        n = n.normalize();
        let u = upVec.crossProduct(n);
        u = u.normalize();
        let v = n.crossProduct(u);
        v = v.normalize();

        this.camera = new Matrix([
            u.getX(), u.getY(), u.getZ(), 0,
            v.getX(), v.getY(), v.getZ(), 0,
            n.getX(), n.getY(), n.getZ(), 0,
            0, 0, 0, 1
        ]);

        this.camera = this.camera.translate(-eyeLocation.getX(), -eyeLocation.getY(), -eyeLocation.getZ());

        return this.camera;
    }

    /**
     * Calculate the view matrix from this information and store it in your class variable.
     * @return the camera view matrix.
     * @param {Vector} camLocation
     * @param {Vector} viewNormal
     * @param {Vector} upVec
     */
    viewPoint(camLocation, viewNormal, upVec) {
        viewNormal = viewNormal.normalize();
        let upVecDot = upVec.dotProduct(viewNormal);

        let v = new Vector([
            upVec.getX() - upVecDot * viewNormal.getX(),
            upVec.getY() - upVecDot * viewNormal.getY(),
            upVec.getZ() - upVecDot * viewNormal.getZ()
        ]);

        v = v.normalize();
        let u = v.crossProduct(viewNormal);
        u = u.normalize();

        this.camera = new Matrix([
            u.getX(), u.getY(), u.getZ(), 0,
            v.getX(), v.getY(), v.getZ(), 0,
            viewNormal.getX(), viewNormal.getY(), viewNormal.getZ(), 0,
            0, 0, 0, 1
        ]);

        this.camera = this.camera.translate(-camLocation.getX(), -camLocation.getY(), -camLocation.getZ());

        return this.camera;
    }
}

// allows the class to be send during testing
module.exports = {
    Camera: Camera,
    Matrix: Matrix,
    Vector: Vector
};
