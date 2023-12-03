const { Router } = require('express');
const { check } = require('express-validator');

const { userRegister, userLogin } = require('../controllers/auth.autentication.controller');
const { validarCampos } = require('../middlewares/validar-campos');


const  router = Router();


router.post('/register',[
    check('name', 'The name is required').not().isEmpty(),
    check('lastName', 'The last name is required').not().isEmpty(),
    check('country', 'The country is required').not().isEmpty(),
    check('phoneNumber', 'The phone number is required').not().isEmpty(),
    // check('phoneNumber', 'The email exist').custom( existePhoneNumber ),
    check('email', 'The email not is valid').isEmail().not().isEmpty(),
    // check('email', 'The email exist').custom( exiteEmail ),
    check('password', 'the password is required and must have more than 8 letters').not().isEmpty().isLength({ min: 8 }),
    validarCampos

] ,userRegister);


router.post('/login', [
    check('email', 'The email not is valid').isEmail().not().isEmpty(),
    check('password', 'the password is required').not().isEmpty(),
    validarCampos
],userLogin);



module.exports = router;