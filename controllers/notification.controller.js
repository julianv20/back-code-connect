
const { response, request } = require('express');

const User = require('../models/user');


const allMyNotifications = async ( req = request, res = response ) => {

    const { id } = req.params;

    const user = await User.findById( id );

    if ( !user ) {
        return res.status(400).json({
            ok: false,
            msg: 'El usuario no existe',
        });
    }


    return res.status(200).json({
        ok: true,
        msg: 'Notificaciones del usuario',
        notifications: user.notifications,
    });

};


module.exports = {
    allMyNotifications,
};