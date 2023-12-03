
const jwt = require('jsonwebtoken');


const desestructurarJWT = ( token = '' ) => {
    
    // Decodifica el token JWT (esto solo funciona si tienes la clave secreta)
    const infoToken = jwt.verify(token, process.env.SECRETEORPRIVATEKEY);
    
    // Ahora puedes acceder a los datos desestructurados
    const { uid } = infoToken;
    console.log();

    return uid;


};



module.exports = {
    desestructurarJWT
}