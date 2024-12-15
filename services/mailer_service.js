const nodemailer = require('nodemailer');
const config = require("../config.json");
const { loadSecrets } = require("../aws/ssm-helper")
require("dotenv").config();

const mailerConfig = config.mailer;
let mailTransporter = null;

async function initMailer() {
    const mailerPassword = process.env.ENVIRONMENT === "local" 
        ? process.env.MAILER_PASSWORD 
        : await loadSecrets(config.aws.param_store_region, ['/catbytes_webplatform/mailer_password'], true)['mailer_password']
    
    mailTransporter = nodemailer.createTransport({
        host: mailerConfig.out_host,
        port: mailerConfig.out_port,
        secure: false,
        auth: {
          user: mailerConfig.user,
          pass: mailerPassword,
        }
    });
}

const sendMail = async (to, subject, content) => {
    const mailOptions = {
        from: mailerConfig.user,
        to,
        subject,
        html: content,
    };
    return mailTransporter.sendMail(mailOptions);
};

async function sendApplicationApprovedEmail(email, name) {
    // todo change template to real
    const body = `
        <h2>Welcome to CatBytes!</h2>
        <p>Hello, ${name}, we're happy to notify your application to CatBytes has been approved! :) </p>`;

    return await sendMail(email, "Welcome to CatBytes!", body);
}

async function sendApplicationRejectedEmail(email, name) {
    // todo change template to real
    const body = `
        <h2>Uh-oh!</h2>
        <p>Hello, ${name}, unfortunately your application to CatBytes has been rejected :( </p>`;

    return await sendMail(email, "Thank you for applying to CatBytes", body);
}

module.exports = { initMailer, sendApplicationApprovedEmail, sendApplicationRejectedEmail};