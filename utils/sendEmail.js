const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, otp, type = "login") => {
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

      <hr />
      <p style="text-align:center; font-size:12px; color:#aaa;">
        © ${new Date().getFullYear()} Expense Tracker
      </p>
    </div>
  </div>
  `;

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

  const msg = {
    to: email,
    from: "smart.todo.system@gmail.com", // must match verified sender
    subject: isReset ? "Reset Password OTP" : "Login OTP",
    html: isReset ? resetTemplate : loginTemplate,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid");
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = sendOTPEmail;