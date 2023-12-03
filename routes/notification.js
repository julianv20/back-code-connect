
const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { allMyNotifications } = require('../controllers/notification.controller');


const router = Router();


//Agrega un like a una publicación
router.get('/all/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], allMyNotifications)


module.exports = router;