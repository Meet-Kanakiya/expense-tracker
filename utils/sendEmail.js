const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp, type = "login") => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 🔹 LOGIN OTP (simple)
  const loginTemplate = `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
    <div style="max-width:500px; margin:auto; background:white; border-radius:10px; padding:25px;">
      <h2 style="color:#2a5298; text-align:center;">🔐 OTP Verification</h2>

      <p>Hello 👋,</p>
      <p>Your One-Time Password (OTP) is:</p>

      <div style="
        font-size:28px;
        letter-spacing:6px;
        font-weight:bold;
        color:#1e3c72;
        text-align:center;
        margin:20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <b>5 minutes</b>.</p>

      <p style="color:#777; font-size:13px;">
        If you did not request this, please ignore this email.
      </p>

      <hr />
      <p style="text-align:center; font-size:12px; color:#aaa;">
        © ${new Date().getFullYear()} Expense Tracker
      </p>
    </div>
  </div>
  `;

  // 🔹 FORGOT PASSWORD OTP (stylish)
  const resetTemplate = `
    <div style="font-family: Arial; background:#0f172a; padding:20px;">
      <div style="max-width:400px;margin:auto;background:#020617;
        padding:20px;border-radius:10px;color:white">
        <h2 style="color:#38bdf8;text-align:center">Reset Password OTP</h2>
        <p>Hello 👋</p>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:6px;text-align:center">${otp}</h1>
        <p style="font-size:13px;color:#94a3b8">
          OTP valid for 5 minutes. Do not share it.
        </p>
      </div>
    </div>
  `;

  const isReset = type === "reset";

  try {
    await transporter.sendMail({

      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isReset ? "Reset Password OTP" : "Login OTP",
      html: isReset ? resetTemplate : loginTemplate,
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }

};

module.exports = sendOTPEmail;
