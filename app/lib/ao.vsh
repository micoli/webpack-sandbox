attribute vec4 attrib0;
attribute vec4 attrib1;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform float tileCount;
uniform float angle;
uniform float centerX;
uniform float centerY;
uniform float centerZ;

varying vec3  normal;
varying vec2  tileCoord;
varying vec2  texCoord;
varying float ambientOcclusion;

mat4 translate(float x, float y, float z) {
	return mat4(1.0, 0.0, 0.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				x,   y,   z, 1.0);
}

mat4 rotateX(float a) {
	return mat4(1.0, 0.0, 0.0, 0.0,
				0.0, cos(a), sin(a), 0.0,
				0.0, -sin(a), cos(a), 0.0,
				0.0, 0.0, 0.0, 1.0);
}

mat4 rotateY(float a) {
	return mat4(cos(a), 0.0, -sin(a), 0.0,
				0.0, 1.0, 0.0, 0.0,
				sin(a), 0.0, cos(a), 0.0,
				0.0, 0.0, 0.0, 1.0);
}

mat4 rotateAround(float a, float x, float y, float z) {
	return translate(x,y,z) * rotateX(a)*rotateY(a) * translate(-x,-y,-z);
}

void main() {
  //Compute position
  vec3 position = attrib0.xyz;

  //Compute ambient occlusion
  ambientOcclusion = attrib0.w / 255.0;

  //Compute normal
  normal = 128.0 - attrib1.xyz;

  //Compute texture coordinate
  texCoord = vec2(dot(position, vec3(normal.y-normal.z, 0, normal.x)),
                  dot(position, vec3(0, -abs(normal.x+normal.z), normal.y)));

  //Compute tile coordinate
  float tx    = attrib1.w / tileCount;
  tileCoord.x = floor(tx);
  tileCoord.y = fract(tx) * tileCount;

  gl_Position = projection * view * rotateAround(angle,centerX,centerY,centerZ)  * model * vec4(position, 1.0);
}
