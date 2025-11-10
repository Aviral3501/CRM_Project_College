// import nodemailer from "nodemailer";
// import dotenv from "dotenv";


// dotenv.config();

// // create the transporter
// const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     port:587,
//     secure:false,
//     auth:{
//         user: process.env.SMTP_USER,
//         pass:process.env.SMTP_PASS,
//     },
//     tls: {
//         rejectUnauthorized: false // optional; helps on some cloud hosts like Render
//       }
// })

// // Test the connection (optional)
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Error connecting to SMTP server:", error);
//     } else {
//         console.log("SMTP server is ready to send emails.");
//     }
// });

// export default transporter;