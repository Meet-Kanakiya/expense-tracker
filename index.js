const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Expense = require("./models/Expense");
const auth = require("./middleware/auth");


const otpGenerator = require("otp-generator");

const { sendOTPEmail, sendBudgetEmail } = require("./utils/sendEmail");

const checkExpenseLimit = require("./utils/checkExpenseLimit");


const app = express();

app.use(cors());
app.use(express.json());

// ================= MongoDB =================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(400).json({ message: "User already exists" });

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ characters, include uppercase, lowercase, number and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      message: "User registered successfully"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN (PASSWORD STEP) =================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
    });

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("OTP:", otp);

    // 🔹 Safe Email Sending
    try {
      await sendOTPEmail(user.email, otp);
      console.log("OTP email sent");
    } catch (err) {
      console.error("Email failed but login continues:", err.message);
    }

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= VERIFY OTP =================
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

//=============== Forget Password ===========
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  try {
    await sendOTPEmail(user.email, otp);
    console.log("Email sent");
  } catch (err) {
    console.log("Email sending failed:", err.message);
  }

  res.json({ message: "OTP sent to email" });
});

//================== Forget pass Verify otp ===
app.post("/api/verify-forgot-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // ✅ OTP verified → remove it
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: "OTP verified" });
});

//==============reset password =============
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ characters, include uppercase, lowercase, number and special character",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= EXPENSE ROUTES =================
app.post("/add-expense", auth, async (req, res) => {
  try {
    const { title, amount, category, type } = req.body;

    const expense = new Expense({
      userId: req.userId,
      title,
      amount: Number(amount),
      category,
      type,
    });

    await expense.save();

    const user = await User.findById(req.userId).select("email budget");

    // 🔹 Calculate total income
    const totalIncomeData = await Expense.aggregate([
      { $match: { userId: user._id, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpenseData = await Expense.aggregate([
      { $match: { userId: user._id, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome = totalIncomeData[0]?.total || 0;
    const totalExpense = totalExpenseData[0]?.total || 0;

    // if (totalIncome === 0) {
    await checkExpenseLimit(user, totalIncome, totalExpense);
    // }

    res.json({ message: "Expense added" });

  } catch (error) {
    res.status(500).json({ message: "Error adding expense" });
  }
});

app.get("/expenses", auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json(expenses);
});

app.delete("/expense/:id", auth, async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted" });
});

app.put("/expense/:id", auth, async (req, res) => {
  try {
    const { title, amount, category, type } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, amount, category, type },
      { new: true }
    );

    res.json({ message: "Expense updated", expense });

  } catch (error) {
    res.status(500).json({ message: "Error updating expense" });
  }
});

// =============== Budget Add ========

app.put("/set-budget", auth, async (req, res) => {
  try {
    const { budget } = req.body;

    if (budget === undefined || budget === null || budget === "") {
      return res.status(400).json({ message: "Budget is required" });
    }

    const budgetValue = parseFloat(budget);

    if (isNaN(budgetValue)) {
      return res.status(400).json({ message: "Invalid budget value" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { budget: budgetValue },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // user.budget = budgetValue;
    // await user.save();

    try {
      await sendBudgetEmail(user.email, budgetValue);
    } catch (err) {
      console.error("Budget email failed:", err.message);
    }

    res.json({
      message: "Budget updated successfully",
      budget: budgetValue,
    });

  } catch (error) {
    console.error("SET BUDGET ERROR:", error);
    res.status(500).json({ message: "Error updating budget" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Server running")
);

