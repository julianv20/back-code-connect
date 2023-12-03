
const { response, request } = require('express');


const User = require('../models/user');
const Group = require('../models/group');

const joinToGroup = async (req, res) => {

    const { id } = req.params;
    const { groupId } = req.body;

    try {
        // Validar si el usuario existe en la base de datos
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no se encuentra registrado en la base de datos',
            });
        }

        // Validar si el grupo existe en la base de datos
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(400).json({
                ok: false,
                msg: 'El grupo no se encuentra registrado',
            });
        };


        // Verificar si el usuario ya está registrado en el grupo
        if (group.members.includes(id)) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya está registrado en este grupo',
            });
        }


        // Agregar el ID del usuario al arreglo de miembros del grupo
        group.members.push(id);
        await group.save();

        
        // Agregar el ID del grupo al arreglo 'groups' del usuario
        user.groups.push(groupId);
        await user.save();

        
        // Si la operación se realizó con éxito, puedes enviar una respuesta exitosa
        return res.status(200).json({
            ok: true,
            msg: 'El usuario se unió al grupo exitosamente',
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error en el servidor',
        });
    }
};



const createGroups = async ( req = request, res = response ) => {

    const { name } = req.body;

    try {
        // Validar si el usuario existe en la base de datos
        const grupo = await Group.findOne({name});
        if (grupo) {
            return res.status(400).json({
                ok: false,
                msg: 'El grupo ya existe',
            });
        }

        const group = new Group({ name });
        await group.save();

        await group.save();


        // Si la operación se realizó con éxito, puedes enviar una respuesta exitosa
        return res.status(200).json({
            ok: true,
            group,
            msg: 'El usuario se unió al grupo exitosamente',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error en el servidor',
        });
    }
}




const getGroups = async (req = request, res = response) => {
    try {
        // Consultar todos los grupos en la base de datos y seleccionar solo los campos necesarios
        const groups = await Group.find({}, 'name type');

        if (!groups || groups.length === 0) {
            return res.status(404).json({
                ok: true,
                msg: 'No se encontraron grupos registrados',
            });
        }

        return res.status(200).json({
            ok: true,
            groups,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error en el servidor al obtener los grupos',
        });
    }
};

const leaveGroup = async (req = request, res = response) => {
    try {
        const { id } = req.params; // ID del usuario
        const { groupId } = req.body; // ID del grupo

        
        // Verificar si el usuario y el grupo existen
        const user = await User.findById(id);
        const group = await Group.findById(groupId);


        if (!user || !group) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario o grupo no encontrado'
            });
        }

        // Eliminar el grupo de la lista de grupos del usuario
        const updatedUserGroups = user.groups.filter(group => group.toString() !== groupId);
        user.groups = updatedUserGroups;
        await user.save();

        // Eliminar el usuario de la lista de miembros del grupo
        group.members = group.members.filter(memberId => memberId.toString() !== id);
        await group.save();

        res.status(200).json({
            ok: true,
            msg: 'Usuario abandonó el grupo con éxito'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al abandonar el grupo'
        });
    }
};





module.exports = {
    joinToGroup,
    getGroups,
    createGroups,
    leaveGroup
};
