/**
 * Thomas R. Carrel
 * @file World.js
 */


// There's code in here from other sources, but I've lost track of which lines
//are from where or by whom, however, it mostly just a line or two here and
//there.  Some is likely form webglfundamentals.org... but I'm no longer even
//sure if anything I used is still in here


//For debugging
const DEBUG = false;
const CULL  = true;
const DEPTH = true;

//Standardized key codes:
const UP            =  38;
const DOWN          =  40;
const LEFT          =  37;
const RIGHT         =  39;
const W_CODE        =  87;
const Y_CODE        =  89;
const TILDA_CODE    = 192;
const SHFT_CODE     =  16;
const E_CODE        =  69;
const D_CODE        =  68;
const SPACE_BAR     =  32;
const HELP_CODE     = 191;
const U_CODE        =  85;
const H_CODE        =  72;
const J_CODE        =  74;
const B_CODE        =  66;
const N_CODE        =  78;
const G_CODE        =  71;
const V_CODE        =  86;

//binary key codes, as used for internal state.
const DOWN_ARROW    = 1; //<< 0;
const UP_ARROW      = 1 <<  1;
const RIGHT_ARROW   = 1 <<  2;
const LEFT_ARROW    = 1 <<  3;
const W_KEY         = 1 <<  4;
const Y_KEY         = 1 <<  5;
const TILDA_KEY     = 1 <<  6;
const SHIFT         = 1 <<  7;
const E_KEY         = 1 <<  8;
const D_KEY         = 1 <<  9;
const SPACE         = 1 << 10;
const HELP          = 1 << 11;
const U_KEY         = 1 << 12;
const J_KEY         = 1 << 13;
const H_KEY         = 1 << 14;
const B_KEY         = 1 << 15;
const N_KEY         = 1 << 16;
const G_KEY         = 1 << 17;
const V_KEY         = 1 << 18;
const WIREFRAME     = 1 << 19;
const WINDMILL_ON   = 1 << 20;

//Adjust movement speeds:
const ANGLE_INCREMENT       = 1.5;
const POSITION_INCREMENT    = 0.1;

//Ambient light: (make not a const, later)
const AMBIENT = [ 0.2, 0.2, 0.2 ];

"use strict";

function main()
{
    // Init stuff...
    var canvas = document.getElementById('render_to');
    var aspect = canvas.clientWidth / canvas.clientHeight;
    var gl = getWebGLContext(canvas);
    if( !gl ) 
    {
        console.log('Could not get WebGL rendering context.');
        return;
    }
    if( DEPTH )
        gl.enable(gl.DEPTH_TEST);
    if( CULL )
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }
    gl.enable(gl.BLEND);

    //State associated with keypresses
    var keys =
    {
        code: WINDMILL_ON // Begin with the windmill turning.
    }
    camera = get_camera(aspect, [50, 50]);

    // Keypress handling.
    document.onkeydown = function(ev)
    {
        handle_key_down( ev, keys );
    };
    document.onkeyup   = function(ev)
    {
        handle_key_up( ev, keys );
    }

    // Handle browser window resize.
    document.onresize  = function()
    {
        aspect = canvas.clientWidth / canvas.clientHeight;
        camera.update_projection(aspect);
    };

    var diffuse = {
        color:  new Float32Array([ 1.0, 0.0, 0.0 ]),
        pos:    new Float32Array([ 8.0, 3.0, 8.0 ])
    };


    var scene_graph = get_scene( init_cube(gl) );
    // Get references for the key-press response.
    keys.windmill    = search_graph( "windmill",    scene_graph );
    keys.blades      = search_graph( "blades",      scene_graph );
    keys.table       = search_graph( "table",       scene_graph );

    var t_shaders = get_terrain_shaders();
    var prog = createProgram( gl, t_shaders.vert, t_shaders.frag );
    var terrain = {
        program: prog,
        svars: {
            a_pos:          set_svar( gl, "a_pos",         prog ),
            a_tex_coord:    set_svar( gl, "a_tex_coord",   prog ),
            a_normal:       set_svar( gl, "a_normal",      prog ),

            u_xform:        set_svar( gl, "u_xform",       prog ),
            u_view:         set_svar( gl, "u_view",        prog ),
            u_perspective:  set_svar( gl, "u_perspective", prog ),

            u_light_color:  set_svar( gl, "u_light_color", prog ),
            u_light_pos:    set_svar( gl, "u_light_pos",   prog ),
            u_ambient:      set_svar( gl, "u_ambient",     prog )
        },
        is_loaded: false,
        texture_unit: gl.TEXTURE0,
        buffer: gl.createBuffer()
    };
    var t_texture = new Image();
    t_texture.onload = function(){
        init_terrain( gl, terrain, t_texture );
    };
    terrain.render = get_rf();
    // Image from: 
    //http://www.art.eonworks.com/free/textures/floor_tiles_texture_005.png
    t_texture.src = "./resources/floor_tiles.png";

    // Different textures for debugging.
    //t_texture.src = "./resources/debug.png";
    //t_texture.src = "./resources/debug_2.png";
    //t_texture.src = "./resources/cat.jpg";

    gl.clearColor( 0.4, 0.4, 0.5, 1.0 );

    var tick = function()
    {
        gl.clear( gl.COLOR_BUFFER_BIT );
        //Render skybox here.
        gl.clear( gl.DEPTH_BUFFER_BIT );

        if( keys.code !== 0 )
        {
            key_response( camera, keys );
            scene_graph.update_world( false );
        }

        scene_graph.render( gl, camera.view, camera.proj, keys.code & WIREFRAME, diffuse ); 

        //Render "Terrain" last to show depth buffer functioning.
        terrain.render( gl, camera.view, camera.proj, keys.code & WIREFRAME, diffuse );

        requestAnimationFrame( tick, canvas );
    };

    tick();
}

