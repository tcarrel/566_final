attribute   vec4      a_pos;
attribute   vec2      a_tex_coord;
uniform     mat4      u_xform;
uniform     mat4      u_view;
uniform     mat4      u_pers;
uniform     sampler2D u_height_map;

varying     vec2      v_tex_coord;

void main()
{
    vec4  y_rep = texture2D( u_height_map, a_tex_coord );
    float y_pos = (y_rep.r + y_rep.g + y_rep.b) / 3.0f;
    a_pos.y     = y_pos;
    gl_Position = u_xform * a_pos;
    v_tex_coord = a_tex_coord;
}
