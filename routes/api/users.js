const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../../middleware/authenticate");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const transporter = require("../../models/transporter");
// user
const User = require("../../models/userSchema");
const {
  registrationSchema,
  loginSchema,
  resendVerificationSchema,
} = require("../../models/userValidation");
// user
// multer
const multer = require("multer");
const jimp = require("jimp");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// multer

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" });
    const verificationToken = nanoid();
    const newUser = User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    const mailOptions = {
      from: "adriannastal9@gmail.com",
      to: "adriannastal9@gmail.com",
      subject: "Account Verification",
      text: `Verify email with code : ${verificationToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    if (!user.verify) {
      return res.status(401).json({
        message: "Email is not verified. Please verify your email first.",
      });
    }
    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });

    user.token = token;

    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        verify: user.verify,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", authenticate, async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/current", authenticate, async (req, res, next) => {
  try {
    res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const image = await jimp.read(req.file.buffer);
      await image
        .cover(250, 250)
        .quality(90)
        .writeAsync(`public/avatars/${req.user._id}.jpg`);

      req.user.avatarURL = `/avatars/${req.user._id}.jpg`;
      await req.user.save();

      res.status(200).json({
        avatarURL: req.user.avatarURL,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});
router.post("/verify", async (req, res, next) => {
  try {
    const { error, value } = resendVerificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email } = value;
    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationLink = `${process.env.CLIENT_URL}/users/verify/${user.verificationToken}`;
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Account Verification",
      text: `Click the following link to verify your account: ${verificationLink}`,
      html: `<p>Click the following link to verify your account: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Error re-sending verification email" });
      }
      console.log(`Email sent: ${info.response}`);
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
