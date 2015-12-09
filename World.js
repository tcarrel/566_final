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
const FORWARDS      =  get_code('w');
const BACKWARDS     =  get_code('s');
const TURN_LEFT     =  get_code('left_arrow');
const TURN_RIGHT    =  get_code('right_arrow');
const FAN_ACTIVATE  =  get_code('x');//87;
const FAN_CLOCKWISE =  get_code('e');
const WF_TOGGLE     =  get_code('`');
const MVMNT_SPEED   =  get_code('shift');
const LOOK_UP       =  get_code('up_arrow');
const LOOK_DOWN     =  get_code('down_arrow');
const SPACE_BAR     =  get_code('space');
const HELP_CODE     =  get_code('f1');;
const FAN_ANTICWISE =  get_code('q');
const TABLE_Y_C     =  get_code('c');
const TABLE_Y_A     =  get_code('z');;
const TABLE_X_C     =  get_code('num_8');
const TABLE_X_A     =  get_code('num_2');
const TABLE_Z_C     =  get_code('num_6');
const TABLE_Z_A     =  get_code('num_4');
const STRAFE_LEFT   =  get_code('a');
const STRAFE_RIGHT  =  get_code('d');
const TOGGLE_LIGHTS =  get_code('f');

//binary key codes, as used for internal state.
const DOWN_ARROW    = 1;//<< 0;
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
const S_LEFT        = 1 << 21;
const S_RIGHT       = 1 << 22;

//Adjust movement speeds:
const ANGLE_INCREMENT       = 1.5;
const POSITION_INCREMENT    = 0.2;

//Ambient light: (make not a const, later)
const AMBIENT = [ 0.2, 0.2, 0.2 ];
const DIFFUSE = 
[{
    color:      [ (240/255), 1.0, (180/255) ],
    direction:  [ 0.5,-1.0, 0.5 ]
},{
    color:      [ 0.0, 0.0, 0.0 ],
    direction:  [ 0.5,-1.0, 0.5 ]
}];

const MS_PER_FRAME = 100/6; //1000/60 == 60fps

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

    var point_light = {
        color:  0,
        pos:    new Float32Array([ 0.0, 4.0, 0.0 ]),
        on:     new Float32Array([ 1.5, 1.5, 1.5 ]),
        off:    new Float32Array([ 0.0, 0.0, 0.0 ]),
        is_on: true
    };
    point_light.color = point_light.on;

    // Keypress handling.
    document.onkeydown = function(ev)
    {
        handle_key_down( ev, keys, point_light );
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

    //get_lights( gl, point_light, canvas );

    //    var shadows = get_lights( gl, point_light, canvas );
    var shadows = {};

    var scene_graph = get_scene( init_cube( gl, shadows ) );
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

    var current     = 0.0;
    var previous    = Date.now();

    var tick = function()
    {
        current = Date.now();
        var elapsed = current - previous;
        previous = current;

        gl.clear( gl.COLOR_BUFFER_BIT );
        //Render skybox here.
        gl.clear( gl.DEPTH_BUFFER_BIT );

        if( keys.code !== 0 )
        {
            key_response( camera, keys, elapsed );
            scene_graph.update_world( false );
        }

        var wf = keys.code & WIREFRAME;
        scene_graph.render( gl, camera.view, camera.proj, wf, point_light ); 

        //Render "Terrain" last to show depth buffer functioning.
        terrain.render( gl, camera.view, camera.proj, wf, point_light );
        end = Date.now();

        requestAnimationFrame( tick, canvas );
    };

    tick();
}

