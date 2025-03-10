import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();

// create the transporter
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port:587,
    auth:{
        user: process.env.SMTP_USER,
        pass:process.env.SMTP_PASS,
    }
})

// Test the connection (optional)
transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to SMTP server:", error);
    } else {
        console.log("SMTP server is ready to send emails.");
    }
});

export default transporter;