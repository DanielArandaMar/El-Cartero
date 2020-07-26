
'use strict'

const nodemailer = require('nodemailer');

class Mailer{

    /** DEFINIMOS EL TRANSPORTADOR Y CONFIGURACIONES INICIALES  */
    constructor(){

        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'geraldine.bergnaum@ethereal.email', // generated ethereal user
                pass: '7v7u4zbS9g2BxcjmUZ', // generated ethereal password
            },
        });

        // from ->debe estar el servicio que yo estoy promocionanmdo
        this.mailOptions = {
            from: '"El cartero app" <elcartero@gmail.com>',
        };
    }



    /** AQUI TENEMOS QUE ENVIAR NUESTRO CORREO */
    sendMail(options){


        let optionsConfig = {
            ...this.mailOptions,
            ...options
        };

        this.transporter.sendMail(optionsConfig, (error, info) => {
            if(error) return console.log(error);

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        });


    }

}

module.exports = new Mailer();
