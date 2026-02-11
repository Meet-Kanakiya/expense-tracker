// import nodemailer from "nodemailer";

// export const sendOTP = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: "Expense App",
//     to: email,
//     subject: "Your Login OTP",
//     html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
//   });
// };

module.exports = async function sendOTP(email, otp) {
  // Abhi ke liye console (later email/SMS)
  console.log(`OTP for ${email}: ${otp}`);
};
