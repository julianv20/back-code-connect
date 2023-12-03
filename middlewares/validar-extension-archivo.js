



const { response, request } = require('express')


const validarExtensionArchivo = (req = request, res = response, next) => {
        
    // Verifica si 'req.files' está definido y si 'req.files.file' existe
    if (req.files && req.files.file) {
      const file = req.files.file;
      const nameCut = file.name.split('.');
      const extension = nameCut[nameCut.length - 1];
  
      const extensionsValid = ['png', 'jpeg', 'jpg', 'gif', 'webp', 'avif'];
  
      if (!extensionsValid.includes(extension.toLowerCase())) {
        return res.status(400).json({
          ok: false,
          msg: `La extensión ${extension} no es permitida, Las extensiones permitidas son: ${extensionsValid}`,
        });
      }
    }
  
    // Llama a 'next()' incluso si no se proporciona un archivo, para que la solicitud continúe
    next();
  };
  


module.exports = {
    validarExtensionArchivo
};