function handle_key_down( e, keys, point_light )
{
    if( DEBUG )
        console.log( e.keyCode + " pressed." );

    switch( e.keyCode )
    {
        case FORWARDS:
            keys.code |= UP_ARROW;
            keys.code &= ~DOWN_ARROW;
            break;
        case BACKWARDS:
            keys.code |= DOWN_ARROW;
            keys.code &= ~UP_ARROW;
            break;
        case TURN_LEFT: 
            keys.code |= LEFT_ARROW;
            keys.code &= ~RIGHT_ARROW;
            break;
        case TURN_RIGHT:
            keys.code |= RIGHT_ARROW;
            keys.code &= ~LEFT_ARROW;
            break;
        case FAN_ACTIVATE:
            keys.code |= W_KEY;
            break;
        case FAN_CLOCKWISE: //rotate windmill
            keys.code |= Y_KEY;
            break;
        case FAN_ANTICWISE:
            keys.code |= U_KEY;
            break;
        case WF_TOGGLE: //toggle wireframe
            keys.code |= TILDA_KEY;
            break;
        case MVMNT_SPEED:
            keys.code |= SHIFT;
            break;
        case LOOK_UP:
            keys.code |= E_KEY;
            break;
        case LOOK_DOWN:
            keys.code |= D_KEY;
            break;
        case SPACE_BAR:
            keys.code |= SPACE;
            break;
        case HELP_CODE:
            keys.code |= HELP;
            break;
        case TABLE_Y_C:
            keys.code |= H_KEY;
            break;
        case TABLE_Y_A:
            keys.code |= J_KEY;
            break;
        case TABLE_X_C:
            keys.code |= B_KEY;
            break;
        case TABLE_X_A:
            keys.code |= N_KEY;
            break;
        case TABLE_Z_C:
            keys.code |= G_KEY;
            break;
        case TABLE_Z_A:
            keys.code |= V_KEY;
            break;
        case STRAFE_LEFT:
            keys.code |= S_LEFT;
            break;
        case STRAFE_RIGHT:
            keys.code |= S_RIGHT;
            break;
        case TOGGLE_LIGHTS:
            point_light.is_on = !point_light.is_on;
            if( point_light.is_on )
                point_light.color = point_light.on;
            else
                point_light.color = point_light.off;
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
        case FORWARDS:
            keys.code &= ~UP_ARROW;
            break;
        case BACKWARDS:
            keys.code &= ~DOWN_ARROW;
            break;
        case TURN_LEFT:
            keys.code &= ~LEFT_ARROW;
            break;
        case TURN_RIGHT:
            keys.code &= ~RIGHT_ARROW;
            break;
        case FAN_CLOCKWISE:
            keys.code &= ~Y_KEY;
            break;
        case MVMNT_SPEED:
            keys.code &= ~SHIFT;
            break;
        case LOOK_UP:
            keys.code &= ~E_KEY;
            break;
        case LOOK_DOWN:
            keys.code &= ~D_KEY;
            break;
        case FAN_ANTICWISE:
            keys.code &= ~U_KEY;
            break;
        case TABLE_Y_C:
            keys.code &= ~H_KEY;
            break;
        case TABLE_Y_A:
            keys.code &= ~J_KEY;
            break;
        case TABLE_X_C:
            keys.code &= ~B_KEY;
            break;
        case TABLE_X_A:
            keys.code &= ~N_KEY;
            break;
        case TABLE_Z_C:
            keys.code &= ~G_KEY;
            break;
        case TABLE_Z_A:
            keys.code &= ~V_KEY;
            break;
        case STRAFE_LEFT:
            keys.code &= ~S_LEFT;
            break;
        case STRAFE_RIGHT:
            keys.code &= ~S_RIGHT;
            break;
        default:
            return;
    }
}

function key_response( camera, key, time_step )
{
    var mov_dist    = time_step / MS_PER_FRAME;
    var angle_inc   = mov_dist;
    if( key.code & SHIFT )
    {
        mov_dist  *= POSITION_INCREMENT * 1.75;
        angle_inc *= ANGLE_INCREMENT * 1.75;
    }
    else
    {
        mov_dist  *= POSITION_INCREMENT;
        angle_inc *= ANGLE_INCREMENT;
    }

    if( key.code & UP_ARROW )
        camera.move_forward( mov_dist );
    else if( key.code & DOWN_ARROW )
        camera.move_backward( mov_dist );

    if( key.code & S_LEFT )
        camera.strafe_left( mov_dist );
    else if( key.code & S_RIGHT )
        camera.strafe_right( mov_dist );

    if( key.code & LEFT_ARROW )
        camera.rotate_left_by( angle_inc );
    else if( key.code & RIGHT_ARROW )
        camera.rotate_right_by( angle_inc );

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
