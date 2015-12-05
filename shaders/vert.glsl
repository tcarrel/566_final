attribute   vec4    a_pos;
attribute   vec2    a_tex_coord;
uniform     mat4    u_xform;
uniform     mat4    u_view;
uniform     mat4    u_pers;

varying     vec2    v_tex_coord;

void main()
{
        gl_Position = u_xform * a_pos;
        v_tex_coord = a_tex_coord;
}
