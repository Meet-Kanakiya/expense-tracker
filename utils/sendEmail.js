const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);
// ================= WARNING EMAIL =================
const sendWarningEmail = async (email, totalExpense, budget) => {

  const htmlContent = `
    <div style="font-family:Arial;padding:20px">
      <h2 style="color:red;">⚠ Budget Warning</h2>
      <p>You are close to exceeding your budget.</p>
      <h3>Total Expense: ₹${totalExpense}</h3>
      <h3>Budget: ₹${budget}</h3>
      <p>Please control your expenses.</p>
    </div>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM },
    to: [{ email }],
    subject: "⚠ Budget Limit Warning",
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Warning Email sent via Brevo");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
    throw error;
  }
};
// ================= OTP EMAIL =================
const sendOTPEmail = async (email, otp, type = "login") => {

  const subject =
    type === "reset"
      ? "Reset Password OTP"
      : "Login OTP";

  const htmlContent = `
    <div style="font-family:Arial;padding:20px">
      <h2>OTP Verification</h2>
      <h1 style="letter-spacing:5px">${otp}</h1>
      <p>Valid for 5 minutes.</p>
    </div>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM },
    to: [{ email }],
    subject,
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP Email sent via Brevo");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
    throw error;
  }
};

// ================= BUDGET EMAIL =================
const sendBudgetEmail = async (email, budget) => {

  const htmlContent = `
    <div style="font-family:Arial;padding:20px">
      <h2>Budget Updated 💰</h2>
      <h3>Your new budget is ₹${budget}</h3>
    </div>
  `;

  const sendSmtpEmail = {
    sender: { email: process.env.EMAIL_FROM },
    to: [{ email }],
    subject: "Budget Updated Successfully",
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Budget Email sent via Brevo");
  } catch (error) {
    console.error("❌ Brevo Error:", error.response?.body || error.message);
    return false; // do not crash server
  
    throw error;
}

console.log("BREVO KEY:", process.env.BREVO_API_KEY);
console.log("EMAIL FROM:", process.env.EMAIL_FROM);
};

module.exports = { sendOTPEmail, sendBudgetEmail, sendWarningEmail };