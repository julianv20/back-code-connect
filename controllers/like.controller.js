
const { response, request } = require('express');

const Publication = require('../models/publication');
const User        = require('../models/user');


const addLike = async (req = request, res = response) => {
    
    const { idPublication } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById( id );
        const publication = await Publication.findById( idPublication );

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        };

        if ( !publication ) {
            return res.status(400).json({
                ok: false,
                msg: 'La publicación no existe'
            });
        }

        // Verificar si el usuario ya dio like a la publicación
        if ( publication.likesUsers.includes( id ) ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya dio like a esta publicación'
            });
        };

        user.likesPublications.push( publication._id );
        publication.likesUsers.push( user._id );

        await user.save();
        await publication.save();

        return res.status(200).json({
            ok: true,
            msg: 'Like agregado exitosamente',
            likes: publication.likesUsers,
            idPublication: idPublication
        });
        
    } catch (error) {

        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });

    };
};


const removeLike = async (req = request, res = response) => {

    const { idPublication } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById( id );
        const publication = await Publication.findById( idPublication );

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        };

        if ( !publication ) {
            return res.status(400).json({
                ok: false,
                msg: 'La publicación no existe'
            });
        };

        // Verificar si el usuario dio like a la publicación antes de eliminarlo
        const userIndex = user.likesPublications.indexOf(publication._id);
        if ( userIndex === -1 ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no dio like a esta publicación'
            });
        };

        const publicationIndex = publication.likesUsers.indexOf(user._id);
        if ( publicationIndex === -1 ) {
            return res.status(400).json({
                ok: false,
                msg: 'La publicación no tiene el like del usuario'
            });
        };

        user.likesPublications.splice( userIndex, 1 );
        publication.likesUsers.splice( publicationIndex, 1 );

        await user.save();
        await publication.save();

        return res.status(200).json({
            ok: true,
            msg: 'Like eliminado exitosamente',
            likes: publication.likesUsers,
            idPublication: idPublication
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Error en el servidor'
        });
    }
};


module.exports = {
    addLike,
    removeLike
};