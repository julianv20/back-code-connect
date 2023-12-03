

const { response, request } = require('express')
// const bcryptjs = require('bcryptjs');  


const User = require('../models/user');
const { desestructurarJWT } = require('../helpers/desestructurar-jwt');



const homeGetUser = async ( req = request, res = response ) => {

    const token = req.header('token');

    const uid = desestructurarJWT( token )

    const userData = await User.findById( uid )


    if ( userData ) {
        const { password, ...user } = userData.toObject();

        return res.status(200).json({
            user
        });

    } else {
        return res.status(200).json({
            msg: 'Usuario no encontrado'
        }); 
    }


};




module.exports = {
    homeGetUser
}