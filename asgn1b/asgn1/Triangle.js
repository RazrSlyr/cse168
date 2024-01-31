class Triangle {
    constructor(position, color, size) {
        this.type = "triangle";
        this.position = position;
        this.color = color;
        this.size = size;
    }

    render() {
        let [x, y] = this.position;
        let rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.vertexAttrib1f(a_Size, this.size);
        // Draw
        let multipler = this.size / 10;
        let gap = 0.025 * multipler;
        drawTriangle([x, y + gap,
            x - gap, y - gap,
            x + gap, y - gap]);
    }
}


function drawTriangle(vertices, _gl) {
    if (_gl == undefined) _gl = gl;
    let n = 3;

    // Create a buffer object
    var vertexBuffer = _gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    _gl.bindBuffer(_gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.DYNAMIC_DRAW);

    let _a_Position = undefined;
    if (_gl == gl) {
        _a_Position = a_Position;
    } else {
        _a_Position = a_Position2;
    }
    // Assign the buffer object to a_Position variable
    _gl.vertexAttribPointer(_a_Position, 2, _gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    _gl.enableVertexAttribArray(_a_Position);

    // Draw the triangle
    _gl.drawArrays(_gl.TRIANGLES, 0, n);
}