function handle_key_down( e, keys )
{
    if( DEBUG )
        console.log( e.keyCode + " pressed." );

    switch( e.keyCode )
    {
        case UP:
            keys.code |= UP_ARROW;
            keys.code &= ~DOWN_ARROW;
            break;
        case DOWN:
            keys.code |= DOWN_ARROW;
            keys.code &= ~UP_ARROW;
            break;
        case LEFT: 
            keys.code |= LEFT_ARROW;
            keys.code &= ~RIGHT_ARROW;
            break;
        case RIGHT:
            keys.code |= RIGHT_ARROW;
            keys.code &= ~LEFT_ARROW;
            break;
        case W_CODE: //windmill on/off
            keys.code |= W_KEY;
            break;
        case Y_CODE: //rotate windmill
            keys.code |= Y_KEY;
            break;
        case TILDA_CODE: //toggle wireframe
            keys.code |= TILDA_KEY;
            break;
        case SHFT_CODE: 
            keys.code |= SHIFT;
            break;
        case E_CODE:
            keys.code |= E_KEY;
            break;
        case D_CODE:
            keys.code |= D_KEY;
            break;
        case SPACE_BAR:
            keys.code |= SPACE;
            break;
        case HELP_CODE:
            keys.code |= HELP;
            break;
        case U_CODE:
            keys.code |= U_KEY;
            break;
        case H_CODE:
            keys.code |= H_KEY;
            break;
        case J_CODE:
            keys.code |= J_KEY;
            break;
        case B_CODE:
            keys.code |= B_KEY;
            break;
        case N_CODE:
            keys.code |= N_KEY;
            break;
        case G_CODE:
            keys.code |= G_KEY;
            break;
        case V_CODE:
            keys.code |= V_KEY;
            break;
        default:
            return;
    }
}

function handle_key_up( e, keys )
{
    if( DEBUG )
        console.log( e.keyCode + " released." );

    switch( e.keyCode )
    {
        case UP:
            keys.code &= ~UP_ARROW;
            break;
        case DOWN:
            keys.code &= ~DOWN_ARROW;
            break;
        case LEFT:
            keys.code &= ~LEFT_ARROW;
            break;
        case RIGHT:
            keys.code &= ~RIGHT_ARROW;
            break;
        case Y_CODE:
            keys.code &= ~Y_KEY;
            break;
        case SHFT_CODE:
            keys.code &= ~SHIFT;
            break;
        case E_CODE:
            keys.code &= ~E_KEY;
            break;
        case D_CODE:
            keys.code &= ~D_KEY;
            break;
        case U_CODE:
            keys.code &= ~U_KEY;
            break;
        case H_CODE:
            keys.code &= ~H_KEY;
            break;
        case J_CODE:
            keys.code &= ~J_KEY;
            break;
        case B_CODE:
            keys.code &= ~B_KEY;
            break;
        case N_CODE:
            keys.code &= ~N_KEY;
            break;
        case G_CODE:
            keys.code &= ~G_KEY;
            break;
        case V_CODE:
            keys.code &= ~V_KEY;
            break;
        default:
            return;
    }
}

