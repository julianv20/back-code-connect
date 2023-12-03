

const { response, request } = require('express');

const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const User = require('../models/user');
const Group = require('../models/group');
const Publication = require('../models/publication');
const Comment = require('../models/comment');


const subirPublicacion = async (req = request, res = response) => {
    const { id } = req.params;
    const { title, description, group, code } = req.body;

    const existeAuthor = await User.findById(id);
    if (!existeAuthor) {
        return res.status(400).json({
            ok: false,
            msg: 'El autor no se encuentra registrado',
        });
    }

    const existeGroup = await Group.findById(group);
    if (!existeGroup) {
        return res.status(400).json({
            ok: false,
            msg: 'El grupo no existe',
        });
    }

    // Verificar si el usuario está registrado en el grupo
    const userIsMember = existeGroup.members.includes(id);
    if (!userIsMember) {
        return res.status(400).json({
            ok: false,
            msg: 'El usuario no está registrado en este grupo',
        });
    }

    // Variable para almacenar la notificación
    const newNotification = {
        idPublication: '',
        name: existeAuthor.name,
        lastName: existeAuthor.lastName,
        message: '',
    };

    try {
        if (req.files && req.files.file) {
            const { tempFilePath } = req.files.file;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

            try {
                // Incluye "code" en la creación del objeto de publicación
                const publication = new Publication({
                    title,
                    description,
                    author: id,
                    group,
                    file: secure_url,
                    code,
                });
                await publication.save();

                // Agregar el ID de la nueva publicación al arreglo 'publications' del grupo
                existeGroup.publications.push(publication._id);
                await existeGroup.save();

                // Agregar el ID de la nueva publicación al arreglo 'publications' del usuario
                existeAuthor.publications.push(publication._id);

                // Obtener información del autor, incluyendo el apellido
                const authorInfo = {
                    id: existeAuthor._id,
                    name: existeAuthor.name,
                    lastname: existeAuthor.lastName,
                    imageProfile: existeAuthor.imageProfile,
                };

                // Mensaje de notificación
                newNotification.idPublication = publication._id;
                newNotification.message = `${existeAuthor.name} ${existeAuthor.lastName} ha hecho una publicación en el grupo ${existeGroup.name}`;

                // Crear un objeto de notificación para cada usuario en el grupo, excluyendo al autor
                const usersInGroup = await User.find({ groups: group });
                for (const userInGroup of usersInGroup) {
                    if (userInGroup._id.toString() !== id) {
                        userInGroup.notifications.push(newNotification);
                        await userInGroup.save();
                    }
                }

                console.log('Notificación guardada');

                return res.status(200).json({
                    msg: 'Publicación subida exitosamente',
                    ok: true,
                    publication: { ...publication._doc, author: authorInfo },
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    ok: false,
                    msg: 'Hubo un error en el servidor',
                });
            }
        } else {
            try {
                // Incluye "code" en la creación del objeto de publicación
                const publication = new Publication({
                    title,
                    description,
                    author: id,
                    group,
                    code,
                });
                await publication.save();

                // Agregar el ID de la nueva publicación al arreglo 'publications' del grupo
                existeGroup.publications.push(publication._id);
                await existeGroup.save();

                // Agregar el ID de la nueva publicación al arreglo 'publications' del usuario
                existeAuthor.publications.push(publication._id);

                // Obtener información del autor, incluyendo el apellido
                const authorInfo = {
                    id: existeAuthor._id,
                    name: existeAuthor.name,
                    lastname: existeAuthor.lastName,
                    imageProfile: existeAuthor.imageProfile,
                };

                // Mensaje de notificación
                newNotification.idPublication = publication._id;
                newNotification.message = `${existeAuthor.name} ${existeAuthor.lastName} ha hecho una publicación en el grupo ${existeGroup.name}`;

                // Crear un objeto de notificación para cada usuario en el grupo, excluyendo al autor
                const usersInGroup = await User.find({ groups: group });
                for (const userInGroup of usersInGroup) {
                    if (userInGroup._id.toString() !== id) {
                        userInGroup.notifications.push(newNotification);
                        await userInGroup.save();
                    };
                };

                console.log('Notificación guardada');

                return res.status(200).json({
                    msg: 'Publicación subida exitosamente',
                    ok: true,
                    publication: { ...publication._doc, author: authorInfo },
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    ok: false,
                    msg: 'Hubo un error en el servidor',
                });
            }
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};


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


const getPublicacionesUsuario = async (req, res) => {
    const { id } = req.params;
    const page = req.query.page || 1; // Página por defecto es 1
    const itemsPerPage = 10; // Cantidad de elementos por página

    try {
        // Calcular el valor de 'skip' para paginación
        const skip = (page - 1) * itemsPerPage;

        // Contar la cantidad total de publicaciones del usuario
        const totalPublicaciones = await Publication.countDocuments({
            author: id,
        });

        // Calcular la cantidad de páginas en función de la cantidad total y la cantidad por página
        const totalPages = Math.ceil(totalPublicaciones / itemsPerPage);

        // Buscar todas las publicaciones donde el usuario sea el autor con paginación
        const publicaciones = await Publication.find({
            author: id,
        })
            .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
            .populate({
                path: 'author',
                select: 'name lastName imageProfile', // Select the fields you want to include
            })
            .skip(skip)
            .limit(itemsPerPage);

        // Poblar los comentarios de cada publicación
        const populatedPublicaciones = await Promise.all(publicaciones.map(populateComments));

        res.status(200).json({
            ok: true,
            publicaciones: populatedPublicaciones,
            totalPages, // Enviar la cantidad de páginas en la respuesta
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error en el servidor',
        });
    }
};


const getAllGroupsPublications = async (req, res) => {
    const { id } = req.params;
    const page = req.query.page || 1; // Página por defecto es 1
    const itemsPerPage = 10; // Cantidad de elementos por página

    try {
        // Buscar todos los grupos a los que el usuario pertenece
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no se encuentra registrado',
            });
        }

        const gruposUsuario = user.groups;

        // Calcular el valor de 'skip' para paginación
        const skip = (page - 1) * itemsPerPage;

        // Contar la cantidad total de publicaciones en los grupos del usuario
        const totalPublicaciones = await Publication.countDocuments({
            group: { $in: gruposUsuario },
        });

        // Calcular la cantidad de páginas en función de la cantidad total y la cantidad por página
        const totalPages = Math.ceil(totalPublicaciones / itemsPerPage);

        // Buscar las publicaciones en los grupos del usuario con paginación
        const publications = await Publication.find({
            group: { $in: gruposUsuario },
        })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'name lastName imageProfile', // Select the fields you want to include
            })
            .skip(skip)
            .limit(itemsPerPage);

        // Poblar los comentarios de cada publicación
        const populatedPublicaciones = await Promise.all(publications.map(populateComments));

        res.status(200).json({
            ok: true,
            publicaciones: populatedPublicaciones,
            totalPages,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error en el servidor',
        });
    }
};



