


function init_skybox( gl )
{
    var shaders = get_sky_shaders();
    var prog = createProgram( gl, shaders.vert, shaders.frag );

    var skybox = 
    {
        image_is_loaded: false,
        program: prog,
        svars: {
            u_xform:        set_svar( gl, "u_xform",       prog ),
            u_view:         set_svar( gl, "u_view",        prog ),
            u_perspective:  set_svar( gl, "u_perspective", prog ),
            u_skybox:       set_svar( gl, "u_skybox",      prog )
        },
        indicies: new Uint8Array
            ([
             // front
             0, 2, 1,   0, 3, 2,
             // right
             4, 6, 5,   4, 7, 6,
             // up
             8,10, 9,   8,11,10,
             // left
             12,14,13,  12,15,14,
             // down
             16,18,17,  16,19,18,
             // back
             20,22,21,  20,23,22
            ]),
        render: function(gl, xform, view, proj)
        {
            if( !this.image_is_loaded )
                return;

            gl.useProgram(this.program);

            gl.uniformMatrix4fv(
                    this.svars.u_xform,
                    false,
                    xform.elements );
            gl.uniformMatrix4fv(
                    this.svars.u_view,
                    false,
                    view.elements );
            gl.uniformMatrix4fv(
                    this.svars.u_perspective,
                    false,
                    proj.elements );

            gl.bindBuffer( gl.ARRAY_BUFFER, this.vertex_buffer );
            gl.vertexAttribPointer( 
                    this.svars.a_pos,
                    3,
                    gl.FLOAT,
                    false,
                    0, 0 );
            gl.bindBuffer( gl.ARRAY_BUFFER, this.color_buffer );
            gl.vertexAttribPointer(
                    this.svars.a_color,
                    3,
                    gl.FLOAT,
                    false,
                    0, 0 );

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.i_buffer );
            gl.drawElements(
                    gl.TRIANGLES,
                    this.indicies.length,
                    gl.UNSIGNED_BYTE,
                    0);
        },
        //Create buffer object
        i_buffer:       gl.createBuffer(),
        vertex_buffer:  gl.createBuffer(),
        tc_buffer:      gl.createBuffer()
    }
    if( !skybox.i_buffer )
        throw "Could not create skybox index buffer.";
    if( !skybox.vertex_buffer )
        throw "Could not create skybox vertex buffer.";
    if( !skybox.tc_buffer )
        throw "Could not create skybox color buffer.";


    var verticies = new Float32Array
        ([
         // v0-v1-v2-v3 front
         1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
         // v0-v3-v4-v5 right
         1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
         // v0-v5-v6-v1 up
         1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  
         // v1-v6-v7-v2 left
         -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  
         // v7-v4-v3-v2 down
         -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, 
         // v4-v7-v6-v5 back
         1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   
        ]);
    var tex_coords = new Float32Array
        ([
         // v0-v1-v2-v3 front(blue)
         2/3, 3/4,      2/3, 2/4,       1/3, 2/4,       1/3, 3/4,
         // v0-v3-v4-v5 right(green)
         2/3, 1.0,      2/3, 3/4,       1/3, 3/4,       1/3, 1.0,
         // v0-v5-v6-v1 up(red)
         1.0, 2/4,      1.0, 1/4,       2/3, 1/4,       2/3, 2/4,
         // v1-v6-v7-v2 left
         2/3, 2/4,      2/3, 1/4,       1/3, 1/3,       1/3, 2/4,
         // v7-v4-v3-v2 down
         1/3, 2/4,      1/3, 1/4,       0.0, 1/4,       0.0, 2/4,
         // v4-v7-v6-v5 back
         2/3, 1/4,      2/3, 0.0,       1/3, 0.0,       1/3, 1/4
        ]);

    skybox.svars.a_pos   = create_array_buffer( 
            gl, 
            verticies,
            3,
            gl.FLOAT,
            "a_pos",
            prog,
            skybox.vertex_buffer );
    skybox.svars.a_skybox = create_sky_tex_buffer(
            gl,
            colors,
            2,
            gl.FLOAT,
            "u_skybox",
            prog,
            skybox.color_buffer );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.i_buffer );
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, skybox.indicies, gl.STATIC_DRAW );

    var texture = new Image();
    texture.onload = function(){

        image_is_loaded = true;
    };
    texture.src = "./resources/skybox.png";

    return skybox;
}

function create_sky_tex_buffer( gl, data, qty, type, svar, program, buffer )
{
    gl.useProgram(prog);

    if( !buffer )
    {
        console.log(" Couldn't create VBO for " + attrib );
    }
    else
        console.log("@@ SUCCESS: VBO for '" + attrib + ",' created." );

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer );
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );

    var assign = gl.getUniformLocation( prog, attrib );
    if( assign < 0 )
    {
        console.log( " Failed to get location of " + attrib );
    }
    else
        console.log( "@@ SUCCESS: location of '" + attrib + ",' acquired." );

    gl.vertexAttribPointer( assign, qty, type, false, 0, 0 );
    gl.enableVertexAttribArray( assign );

    return assign;
}
