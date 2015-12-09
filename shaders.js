/**
 * Thomas R. Carrel
 * @file object.js
 */

/** All functions in this file return an object containing both necessary
 * shader programs.
 */
function get_terrain_shaders()
{
    var r = '1.0';
    var g = '1.0 / 256.0';
    var b = '1.0 / (256.0 * 256.0)';
    var a = '1.0 / (256.0 * 256.0 * 256.0)';

    return {
        vert:
            'attribute  vec4    a_pos;\n' +

            'uniform    mat4    u_mvp;\n' +
            'uniform    mat4    u_mvp_from_light;\n' +
            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_view;\n' +
            'uniform    mat4    u_perspective;\n' +
            'attribute  vec2    a_tex_coord;\n' +

            'varying    vec2    v_tex_coord;\n' +

            'attribute  vec4    a_normal;\n' +

            'varying    vec4    v_color;\n' +
            'varying    vec3    v_normal;\n' +
            'varying    vec3    v_pos;\n' +
//            'varying    vec4    v_pos_from_light;\n' +

            'void main()\n' +
            '{\n' +
            '    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +

                /*
            '    vec3   normal  = normalize(a_normal.xyz);\n' +
            '    float  dot_p   = max(dot(u_diffuse_dir, normal), 0.0);\n' +
            '    vec3   diffuse = u_diffuse * dot_p;\n' +
            */

//            '    v_pos_from_light = u_mvp_from_light * a_pos;\n' +

            '    v_tex_coord = a_tex_coord;\n' +
            '    v_pos       = vec3( u_xform * a_pos );\n' +
            '    v_normal    = a_normal.xyz;\n' +  
            '}\n',
        frag:
            'precision  mediump     float;\n' +

            'uniform    sampler2D   u_sampler;\n' +
            'uniform    sampler2D   u_shadow_map;\n' +
            'varying    vec2        v_tex_coord;\n' +

            //Diffuse light
            /*
            'uniform    vec3        u_diffuse;\n' +
            'uniform    vec3        u_diffuse_dir;\n' +
            */

            'uniform    vec3        u_light_color;\n' +
            'uniform    vec3        u_light_pos;\n' +
            'uniform    vec3        u_ambient;\n' +

//            'varying    vec4        v_pos_from_light;\n' +
            'varying    vec3        v_normal;\n' +
            'varying    vec3        v_pos;\n' +
/*
            'float unpack_depth(const in vec4 rgba_depth)\n' +
            '{\n' +
            '    const vec4 shift = vec4( ' +
                    r + ', ' + g + ', ' + b + ', ' + a + ' );\n' +
            '    float depth = dot( rgba_depth, shift );\n' +
            '    return depth;\n' +
            '}\n' +
*/
            'void main()\n' +
            '{\n' +
/*
            '    vec3 shadow_coord   = ( v_pos_from_light.xyz / ' +
                'v_pos_from_light.w )/2.0 + 0.5;\n' +
            '    vec4 rgba_depth     = texture2D( u_shadow_map, ' +
                'shadow_coord.xy );\n' +
            '    float depth         = unpack_depth(rgba_depth);\n' +
            '    float visibility    = ' +
                '(shadow_coord.z > depth + 0.0025) ? 0.7 : 1.0;\n' +
*/
            '    vec3 normal     = normalize( v_normal );\n' +
            '    vec3 light_dir  = normalize( u_light_pos - v_pos );\n' +
            '    float dot       = max( dot( light_dir, normal ), 0.0 );\n' +
            '    vec4 color      = texture2D(u_sampler, v_tex_coord);\n' +
            '    vec3 diffuse    = u_light_color * color.rgb * dot;\n' +
            '    vec3 ambient    = u_ambient * color.rgb;\n' +

//            '    gl_FragColor = vec4( (diffuse * visibility) ' +
            '    gl_FragColor   = vec4( diffuse ' +
                    '+ ambient, color.a );\n' +
            '}\n'
    };
}


