import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options)=>{
  const mailGenerator = new Mailgen(
    {
      theme:"default",
      product:{
        name:"Task manager",
        link:"https://taskmanagerlink.com"
      }
    });
  
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });

  const mail ={
    from:"projectmanagement@mail.com",
    to:options.email,
    subject:options.subject,
    text:emailTextual,
    html:emailHTML,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Error : ",error);
    throw new Apierror(505, "Something is wrong in email sending");
  }

}

const emailVerificationTemplate = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Management website",
      action: {
        instructions: "To verify your email please click on following button",
        button: {
          color: "#0a9f27",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro: "Need any help, or have any question? just reply to this mail",
    },
  };
};

const forgotEmailTemplate = (username, forgotUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions: "To reset your password click on following button",
        button: {
          color: "#0a9f27",
          text: "Reset password",
          link: forgotUrl,
        },
      },
      outro: "Need any help, or have any question? just reply to this mail",
    },
  };
};

export {
    emailVerificationTemplate,
    forgotEmailTemplate,
    sendEmail,
};