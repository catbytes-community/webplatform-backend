const nodemailer = require('nodemailer');
const config = require('config');
const { loadSecrets } = require("../aws/ssm-helper");
const { APPL_STATUSES } = require("../utils");
const discordService = require("../services/discord_bot_service");

require("dotenv").config();

const mailerConfig = config.mailer;
let mailTransporter = null;

async function initMailer() {
  let mailerPassword;

  if (process.env.ENVIRONMENT === "local") {
    mailerPassword = process.env.MAILER_PASSWORD;
  } else {
    const params = await loadSecrets(config.aws.param_store_region, ['/catbytes_webplatform/mailer_password'], true);
    mailerPassword = params['mailer_password'];
  }

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
  const inviteLink = await discordService.generateInviteLink();
  // todo change template to real
  const body = `
        <h2>Welcome to CatBytes!</h2>
        <p>Hello, ${name}, we're happy to notify your application to CatBytes has been approved! :) </p>
        <p>You can join our server using the link below!</p>
        <p>${inviteLink}</p> 
        <p>Note: the link is going to expire in 7 days!</p>`;
  return sendMail(email, "Welcome to CatBytes!", body);
}

async function sendApplicationRejectedEmail(email, name) {
  // todo change template to real
  const body = `
        <h2>Uh-oh!</h2>
        <p>Hello, ${name}, unfortunately your application to CatBytes has been rejected :( </p>`;

  return sendMail(email, "Thank you for applying to CatBytes", body);
}

async function sendEmailOnApplicationStatusChange(email, name, status, comment) {
  try {
    if (status === APPL_STATUSES.approved) {
      await sendApplicationApprovedEmail(email, name, comment);
    } 
    else if (status === APPL_STATUSES.rejected) {
      await sendApplicationRejectedEmail(email, name, comment);
    }
    else {
      console.log(`Not sending aplication status change email, because status ${status}
              is not in email-sending allow-list.`);
    }
  }
  catch (err) {
    // todo: add correct error processing: if "domain does not accept mail" - log it, 
    // put to some deadletter for future manual verification
    // if some other error - we should retry sending email - add queue
    console.error("Error sending email on application status change:", err.message);
  }
  
}

module.exports = { initMailer, sendEmailOnApplicationStatusChange, sendApplicationApprovedEmail  };