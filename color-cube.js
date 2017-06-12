'use strict';

function ColorCube() {
  this.mesh =  {
    vertices: [
      0xbe800000, 0x3e800000, 0x00000000, 0xff000000, 0x00000000, 0x3f800000,
      0x3e800000, 0x3e800000, 0x00000000, 0xff0000ff, 0x3f800000, 0x3f800000,
      0xbe800000, 0xbe800000, 0x00000000, 0xff00ff00, 0x00000000, 0x00000000,
      0x3e800000, 0xbe800000, 0x00000000, 0xff00ffff, 0x3f800000, 0x00000000,
    ],
    
    indices: [
      0, 1, 2, // 0
      1, 3, 2,
    ]
  };

  this.programLoaded  = function(program) {
    program.attribs = {};
    var attribs = [ 'pos', 'nml', 'col0', 'tex0' ];
    for (var a in attribs) {
      var attr = attribs[a];
      program.attribs[attr] = gl.getAttribLocation(program, 'a_' + attr);
    }
    
    program.uniforms = {}
    var uniforms = [ 'model', 'view', 'proj', 'tex0' ];
    for (var u in uniforms) {
      var uniform = uniforms[u];
      program.uniforms[uniform] = gl.getUniformLocation(program, 'u_' + uniform);
    }
    
    this.program = program;
  }

  this.init = function() {
    // vertices
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(this.mesh.vertices), gl.STATIC_DRAW);
    
    // indices
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), gl.STATIC_DRAW);
    
    var that = this;
    var prog = loadProgram('shaders/vs-simple-texture.txt', 'shaders/fs-simple-texture.txt',
                           function(prog) { that.programLoaded(prog); });
        prog.numIndices = this.mesh.indices.length;
  }

  this.setUniforms = function(flags) {
    var program = this.program;
    if (this.program) {
      if (flags & 0x1) gl.uniformMatrix4fv(program.uniforms.model, false, modelMatrix().d);
      if (flags & 0x2) gl.uniformMatrix4fv(program.uniforms.proj, false, projMatrix().d);
      if (flags & 0x4) gl.uniformMatrix4fv(program.uniforms.view, false, viewMatrix().d);
      gl.uniform1i(program.uniforms.tex0, 0);
    }
  }
  
  this.bind = function() {
    if (this.program) {
      var program = this.program;
        
      gl.useProgram(program);
        
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      
      gl.enableVertexAttribArray(program.attribs.pos);
      gl.vertexAttribPointer(program.attribs.pos, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(program.attribs.col0);
      gl.vertexAttribPointer(program.attribs.col0, 4, gl.UNSIGNED_BYTE, true, 24, 12);
      gl.enableVertexAttribArray(program.attribs.tex0);
      gl.vertexAttribPointer(program.attribs.tex0, 2, gl.FLOAT, false, 24, 16);
    }
  }
  
  this.draw = function(flags) {
    if (this.program) {
      var program = this.program;
      
      this.setUniforms(flags);
      
      gl.drawElements(gl.TRIANGLES, program.numIndices, gl.UNSIGNED_SHORT, 0);
    }
  }
  
  this.init();
}
