const { sendWarningEmail } = require("./sendEmail");

const checkExpenseLimit = async (user, totalIncome, totalExpense) => {

  if (totalIncome === 0) return;

  const percentage = (totalExpense / totalIncome) * 100;

  console.log("Income:", totalIncome);
  console.log("Expense:", totalExpense);
  console.log("Percentage:", percentage);

  if (percentage >= 80 && percentage < 100) {
    console.log("80% Warning Triggered");
    await sendWarningEmail(user.email, totalExpense ,user.budget);
  }

  if (percentage >= 100) {
    console.log("100% Limit Crossed");
    await sendWarningEmail(user.email, totalExpense ,user.budget);
  }
};

module.exports = checkExpenseLimit;