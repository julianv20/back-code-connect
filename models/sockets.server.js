

const { userConnected, 
        userDisconnected,
        getGroupsSocket,
        lastPublication,
        getCommentsByPublication, 
        getLikesPublication} = require("../controllers/sockets.controller");
        

const { comprobarJWT } = require("../helpers/jwt.sockets");



class Sockets {

    constructor( io ) {

        this.io = io;
        this.socketsEvents();

    };


    socketsEvents() {

        // Conexion del usuario
        this.io.on( 'connection', async ( socket ) => {

            const [ valido, uid ] = comprobarJWT( socket.handshake.query['token'] );

            if ( !valido ) {

                console.log('Socket no identificado');
                return socket.disconnect();

            };
            
            const { name, lastName, imageProfile } = await userConnected( uid );

            socket.data = {
                name: name, // Asigna el nombre del usuario
                lastName: lastName, // Asigna el apellido del usuario
                imageProfile: imageProfile // Asigna la imagen del perfil del usuario
            };


            // Obtiene los grupos a los que pertenece el usuario
            let groupIds = await getGroupsSocket( uid );


            // Unir al usuario a cada sala de grupo
            groupIds.forEach(( groupId ) => {
                socket.join( groupId );
            });


            // Emitir la lista de sockets en cada sala
            groupIds.forEach(( groupId ) => {

                const socketsInRoom = this.io.sockets.adapter.rooms.get( groupId );
                const connectedSockets = [];

                if ( socketsInRoom && socketsInRoom.size > 0 ) {

                    const socketIds = Array.from( socketsInRoom );

                    socketIds.forEach( socketId => {

                        const socket = this.io.sockets.sockets.get( socketId );

                        connectedSockets.push({
                            id: socket.data.id,
                            user: socket.data.user,
                            name: socket.data.name,
                            lastName: socket.data.lastName,
                            imageProfile: socket.data.imageProfile
                        });

                    });

                };

                // Emitir el evento 'lista-de-sockets-en-sala' con la lista actualizada a la sala actual
                this.io.to( groupId ).emit( 'lista-de-sockets-en-sala', connectedSockets );

            });


            // Escuchar cuando un cliente sube una publicación
            socket.on( 'nueva-publicacion', async ( data ) => {

                let uid = data.userId;
                let group = data.group;
                
                let publication = await lastPublication( uid );

                this.io.to( group ).emit( 'nueva-publicacion', publication );
                
                this.io.to( group ).emit( 'nueva-notificacion', { newNotification: true } );
                console.log(`se emitió la notificación a la sala: ${ group }`)

            });



            // Escuchar cuando se agrega un like a una publicación
            socket.on( 'like-publicacion', async ( data ) => {

                try {
                    
                    const { idPublication, group } = data;
                    console.log( idPublication, group )

                    const likes = await getLikesPublication( idPublication )

                    // Luego, emite el comentario a todos los usuarios en el grupo
                    this.io.to( group ).emit( 'nuevo-like-publicacion', {
                        idPublication,
                        likes,
                    });

                } catch ( error ) {

                    console.error( error );

                };

            });


            // Escuchar cuando un cliente comenta en una publicación
            socket.on( 'nuevo-comentario', async ( data ) => {

                try {
                    
                    const { idPublication, group } = data;
                    console.log( idPublication, group )

                    const comments = await getCommentsByPublication( idPublication )

                    // Luego, emite el comentario a todos los usuarios en el grupo
                    this.io.to( group ).emit( 'nuevo-comentario-publicacion', {
                        idPublication,
                        comments,
                    });

                } catch ( error ) {

                    console.error( error );

                };

            });


            //Obtiene los sockets en la sala "group"
            socket.on( 'obtener-sockets-en-sala', ( data, callback ) => {
                const { group } = data;
                
                // Obtener los sockets en la sala
                const socketsInRoom = this.io.sockets.adapter.rooms.get( group );

                if ( socketsInRoom && socketsInRoom.size > 0 ) {

                    const socketIds = Array.from( socketsInRoom );

                    const connectedSockets = socketIds.map( socketId => {

                        const socket = this.io.sockets.sockets.get(socketId);

                        return {
                            id: socket.data.id,
                            user: socket.data.user,
                            name: socket.data.name,
                            lastName: socket.data.lastName,
                            imageProfile: socket.data.imageProfile
                        };

                    });

                    // Devuelve la lista de sockets conectados en la sala con la información del usuario
                    callback({ success: true, sockets: connectedSockets });
                } else {
                    // No hay sockets en la sala
                    callback({ success: false, message: 'No hay sockets conectados en la sala' });
                };
            });


            socket.on( 'unir-socket-grupo', async ( data ) => {

                let group = data.group;
                socket.join( group );

            });


            // Marcar en la DB que el usuario se desconectó
            socket.on( 'disconnect', async () => {

                const { name } = await userDisconnected( uid );
                console.log( 'Cliente desconectado', name );

                const groupIds = await getGroupsSocket( uid );

                groupIds.forEach(( groupId ) => {

                    const socketsInRoom = this.io.sockets.adapter.rooms.get( groupId );
                    const connectedSockets = [];

                    if ( socketsInRoom && socketsInRoom.size > 0 ) {

                        const socketIds = Array.from( socketsInRoom );

                        socketIds.forEach( socketId => {

                            const socket = this.io.sockets.sockets.get( socketId );

                            connectedSockets.push({
                                id: socket.data.id,
                                user: socket.data.user,
                                name: socket.data.name,
                                lastName: socket.data.lastName,
                                imageProfile: socket.data.imageProfile
                            });

                        });
                    };
                    // Emitir el evento 'lista-de-sockets-en-sala' con la lista actualizada
                    this.io.to( groupId ).emit( 'lista-de-sockets-en-sala', connectedSockets );
                });
            });

        });
    };
};


module.exports = {
    Sockets,
};