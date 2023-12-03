const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { actualizarImages, visitUser } = require('../controllers/profile.controller');
const { validarArchivoSubir } = require('../middlewares/validar-archivo');
const { validarExtensionArchivo } = require('../middlewares/validar-extension-archivo');



const router = Router();

router.put('/update/:image/:id', [
    validarArchivoSubir,
    validarExtensionArchivo,
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], actualizarImages);


router.get('/visit/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], visitUser);


module.exports = router;