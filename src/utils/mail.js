import Mailgen from "mailgen";

const emailVerificationTemplate = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to you website",
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
};