const getOnePublication = async (req, res) => {
    const { id } = req.params;
    const page = req.query.page || 1; // Página por defecto es 1
    const itemsPerPage = 10; // Cantidad de elementos por página

    try {
        // Validar si el grupo existe en la base de datos
        const group = await Group.findById(id);

        if (!group) {
            return res.status(400).json({
                ok: false,
                msg: 'El grupo no se encuentra registrado',
            });
        }

        // Calcular el valor de 'skip' para paginación
        const skip = (page - 1) * itemsPerPage;

        // Contar la cantidad total de publicaciones en el grupo
        const totalPublicaciones = await Publication.countDocuments({
            group: id,
        });

        // Calcular la cantidad de páginas en función de la cantidad total y la cantidad por página
        const totalPages = Math.ceil(totalPublicaciones / itemsPerPage);

        // Consultar las publicaciones del grupo con paginación, ordenadas por fecha descendente
        const publications = await Publication.find({ group: id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'name lastName imageProfile', // Select the fields you want to include
            })
            .skip(skip)
            .limit(itemsPerPage);

        // Poblar los comentarios de cada publicación
        const populatedPublications = await Promise.all(publications.map(populateComments));

        res.status(200).json({
            ok: true,
            publications: populatedPublications,
            nameGroup: group.name,
            totalPages, // Enviar la cantidad de páginas en la respuesta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};


const deletePublication = async (req = request, res = response) => {

    const { id } = req.params;

    try {

        // Buscar la publicación
        const publication = await Publication.findById(id);

        // Verificar si la publicación existe
        if (!publication) {
            return res.status(404).json({
                ok: false,
                msg: 'La publicación no existe'
            });

        };

        if (publication.file) {
            const nombreArr = publication.file.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id);
        };

        // Eliminar la publicación
        const deletedPublication = await Publication.findByIdAndDelete(id);

        // Eliminar el ID de la publicación del usuario
        await User.updateOne(
            { _id: deletedPublication.author },
            { $pull: { publications: id } }
        );

        // Eliminar el ID de la publicación del grupo
        await Group.updateOne(
            { _id: deletedPublication.group },
            { $pull: { publications: id } }
        );

        // Se eliminó correctamente
        res.status(200).json({
            ok: true,
            msg: 'Publicación eliminada con éxito'
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la publicación'
        });

    };

};



const updatePublication = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { title, description, code } = req.body;

        // Verificar si la publicación existe
        const existingPublication = await Publication.findById(id)
            .populate('author', 'name lastName imageProfile') // Poblar la propiedad "author"
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name lastName imageProfile',
                },
            })

        if (!existingPublication) {
            return res.status(404).json({
                ok: false,
                msg: 'La publicación no existe'
            });
        }

        // Verificar si se proporciona un nuevo archivo en la solicitud
        if (req.files && req.files.file) {
            // Verificar si la publicación anterior tenía un archivo y eliminarlo
            if (existingPublication.file) {
                const nombreArr = existingPublication.file.split('/');
                const nombre = nombreArr[nombreArr.length - 1];
                const [public_id] = nombre.split('.');
                cloudinary.uploader.destroy(public_id);
            }

            const { tempFilePath } = req.files.file;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

            // Actualizar el campo "file" de la publicación con la URL del nuevo archivo
            existingPublication.file = secure_url;
        }

        // Actualizar los campos de la publicación
        if (title) {
            existingPublication.title = title;
        }

        if (description) {
            existingPublication.description = description;
        }

        if (code !== undefined) {
            existingPublication.code = code;
        }

        await existingPublication.save();

        const publicationWithComments = await populateComments( existingPublication );

        res.status(200).json({
            ok: true,
            msg: 'Publicación actualizada con éxito',
            publication: publicationWithComments
        });

    } catch ( error ) {
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la publicación'
        });
    }
};



module.exports = {
    subirPublicacion,
    getPublicacionesUsuario,
    getAllGroupsPublications,
    getOnePublication,
    deletePublication,
    updatePublication,
};