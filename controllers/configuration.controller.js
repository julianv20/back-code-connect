


const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');



const actualizarDatosProfile = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, password, state, imageBanner, email, imageProfile, github, ...resto } = req.body;

    for (const clave in resto) {
        if (resto.hasOwnProperty(clave) && (resto[clave] === '' || resto[clave] === null || resto[clave] === undefined)) {
            delete resto[clave];
        }
    }

    // Verificar si el correo existe
    const existeUser = await User.findById(id);
    if (!existeUser) {
        return res.status(400).json({
            ok: false,
            msg: `El id no existe: ${id}`,
        });
    }

    try {
        if (resto.phoneNumber) {
            // Verificar si otro usuario ya tiene este phoneNumber
            const existingUser = await User.findOne({ phoneNumber: resto.phoneNumber });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Este número de teléfono ya está en uso por otro usuario',
                });
            }
        }

        if (password) {
            // Encriptar la contraseña
            const salt = bcryptjs.genSaltSync();
            resto.password = bcryptjs.hashSync(password, salt);
        }

        // Agregar el campo 'github' al objeto 'resto'
        if (github) {
            resto.github = github;
        }

        await User.findByIdAndUpdate(id, resto);

        const user = await User.findById(id);

        return res.status(200).json({
            ok: true,
            msg: 'Usuario actualizado correctamente',
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Ha ocurrido un error al actualizar el usuario',
            resto,
        });
    }
};





module.exports = {
    actualizarDatosProfile,
};
