
const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const { createGroups, joinToGroup, getGroups, leaveGroup } = require('../controllers/gruop.controller');


const router = Router();

router.post('/join/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], joinToGroup)


router.post('/create', createGroups)


router.get('/get', [
    validarJWT,
    validarCampos
], getGroups)


router.put('/leave/:id', [
    validarJWT,
    validarCampos
], leaveGroup)


module.exports = router;