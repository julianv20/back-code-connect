

const User = require("../models/user");
const Group = require("../models/group");
const Comment = require('../models/comment');
const Publication = require('../models/publication');

const userConnected = async ( uid ) => {

    const user = await User.findById( uid )
    user.online = true;
    await user.save();

    return user;

};


const userDisconnected = async ( uid ) => {

    const user = await User.findById( uid )
    user.online = false;
    await user.save();

    return user;

};



const getGroupsSocket = async ( uid ) => {

    try {
      // Supongamos que tienes un modelo de mongoose llamado "Group" que representa los grupos
      const groups = await Group.find({ members: uid }, '_id');
  
      // Extraer solo los IDs de los grupos y devolverlos en un array
      const groupIds = groups.map(group => group._id.toString());
  
      return groupIds;
      
    } catch (error) {

      console.error('Error al obtener los IDs de los grupos:', error);
      throw error;

    }
};



const lastPublication = async ( uid ) => {

    try {
        // Buscar al usuario por su UID
        const user = await User.findById( uid );

        if ( !user ) {
            throw new Error('Usuario no encontrado');
        };

        // Buscar la última publicación del usuario y populares el autor
        const lastPublication = await Publication.findOne({ author: uid })
            .sort({ createdAt: 'desc' })
            .populate('author', 'id name lastName imageProfile');

        if ( !lastPublication ) {
            throw new Error('No se encontraron publicaciones para este usuario');
        };

        return lastPublication;

    } catch ( error ) {

        console.error( error );
        throw new Error('Error al obtener la última publicación');

    };
};


const getCommentsByPublication = async ( id = '' ) => {

    try {

        const existePublication = await Publication.findById( id );

        if (!existePublication) {

            throw new Error('La publicación no existe')

        }

        // Obtener todos los comentarios relacionados con la publicación
        const allComments = await Comment.find({ publication: id })
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
                    },
                ],
                select: '-__v',
            })
            .select('-__v');        
        
        // Filtrar solo los comentarios principales (sin un padre)
        const mainComments = allComments.filter(comment => !comment.parentComment);

        return mainComments;

    } catch (error) {

        console.error(error);

        throw new Error('Error al obtener los comentarios')

    };
};





const getLikesPublication = async ( id ) => {

    try {

        const publication = await Publication.findById( id );

        if ( !publication ) {

            throw new Error('La publicación no se encontró')

        };

        const likes = publication.likesUsers

        return likes;

    } catch (error) {

        console.error(error);
        throw new Error('Error al obtener los comentarios')

    };

};



module.exports = {
    userConnected,
    userDisconnected,
    getGroupsSocket,
    lastPublication,
    getCommentsByPublication,
    getLikesPublication,
};