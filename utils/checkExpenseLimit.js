const { sendWarningEmail } = require("./sendEmail");

const checkExpenseLimit = async (user, totalIncome, totalExpense) => {

  console.log("Total Income:", totalIncome);
  console.log("Total Expense:", totalExpense);

  if (!totalIncome || totalIncome === 0) return;

  const percentage = (totalExpense / totalIncome) * 100;

  console.log("Percentage:", percentage);

  if (percentage >= 80 && percentage < 100) {
    console.log("⚠ 80% Warning Triggered");
    await sendWarningEmail(user.email, totalExpense, totalIncome);
  }

  if (percentage >= 100) {
    console.log("🚨 Budget Limit Crossed");
    await sendWarningEmail(user.email, totalExpense, totalIncome);
  }
};

module.exports = checkExpenseLimit;