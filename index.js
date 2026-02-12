// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const User = require("./models/User");
// const Expense = require("./models/Expense");
// const auth = require("./middleware/auth");

// const generateOTP = require("./utils/generateOTP");
// const sendOTP = require("./utils/sendOTP");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log("DB Error:", err));

// // Test Route
// app.get("/", (req, res) => {
//   res.send("Backend Running");
// });

// // ================= REGISTER =================
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     await user.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ================= LOGIN =================
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // ✅ field check
//     if (!email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ token });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// // //=====Send OTP =====
// // app.post("/send-otp", async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email required" });
// //     }

// //     const otp = generateOTP();

// //     let user = await User.findOne({ email });
// //     if (!user) {
// //       user = new User({ email });
// //     }

// //     user.otp = otp;
// //     user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
// //     await user.save();

// //     await sendOTP(email, otp);

// //     res.json({ message: "OTP sent successfully" });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });

// // //============= verify otp ==========
// // app.post("/verify-otp", async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;

// //     const user = await User.findOne({ email });

// //     if (
// //       !user ||
// //       user.otp !== otp ||
// //       user.otpExpiry < Date.now()
// //     ) {
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     }

// //     user.otp = null;
// //     user.otpExpiry = null;
// //     await user.save();

// //     const token = jwt.sign(
// //       { id: user._id },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({ token });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });
// // ============ login password =============
// app.post("/login-password", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: "All fields required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     // ✅ Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.otp = otp;
//     user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
//     await user.save();

//     // ✅ Send OTP
//     await sendOTP(email, otp);

//     res.json({ message: "OTP sent to email" });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
// // ================== verify password ==========
// app.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (
//       !user ||
//       user.otp !== otp ||
//       user.otpExpiry < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // ✅ Clear OTP
//     user.otp = null;
//     user.otpExpiry = null;
//     await user.save();

//     // ✅ Generate JWT
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ token });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ================= ADD EXPENSE =================
// app.post("/add-expense", auth, async (req, res) => {
//   try {
//     console.log("USER ID:", req.userId); // 👈 ab undefined nahi hoga

//     const { title, amount, category, type } = req.body;

//     const expense = new Expense({
//       userId: req.userId,
//       title,
//       amount,
//       category,
//       type,
//     });

//     await expense.save();
//     res.json({ message: "Expense added" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // ================= GET EXPENSES =================
// app.get("/expenses", auth, async (req, res) => {
//   try {
//     const expenses = await Expense.find({ userId: req.userId });
//     res.json(expenses);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ================= DELETE EXPENSE =================
// app.delete("/expense/:id", auth, async (req, res) => {
//   try {
//     await Expense.findByIdAndDelete(req.params.id);
//     res.json({ message: "Expense deleted" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // UPDATE expense
// app.put("/expense/:id", auth, async (req, res) => {
//   try {
//     const { title, amount, category, type } = req.body;

//     const expense = await Expense.findOneAndUpdate(
//       { _id: req.params.id, userId: req.userId }, // security
//       { title, amount, category, type },
//       { new: true }
//     );

//     if (!expense) {
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     res.json({ message: "Expense updated", expense });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // Server Start
// app.listen(5000, () => {
//   console.log("Server started on port 5000");
// });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Expense = require("./models/Expense");
const auth = require("./middleware/auth");

const generateOTP = require("./utils/generateOTP");
const sendOTP = require("./utils/sendOTP");

const otpGenerator = require("otp-generator");
const sendOTPEmail = require("./utils/sendEmail");

const app = express();
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));
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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    specialChars: false,
  });

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendOTPEmail(email, otp);

  res.json({ message: "OTP sent to email" });
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

  await sendOTPEmail(email, otp);

  res.json({ message: "OTP sent to email" });
});

//================== Forget pass Verify otp ===
app.post("/api/verify-forgot-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (
    !user ||
    user.otp !== otp ||
    user.otpExpiry < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
});

//==============reset password =============
app.post("/api/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: "Password reset successful" });
});

// ================= EXPENSE ROUTES =================
app.post("/add-expense", auth, async (req, res) => {
  const { title, amount, category, type } = req.body;

  const expense = new Expense({
    userId: req.userId,
    title,
    amount,
    category,
    type,
  });

  await expense.save();
  res.json({ message: "Expense added" });
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
  const { title, amount, category, type } = req.body;

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { title, amount, category, type },
    { new: true }
  );

  res.json({ message: "Expense updated", expense });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Server running")
);

