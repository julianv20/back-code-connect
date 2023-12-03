const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { homeGetUser } = require('../controllers/home.controller');
const { validarJWT } = require('../middlewares/validar-jwt');



const  router = Router();


router.get('/',[
    validarJWT,
    validarCampos
], homeGetUser);



module.exports = router;