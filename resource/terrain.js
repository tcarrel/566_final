"use strict";

/**Creates an array of shaders.
 * @return an array contain the necessary shader programs.
 */
function get_t_shaders()
{
    
    return { 
        vert:
            'attribute   vec4      a_pos;\n' +
            'attribute   vec2      a_tex_coord;\n' +
            'uniform     mat4      u_xform;\n' +
            'uniform     mat4      u_view;\n' +
            'uniform     mat4      u_pers;\n' +
            'uniform     sampler2D u_height_map;\n' +

            'varying     vec2      v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '        gl_Position = u_xform * a_pos;\n' +
            '        v_tex_coord = a_tex_coord;\n' +
            '}\n',
        frag:
            'precision mediump float;\n' +
            'uniform sampler2D   u_sampler;\n' +
            'varying vec2        v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '    gl_FragColor = texture2D(u_sampler, v_tex_coord);\n' +
            '}\n'
    };
}

/**
 * Initialize shader variables
 */
function init_t_svars(gl, sh, vars)
{
    svars_(gl, 'a_pos',        vars.a_pos       );
    svars_(gl, 'a_tex_coord',  vars.a_tex_coord );
    svars_(gl, 'u_xform',      vars.u_xform     );
    svars_(gl, 'u_view',       vars.u_view      );
    svars_(gl, 'u_pers',       vars.u_pers      );
    svars_(gl, 'u_height_map', vars.u_height_map);
}

function load_height_map()
{

}

/*
    var shaders = [
        'attribute vec4 a_pos;\n' +
        'uniform mat4 u_xform;\n' +
        'void main(){\n' +
        '  gl_Position = u_xform * a_pos;\n' +
        '}\n'
        ,

        //un-textured items
        'precision mediump float;\n' +
        'uniform vec4 u_color;\n' +
        'void main(){\n' +
        '  gl_FragColor = u_color;\n' +
        '}\n'
        ,
        
        //text items
        'attribute vec4 a_pos;\n' +
        'attribute vec2 a_tex_coord;\n' +
        'uniform mat4 u_xform;\n' +
        'varying vec2 v_tex_coord;\n' +
        'void main(){\n' +
        '  gl_Position = u_xform * a_pos;\n' +
        '  v_tex_coord = a_tex_coord;\n' +
        '}\n'
        ,

        'precision mediump float;\n' +
        'uniform sampler2D u_sampler;\n' +
        'varying vec2 v_tex_coord;\n' +
        'void main(){\n' +
        '  gl_FragColor = texture2D(u_sampler, v_tex_coord);\n' +
        '}\n'
    ]

    return shaders;
}
*/
