const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-digit App Password
    },
});


// Used in Both reset password link and Login OTP
const sendEmail = async (to, subject, html) => {
    try {
        console.log("Using EMAIL:", process.env.EMAIL_USER); // debug
        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Mail Error:", error);
        throw error;
    }
};

module.exports = sendEmail;