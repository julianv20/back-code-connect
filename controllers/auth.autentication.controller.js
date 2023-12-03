

const { response, request } = require('express')

const bcryptjs = require('bcryptjs');  


const User = require('../models/user');
const { generarJWT } = require('../helpers/generar-jwt');
const sendEmail = require('../helpers/send-email');


const  userRegister = async ( req = request, res = response ) => {

    const { name, lastName, country, phoneNumber, email, password } = req.body


    const existeEmail = await User.findOne({ email });    
    if( existeEmail ){

        return res.status(400).json({
            ok: false,
            msg: 'El usuario ya se encuentra regisrado',
        });

    };


    const existePhoneNumber = await User.findOne({ phoneNumber });
    if( existePhoneNumber ){

        return res.status(400).json({
            ok: false,
            msg: 'El numero de telefono ya está asociado a otro usuario',
        });

    };
    
    
    const user = new User({ name, lastName, country, phoneNumber, email, password });

    //Crea el numero de saltos que le va a hacer a la encriptación
    const salt = bcryptjs.genSaltSync();

    //primero pide lo que se va a encriptar y segundo la constante de los saltos 
    user.password = bcryptjs.hashSync( password, salt );

    //3- Guardar el registro en la BD
    await user.save();

    //generar jwt
    const token = await generarJWT( user.id );

    sendEmail(email, name)

    res.status(200).json({
        msg: 'Usuario regisrado exitosamente',
        ok: true,
        token,
        user
    });

};



const  userLogin = async ( req = request, res = response ) => {

    const { email, password } = req.body

    try {

        //Valido si el usuario existe
        const user = await User.findOne({ email });

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña no son correctos',
            });
        };

        //Valida si está activo 
        if ( !user.state ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario está inactivo',
            });
        };

        //Validar que la contraseña sea valida
        const validarPassword = bcryptjs.compareSync( password, user.password );

        if ( !validarPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta',
            });
        };


        //generar jwt
        const token = await generarJWT( user.id );
        
        return res.status(200).json({
            ok: true,
            msg: 'Login Ok',
            token,
            user
        });


    } catch (error) {

        console.log(error);
        res.status(500).json({
            msg: 'Algo salio mal',
        });

    };

};


module.exports = {
    userRegister,
    userLogin
};