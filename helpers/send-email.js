

const nodemailer = require('nodemailer');
require('dotenv').config();


// Configura el transporte de correo
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: "codeconnect.config@gmail.com",
    pass: process.env.PASSWORD_GOOGLE_EMAILS,
  },
});


// Función para enviar correo electrónico con contenido HTML
const sendEmail = async ( email, name  ) => {  

  // Configura los detalles del correo electrónico con contenido HTML
  const mailOptions = {
    from: '"Code Connect 💻" <codeconnect.config@gmail.com>', 
    // La dirección de correo del destinatario
    to: email, 
    subject: 'Registro code connect',
    html: `<h1>Verificación de registro en code connect</h1><p>Hola ${ name }, nos alegra que te hayas registrado en code connect, esperamos que disfrutes de nuestra aplicación.</p>`,
  };

  try {

    // Envía el correo electrónico y espera a que se complete
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.response);
    return 'Correo enviado con éxito';

  } catch (error) {

    console.error('Error al enviar el correo:', error);
    throw new Error('Error al enviar el correo');

  }
  
}

module.exports = sendEmail;
