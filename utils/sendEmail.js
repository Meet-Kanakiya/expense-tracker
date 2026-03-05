const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ================= COMMON TEMPLATE =================
const emailLayout = (title, content) => {
  return `
  <div style="background:#f4f6f9;padding:40px;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,0.1)">
      
      <div style="background:#4f46e5;color:white;padding:20px;text-align:center">
        <h1 style="margin:0">Expense Tracker</h1>
      </div>

      <div style="padding:30px;text-align:center">
        <h2 style="color:#333">${title}</h2>
        ${content}
      </div>

      <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#777">
        © ${new Date().getFullYear()} Expense Tracker System
      </div>

    </div>
  </div>
  `;
};



// ================= OTP EMAIL =================
const sendOTPEmail = async (email, otp, type = "login") => {

  const subject = type === "reset"
    ? "Reset Password OTP"
    : "Login OTP";

  const content = `
    <p style="color:#555">Use the OTP below to continue.</p>

    <div style="
      font-size:32px;
      letter-spacing:8px;
      font-weight:bold;
      background:#eef2ff;
      padding:15px;
      border-radius:8px;
      display:inline-block;
      margin:20px 0;
      color:#4f46e5;
    ">
      ${otp}
    </div>

    <p style="color:#777">This OTP is valid for <b>5 minutes</b>.</p>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM, name: "Expense Tracker" },
    to: [{ email }],
    subject,
    htmlContent: emailLayout("OTP Verification", content),
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP Email sent");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
  }
};



// ================= BUDGET EMAIL =================
const sendBudgetEmail = async (email, budget) => {

  const content = `
    <p style="color:#555">Your budget has been successfully updated.</p>

    <h1 style="color:#16a34a;margin:20px 0">₹${budget}</h1>

    <p style="color:#777">Track your expenses wisely.</p>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM, name: "Expense Tracker" },
    to: [{ email }],
    subject: "Budget Updated Successfully",
    htmlContent: emailLayout("Budget Updated 💰", content),
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Budget Email sent");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
  }
};



// ================= WARNING EMAIL =================
const sendWarningEmail = async (email, totalExpense, budget) => {

  const content = `
    <p style="color:#555">You are close to exceeding your budget.</p>

    <p style="font-size:18px">
      <b>Total Expense:</b> ₹${totalExpense}
    </p>

    <p style="font-size:18px;color:red">
      <b>Budget:</b> ₹${budget}
    </p>

    <p style="color:#777">Please control your spending.</p>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM, name: "Expense Tracker" },
    to: [{ email }],
    subject: "⚠ Budget Limit Warning",
    htmlContent: emailLayout("Budget Warning ⚠", content),
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Warning Email sent");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
  }
};

module.exports = { sendOTPEmail, sendBudgetEmail, sendWarningEmail };