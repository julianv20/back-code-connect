
const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { addLike, removeLike } = require('../controllers/like.controller');



const router = Router();

//Agrega un like a una publicación
router.put('/add/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], addLike)

 
//Elimina un like de una publicación
router.put('/remove/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], removeLike)

module.exports = router;

