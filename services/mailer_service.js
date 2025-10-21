const nodemailer = require('nodemailer');
const path = require('path');
const config = require('config');
const { loadSecrets } = require("../aws/ssm-helper");
const { APPL_STATUSES, MENTOR_STATUSES } = require("../utils");
const logger = require('../logger')(__filename);

require('dotenv').config({ path: '.env.local' });

const mailerConfig = config.mailer;
const webplatformUrl = config.platform_url;
let mailTransporter = null;

async function initMailer() {
  let mailerPassword;
  const nodemailerHbs = (await import('nodemailer-express-handlebars')).default;

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
 
  const handleBarOptions = {
    viewEngine: {
      extName: ".hbs",
      partialsDir: path.resolve("./templates/email"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./templates/email"),
    extName: ".hbs",
  };

  mailTransporter.use('compile', nodemailerHbs(handleBarOptions));
}

async function sendApplicationApprovedEmail(email, name, inviteLink) {
  const mailOptions = {
    from: mailerConfig.user,
    to: email,
    subject: "Welcome to CatBytes!",
    template: "member_application_approved_email",
    context: {
      name: name,
      catbytesLink: webplatformUrl,
      inviteLink: inviteLink,
      inviteExpirationNote: "Note: The link expires in 7 days!",
    },
    attachments: [
      {
        filename: "happy-cat.png",
        path: path.resolve("./templates/email/src/happy-cat.png"),
        cid: "happycat",
      },
    ],
  };

  return mailTransporter.sendMail(mailOptions);
}

async function sendApplicationRejectedEmail(email, name) {
  const mailOptions = {
    from: mailerConfig.user,
    to: email,
    subject: "Thank you for your application to CatBytes",
    template: "member_application_rejected_email",
    context: {
      name: name,
      catbytesLink: webplatformUrl,
    },
    attachments: [
      {
        filename: "sad-cat.png",
        path: path.resolve("./templates/email/src/sad-cat.png"),
        cid: "sadcat",
      },
    ],
  };

  return mailTransporter.sendMail(mailOptions);
}

async function sendMentorApplicationApprovedEmail(email, name) {
  const mailOptions = {
    from: mailerConfig.user,
    to: email,
    subject: "You are now a CatBytes Mentor!",
    template: "mentor_application_approved_email",
    context: {
      name: name,
      catbytesLink: webplatformUrl,
    },
    attachments: [
      {
        filename: "happy-cat.png",
        path: path.resolve("./templates/email/src/happy-cat.png"),
        cid: "happycat",
      },
    ],
  };

  return mailTransporter.sendMail(mailOptions);
}

async function sendMentorApplicationRejectedEmail(email, name) {
  const mailOptions = {
    from: mailerConfig.user,
    to: email,
    subject: "Thank you for your CatBytes mentor application",
    template: "mentor_application_rejected_email",
    context: {
      name: name,
      catbytesLink: webplatformUrl,
    },
    attachments: [
      {
        filename: "sad-cat.png",
        path: path.resolve("./templates/email/src/sad-cat.png"),
        cid: "sadcat",
      },
    ],
  };

  return mailTransporter.sendMail(mailOptions);
}

async function sendEmailOnApplicationStatusChange(email, name, status, inviteLink) {
  try {
    if (status === APPL_STATUSES.approved) {
      await sendApplicationApprovedEmail(email, name, inviteLink);
    } 
    else if (status === APPL_STATUSES.rejected) {
      await sendApplicationRejectedEmail(email, name);
    }
    else {
      logger.warn(`Not sending aplication status change email, because status ${status}
        is not in email-sending allow-list.`);
    }
  }
  catch (err) {
    // todo: add correct error processing: if "domain does not accept mail" - log it, 
    // put to some deadletter for future manual verification
    // if some other error - we should retry sending email - add queue
    logger.error(`Error sending email to ${email} on application status change: ${err.message}`);
  }
}

async function sendEmailOnNewMentorApplication(emails, mentorApplication) {
  try {
    const mailOptions = {
      from: mailerConfig.user,
      to: emails,
      subject: "New Mentor Application Submitted",
      template: "new_mentor_application_email",
      context: {
        name: mentorApplication.name,
        about: mentorApplication.about,
        reviewLink: `${webplatformUrl}applications`,
        catbytesLink: webplatformUrl,
      },
      attachments: [
        {
          filename: "happy-cat.png",
          path: path.resolve("./templates/email/src/happy-cat.png"),
          cid: "happycat",
        },
      ],
    };

    await mailTransporter.sendMail(mailOptions);
  }
  catch (err) {
    logger.error(`Error sending new mentor application email to ${emails}: ${err.message}`);
  }
}

async function sendEmailOnMentorApplicationStatusChange(email, name, status) {
  try {
    if (status === MENTOR_STATUSES.active) {
      await sendMentorApplicationApprovedEmail(email, name);
    } 
    else if (status === MENTOR_STATUSES.rejected) {
      await sendMentorApplicationRejectedEmail(email, name);
    }
    else {
      logger.warn(`Not sending aplication status change email, because status ${status}
        is not in email-sending allow-list.`);
    }
  }
  catch (err) {
    // todo: add correct error processing: if "domain does not accept mail" - log it, 
    // put to some deadletter for future manual verification
    // if some other error - we should retry sending email - add queue
    logger.error(`Error sending email to ${email} on mentor application status change: ${err.message}`);
  }
}

async function sendUserDeletionEmail(email, name) {
  try {
    const mailOptions = {
      from: mailerConfig.user,
      to: email,
      subject: "We're Sorry To See You Go",
      template: "user_deleted_email",
      context: {
        name: name,
      },
    };

    await mailTransporter.sendMail(mailOptions);
  }
  catch (err) {
    logger.error(`Error sending user deletion email to ${email}: ${err.message}`);
  }
}

module.exports = { 
  initMailer,
  sendEmailOnApplicationStatusChange,
  sendEmailOnNewMentorApplication,
  sendEmailOnMentorApplicationStatusChange,
  sendUserDeletionEmail
};