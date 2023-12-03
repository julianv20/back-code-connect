

const { response, request } = require('express');
const cloudinary = require('cloudinary').v2;
cloudinary.config( process.env.CLOUDINARY_URL );


const User = require('../models/user');
const Publication = require('../models/publication');
const Comment = require('../models/comment');


const populateComments = async (publication) => {
    const publicationWithComments = publication.toObject();

    // Obtener todos los comentarios relacionados con la publicación
    const allComments = await Comment.find({ publication: publication._id })
        .populate({
            path: 'author',
            select: 'name lastName imageProfile',
        })
        .populate({
            path: 'replys',
            populate: [
                {
                    path: 'author',
                    select: 'name lastName imageProfile',
                },
                {
                    path: 'replys',
                    populate: {
                        path: 'author',
                        select: 'name lastName imageProfile',
                    },
                    select: '-__v',
                    //Si algo quitar
                },
            ],
            select: '-__v',
        })
        .select('-__v');

    // Filtrar solo los comentarios principales (sin un padre)
    const mainComments = allComments.filter(comment => !comment.parentComment);

    // Agregar los comentarios con respuestas a la publicación
    publicationWithComments.comments = mainComments;

    return publicationWithComments;
};




const actualizarImages = async ( req = request, res = response ) => {

    const { image, id } = req.params;

    let user;
    user = await User.findById(id);

    if( !user ){
        return res.status(400).json({
            ok: false,
            msg: 'El usuario no existe',
        });
    };


    if ( image == 'photo' ) {
    
        if (user.imageProfile) {
            const nombreArr = user.imageProfile.split('/')
            const nombre = nombreArr[ nombreArr.length - 1 ]
            const [ public_id ] = nombre.split('.')
            cloudinary.uploader.destroy( public_id );
        };
    
        const { tempFilePath } = req.files.file;
        const { secure_url } = await cloudinary.uploader.upload( tempFilePath );
    
        user.imageProfile = secure_url;
        await user.save() 
    
        const {imageProfile} = await User.findById(id);
    
        res.status(200).json({
            imageProfile,
        }); 

    }
    else if (image == 'banner') {
    
        if (user.imageBanner) {
            const nombreArr = user.imageBanner.split('/')
            const nombre = nombreArr[ nombreArr.length - 1 ]
            const [ public_id ] = nombre.split('.')
            cloudinary.uploader.destroy( public_id );
        };
    
        const { tempFilePath } = req.files.file;
        const { secure_url } = await cloudinary.uploader.upload( tempFilePath );
    
        user.imageBanner = secure_url;
        await user.save() 
    
        const {imageBanner} = await User.findById(id);
    
        res.status(200).json({
            imageBanner
        }); 
    }
    else {
        return res.status(400).json({
            ok: false,
            msg: 'Dirección no valida'
        });
    };

};


const visitUser = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        // Obtener los datos del usuario
        const userData = await User.findById(id, {
            name: 1,
            lastName: 1,
            country: 1,
            phoneNumber: 1,
            email: 1,
            imageProfile: 1,
            imageBanner: 1,
            description: 1,
            github: 1,
            groups: 1,
        }).populate('groups', 'name');

        // Obtener las publicaciones del usuario
        const userPublications = await Publication.find({ author: id })
            .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
            .populate({
                path: 'group',
                select: 'name',
            })
            .populate({
                path: 'author',
                select: 'name lastName imageProfile',
            });

        // Poblar los comentarios anidados de las publicaciones
        const publicationsWithComments = await Promise.all(
            userPublications.map(populateComments)
        );

        // Devolver los datos del usuario y sus publicaciones con comentarios anidados
        return res.status(200).json({
            ok: true,
            user: userData,
            publications: publicationsWithComments,
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener los datos del usuario',
        });
    };
};



module.exports = {
    actualizarImages,
    visitUser,
};