const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarExtensionArchivo } = require('../middlewares/validar-extension-archivo');

const { subirPublicacion, 
        getPublicacionesUsuario, 
        getAllGroupsPublications,
        getOnePublication,
        deletePublication,
        updatePublication } = require('../controllers/publication.controller');


const router = Router();

router.post('/new/:id', [
    validarExtensionArchivo,
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], subirPublicacion)
 

//Trae todas las publicaciónes que el usuario ha hecho en los grupos a lo que pertenece
router.get('/all/user/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], getPublicacionesUsuario)


//Trae todas las publicaciónes que han hecho en los grupos a los que pertenece
router.get('/all/groups/:id', [
    check('id', 'The ID not is valid').isMongoId(), 
    validarJWT,
    validarCampos
], getAllGroupsPublications)



//Trae todas las publicaciónes de un grupo en especifico
router.get('/one/:id', [
    check('id', 'The ID not is valid').isMongoId(),
], getOnePublication)



//Eliminar una publciación
router.delete('/delete/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], deletePublication)


//Actualizar una publciación
router.put('/update/:id', [
    check('id', 'The ID not is valid').isMongoId(),
    validarJWT,
    validarCampos
], updatePublication)

module.exports = router;