function key_response( camera, key )
{
    var mov_dist;
    if( key.code & SHIFT )
    {
        mov_dist = POSITION_INCREMENT;
    }
    else
    {
        mov_dist = POSITION_INCREMENT * 2;
    }


    if( key.code & UP_ARROW )
        camera.move_forward( mov_dist );
    else if( key.code & DOWN_ARROW )
        camera.move_backward( mov_dist );

    if( key.code & LEFT_ARROW )
        camera.rotate_left_by( ANGLE_INCREMENT );
    else if( key.code & RIGHT_ARROW )
        camera.rotate_right_by(ANGLE_INCREMENT );

    if( key.code & E_KEY )
        camera.look_up( ANGLE_INCREMENT );
    else if ( key.code & D_KEY )
        camera.look_down( ANGLE_INCREMENT );

    if( key.code & SPACE )
    {
        camera.reset_up_down();
        key.code &= ~SPACE;
    }

    if( key.code & W_KEY ) //toggle windmill on/off
    {
        //key.windmill_on = !key.windmill_on;
        key.code ^= WINDMILL_ON;
        key.code &= (~W_KEY); //only do this once.
    }
    if( key.code & WINDMILL_ON )
        key.blades.rotate( 0, 0, 2 * ANGLE_INCREMENT );

    if( key.code & Y_KEY ) //rotate windmill
        key.windmill.rotate( 0, 360 - (1.5 * ANGLE_INCREMENT), 0 );
    else if( key.code & U_KEY )
        key.windmill.rotate( 0, 1.5 * ANGLE_INCREMENT, 0 );

    if( key.code & H_KEY )
        key.table.rotate( 0, 360 - ANGLE_INCREMENT, 0 );
    else if( key.code & J_KEY )
        key.table.rotate( 0, ANGLE_INCREMENT, 0 );

    if( key.code & B_KEY )
        key.table.rotate( 0, 0, 360 - ANGLE_INCREMENT );
    else if( key.code & N_KEY )
        key.table.rotate( 0, 0, ANGLE_INCREMENT );

    if( key.code & G_KEY )
        key.table.rotate( 360 - ANGLE_INCREMENT, 0, 0 );
    else if( key.code & V_KEY )
        key.table.rotate( ANGLE_INCREMENT, 0, 0 );

    if( key.code & TILDA_KEY )
    {
        //        key.wireframe = !key.wireframe;
        key.code ^= WIREFRAME;
        key.code &= ~TILDA_KEY;
    }

    if( key.code & HELP )
    {
        alert(
                "CONTROLS\n" +
                "   Movement:\n" +
                "       [arrow keys]\n" +
                "           Look or walk around.\n" +
                "       [e], [d]\n" +
                "           Look up or down.\n" +
                "       [shift]\n" +
                "           Hold to walk slower.\n\n" +
                "       [space bar]\n" +
                "           Reset vertical rotation.\n\n" +
                "   Windmill:\n" +
                "       [w]\n" +
                "           Toggle windmill on/off.\n" +
                "       [y], [u]\n" +
                "           Rotate windmill.\n\n" +
                "   Table:\n" +
                "       [h], [j]\n" +
                "           Yaw.\n" +
                "       [b], [n]\n" +
                "           Roll.\n" +
                "       [g], [v]\n" +
                "           Pitch.\n\n" +
                "   Miscelleneous:\n" +
                "       [~] or [`]\n" +
                '           Toggle "wireframe" mode.\n' +
                "       [/] or [?]\n" +
                "           Shows these instructions.\n"
                );
        key.code &= ~HELP;
    }
}
