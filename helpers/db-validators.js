



const User = require('../models/user');


const exiteEmail = async ( email = '' ) => {

    const existeEmail = await User.findOne({ email });

    if( existeEmail ){
        throw new Error('El correo ya está registrado en la DB')
    };
};


const existePhoneNumber = async ( phoneNumber = '' ) => {
    
    const existePhoneNumber = await User.findOne({ phoneNumber });
    
    if( existePhoneNumber ){
        throw new Error('El numero de telefono ya está asociado a otro usuario')
    };
};


const existeUsuarioPorId = async( id = '' ) => {

    // Verificar si el correo existe
    const existeUser = await User.findById(id);

    if ( !existeUser ) {

        throw new Error(`El id no existe: ${ id }`);

    };
};



module.exports = {
    exiteEmail,
    existePhoneNumber,
    existeUsuarioPorId
};