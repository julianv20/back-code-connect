const { Router } = require('express');
const { check } = require('express-validator');


const { actualizarDatosProfile } = require('../controllers/configuration.controller');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const  router = Router();


router.put('/update/data/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], actualizarDatosProfile);



module.exports = router;