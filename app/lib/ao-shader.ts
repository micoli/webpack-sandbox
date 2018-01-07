var createShader = require("gl-shader")
var glslify = require("glslify")

module.exports  = function(gl) {
  return createShader(gl,
    glslify("./ao.vsh"),
    glslify("./ao.fsh"))
}
