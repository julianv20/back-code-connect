
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')

const { dbConnection } = require('../database/config');
const { Sockets } = require('./sockets.server');

require('dotenv').config();


class Server {

    constructor() {

        this.app = express();

        this.port = process.env.PORT || 8080;

        this.paths = {
            authPath          : '/auth',
            configurationPath : '/configuration',
            group             : '/group',
            homePath          : '/home',
            profilePath       : '/profile',
            publication       : '/publication',
            comment           : '/comment',
            like              : '/like',
            notification      : '/notification'
        };

        this.connectionDB();

        this.middlewares();

        this.routes();
        
        this.server = require('http').createServer( this.app );

        this.io = require('socket.io')( this.server );

    };


    async connectionDB() {
        await dbConnection();
    };
    

    middlewares() {

        this.app.use( cors() );

        //Lectura y perseo
        this.app.use( express.json() )

        //Directorio publico
        this.app.use( express.static('public') );

        // Majenar la carga de archivos
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

    };


    configurarSockets() {

        new Sockets( this.io );
        
    };


    routes() {

        this.app.use(this.paths.authPath,          require('../routes/auth'));
        this.app.use(this.paths.configurationPath, require('../routes/configuration'));
        this.app.use(this.paths.group,             require('../routes/group'));
        this.app.use(this.paths.homePath,          require('../routes/home'));
        this.app.use(this.paths.profilePath,       require('../routes/profile'));
        this.app.use(this.paths.publication,       require('../routes/publication'));
        this.app.use(this.paths.comment,           require('../routes/comment'));
        this.app.use(this.paths.like,              require('../routes/like'));
        this.app.use(this.paths.notification,      require('../routes/notification'));
        
    };


    listen() {

        this.server.listen( this.port, () => {
            console.log('Server running in port: ' + this.port);
        });

        this.configurarSockets();
        
    };

};  


module.exports = Server