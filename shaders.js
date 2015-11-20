/**
 * Thomas R. Carrel
 * @file object.js
 */

/** All functions in this file return an object containing both necessary
 * shader programs.
 */
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

            'attribute  vec4    a_normal;\n' +
            'varying    vec4    v_color;\n' +
            'varying    vec3    v_normal;\n' +
            'varying    vec3    v_pos;\n' +

            'void main()\n' +
            '{\n' +
            '    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +

            '    v_tex_coord = a_tex_coord;\n' +
            '    v_pos       = vec3( u_xform * a_pos ).xyz;\n' +
            '    v_normal    = a_normal.xyz;\n' +  
            '}\n',
        frag:
            'precision  mediump     float;\n' +

            'uniform    sampler2D   u_sampler;\n' +
            'varying    vec2        v_tex_coord;\n' +

            'uniform    vec3        u_light_color;\n' +
            'uniform    vec3        u_light_pos;\n' +
            'uniform    vec3        u_ambient;\n' +

            'varying    vec3        v_normal;\n' +
            'varying    vec3        v_pos;\n' +

            'void main()\n' +
            '{\n' +
            '       vec3 normal     = normalize( v_normal );\n' +
            '       vec3 light_dir  = normalize( u_light_pos - v_pos );\n' +
            '       float dot       = max( dot( light_dir, normal ), 0.0 );\n' +
            '       vec4 color      = texture2D(u_sampler, v_tex_coord);\n' +
            '       vec3 diffuse    = u_light_color * color.rgb * dot;\n' +
            '       vec3 ambient    = u_ambient * color.rgb;\n' +

            '       gl_FragColor = vec4( diffuse + ambient, color.a );\n' +
            '}\n'
    };
}

function get_cube_shaders()
{
    return{
        vert:
            'attribute  vec4    a_pos;\n' +

            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_view;\n' +
            'uniform    mat4    u_perspective;\n' +

            'uniform    mat4    u_normal_xform;\n' +
            'attribute  vec4    a_color;\n' +
            'attribute  vec4    a_normal;\n' +
            'varying    vec4    v_color;\n' +
            'varying    vec3    v_normal;\n' +
            'varying    vec3    v_pos;\n' +

            'void main()\n' +
            '{\n' +
            '   gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +

            '   v_color     = a_color;\n' +
            '   v_pos       = vec3( u_xform * a_pos ).xyz;\n' +
            '   v_normal    = normalize( u_normal_xform * a_normal ).xyz;\n' +
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
            '       vec3 normal     = normalize( v_normal );\n' +
            '       vec3 light_dir  = normalize( u_light_pos - v_pos );\n' +
            '       float dot       = max( dot( light_dir, normal ), 0.0 );\n' +
            '       vec3 diffuse    = u_light_color * v_color.rgb * dot;\n' +
            '       vec3 ambient    = u_ambient * v_color.rgb;\n' +

            '       gl_FragColor    = vec4( diffuse + ambient, v_color.a );\n' +
            '}\n'
    };
}

function get_light_shaders()
{
    return {
        vert:
            'attribute  vec4    a_pos;\n' +

            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_view;\n' +
            'uniform    mat4    u_perspective;\n' +
            'void main()\n' +
            '{\n' +
            '   gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +
            '}\n',
        frag:
            'precision  mediump     float;\n' +

            'uniform    vec3        u_color;\n' +
            'void main()\n' +
            '{\n' +
            '   gl_FragColor = vec4( u_color, 0.5 );\n' +
            '}\n'
    };
}
