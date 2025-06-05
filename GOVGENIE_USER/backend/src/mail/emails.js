import nodemailer from "nodemailer";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "govgenie.info@gmail.com",
    pass: process.env.APP_PASS 
  },
});

export const sendEmail = async ({ email, subject, message }) => {
  const mailOptions = {
    from: "govgenie.info@gmail.com",
    to: email,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.toString());
    throw new Error("Error sending email");
  }
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: "govgenie.info@gmail.com",
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error.toString());
    throw new Error("Error sending verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: "govgenie.info@gmail.com",
    to: email,
    subject: "Welcome to GovGenie",
    html: `<p>Hi ${name},</p><p>Welcome to GovGenie!</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully!");
  } catch (error) {
    console.error("Error sending welcome email:", error.toString());
    throw new Error("Error sending welcome email");
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const mailOptions = {
    from: "govgenie.info@gmail.com",
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully!");
  } catch (error) {
    console.error("Error sending password reset email:", error.toString());
    throw new Error("Error sending password reset email");
  }
};

export const sendResetSuccessEmail = async (email) => {
  const mailOptions = {
    from: "govgenie.info@gmail.com",
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent successfully!");
  } catch (error) {
    console.error(
      "Error sending password reset success email:",
      error.toString()
    );
    throw new Error("Error sending password reset success email");
  }
};
