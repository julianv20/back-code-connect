

const jwt = require('jsonwebtoken')



const  generarJWT = ( uid = '' ) => {

    return new Promise(( resolve, reject ) => {

        const payload = { uid }

        jwt.sign(payload, process.env.SECRETEORPRIVATEKEY, {

            expiresIn: '7d'

        }, ( err, token ) => {

            if ( err ) {

                console.log(err);
                reject('Failed to generate token')    

            } else {

                resolve(token)

            };
        });

    });

};




 module.exports = {
    generarJWT
 }