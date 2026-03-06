const { sendWarningEmail } = require("./sendEmail");

const checkExpenseLimit = async (user, totalIncome, totalExpense) => {

  console.log("Budget:", user.budget);
  console.log("Total Expense:", totalExpense);

  if (!user.budget || user.budget === 0) return;

  const percentage = (totalExpense / user.budget) * 100;

  if (percentage >= 80 && percentage < 100) {
    console.log("⚠ 80% Warning Triggered");
    await sendWarningEmail(user.email, totalExpense, user.budget);
  }

  if (percentage >= 100) {
    console.log("🚨 Budget Limit Crossed");
    await sendWarningEmail(user.email, totalExpense, user.budget);
  }
};

module.exports = checkExpenseLimit;