function get_cube_shaders()
{
    return {
        vert:
            'attribute  vec4    a_pos;\n' +

            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_mvp;\n' +

            'uniform    mat4    u_normal_xform;\n' +
            'attribute  vec4    a_color;\n' +
            'attribute  vec4    a_normal;\n' +

            'varying    vec4    v_color;\n' +
            'varying    vec3    v_normal;\n' +
            'varying    vec3    v_pos;\n' +

            'void main()\n' +
            '{\n' +
            '   gl_Position = u_mvp * a_pos;\n' +

            '   v_color     = a_color;\n' +
            '   v_pos       = vec3( u_xform * a_pos );\n' +
            '   v_normal    = vec3(u_normal_xform * a_normal);\n' +
            '}\n',

        frag:
            'precision  mediump     float;\n' +

            'uniform    vec3        u_light_color;\n' +
            'uniform    vec3        u_light_pos;\n' +
            'uniform    vec3        u_ambient;\n' +

            'varying    vec3        v_normal;\n' +
            'varying    vec3        v_pos;\n' +
            'varying    vec4        v_color;\n' +

            'void main()\n' +
            '{\n' +
            '   vec3 normal     = normalize( v_normal );\n' +
            '   vec3 light_dir  = normalize( u_light_pos - v_pos );\n' +
            '   float dot_p     = max( dot( light_dir, normal ), 0.0 );\n' +
            '   vec3 diffuse    = u_light_color * v_color.rgb * dot_p;\n' +
            '   vec3 ambient    = u_ambient * v_color.rgb;\n' +

            '   gl_FragColor    = vec4( diffuse + ambient, v_color.a );\n' +
            '}\n'
    };
}

function get_window_shaders()
{
    return {
        vert:
            'attribute  vec4    a_pos;\n' +
            'attribute  vec2    a_tex_coord;\n' +
            'varying    vec2    v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '    v_tex_coord    = a_tex_coord;\n' +
            '    gl_Position    = a_pos;\n' +
            '}\n',
        frag:
            'uniform    sampler2D   u_scene;\n' +
            'varying    vec2        v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '    vec4 color   = texture2D(u_scene, v_tex_coord);\n' +
            '    gl_FragColor = color;\n' +
            '}\n'
    };
}

function get_shadow_shaders()
{
    var maskval = 1.0/256.0;
    return {
        vert:
            'attribue   vec4    a_pos;\n' +
            'uniform    mat4    u_mvp;\n' +
            'void main()\n' +
            '{\n' +
            '   gl_Position = u_mvp * a_pos;\n' +
            '}\n',
        frag:
            'precision mediump float;\n' +
            'void main()\n' +
            '{\n' +
            '   const vec4 bits = vec4( ' + 1 + '.0, ' +
                256 + '.0, ' +
                (256 * 256) + '.0, ' +
                (256 * 256 * 256)  + '.0 );\n' +
            '   const vec4 bitm = vec4( ' + maskval + ', ' +
                maskval + ', ' +
                maskval + ', 0.0 );\n' +
            '   vec4 rgbadepth = fract( gl_FragCoord.z * bits );\n' +
            '   rgbadepth -= rgbadepth.gbaa * bitm;\n' +
            '   gl_FragColor = rgbadepth;\n' +
            '}\n'
    }
}

/*
   function get_terrain_shaders()
   {
   return {
   vert:
   'attribute  vec4    a_pos;\n' +
   'uniform    mat4    u_xform;\n' +
   'uniform    mat4    u_view;\n' +
   'uniform    mat4    u_perspective;\n' +
   'attribute  vec2    a_tex_coord;\n' +
   'varying    vec2    v_tex_coord;\n' +

   'void main()\n' +
   '{\n' +
   '    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +
   '    v_tex_coord = a_tex_coord;\n' +
   '}\n',
   frag:
   'precision  mediump     float;\n' +

   'uniform    sampler2D   u_sampler;\n' +
   'varying    vec2        v_tex_coord;\n' +

   'void main()\n' +
   '{\n' +
   '   gl_FragColor = texture2D(u_sampler, v_tex_coord);\n'+
   '}\n'
   };
   }

/*
function get_cube_shaders()
{
return{
vert:
'attribute  vec4    a_pos;\n' +
'attribute  vec4    a_color;\n' +
'uniform    mat4    u_xform;\n' +
'uniform    mat4    u_view;\n' +
'uniform    mat4    u_perspective;\n' +

'varying    vec4    v_color;\n' +

'void main()\n' +
'{\n' +
'    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +
'    v_color = a_color;\n' +
'}\n',
frag:
'precision  mediump     float;\n' +

'varying    vec4        v_color;\n' +

'void main()\n' +
'{\n' +
'   gl_FragColor = v_color;\n'+
'}\n'
};
}
*/

