



const { Router } = require('express');
const { check } = require('express-validator');
const { addComment, replyToComment } = require('../controllers/comment.controller');


const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const router = Router();

//Crea el comentario padre
router.post('/new/:id',[
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], addComment)


//Ruta para responder a un comentario
router.post('/reply/:id', [
    check('id', 'El ID no es válido').isMongoId(),
    check('parentComment', 'El ID del comentario padre es requerido').isMongoId(),
    validarJWT,
    validarCampos,
], replyToComment);



module.exports = router;

