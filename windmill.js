

"use strict";

function main()
{
    var canvas = document.getElementById("render_to");

    var t_shaders = get_t_shaders();
    shader_to_console(t_shaders, "Terrain");

    var look_at = new Matrix4;
    look_at.setLookAt( 0.0, 0.2, 0.0, 0.0, 0.0, -1, 0.0, 1.0, 0.0 );

    var view_mat = new Matrix4;
    // Always use clientWidth and clientHeight for aspect ratio.
    view_mat.setPerspective( 30, canvas.clientWidth / canvas.clientHeight, 1, 100 );

    var gl = getWebGLContext(canvas);
    if( !gl )
    {
        console.log("Failed to retrieve the WebGL rendering context.");
        return;
    }

    if( !initShaders(gl, t_shaders.vert, t_shaders.frag) )
    {
        console.log("Failed to init shaders");
        return;
    }

    var t_svars = {};
    init_t_svars(gl, t_shaders, t_svars);
    var terrain = {};
    terrain.plane = get_plane( 1024, 1024, 1024, 1024 );
    init_terrain( gl, terrain );

    var main_loop = function (gl, canvas, shaders)
    {    

        console.log( " We got here!!!" );

        if( !initShaders(gl, shaders.vertex, shaders.frag) )
        {
            console.log("Failed to init shaders");
            return;
        }
    }

    gl.enable( gl.DEPTH_TEST );
    gl.clearColor( 0.25, 0.5, 0.75, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var tick = function()
    {
        //skybox();
        //render_terrain();
        //render();
        //update();
        
        //requestAnimationFrame();
    }
    tick();
}


function shader_to_console( shaders, name )
{
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("\t" + name);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("VERTEX:\n"   + shaders.vert);
    console.log("FRAGMENT:\n" + shaders.frag);
}
