// ══════════════════════════════════════════════════════════
//  auth.routes.js
// ══════════════════════════════════════════════════════════
const authRouter = require("express").Router();
const { body } = require("express-validator");
const authCtrl = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

authRouter.post("/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["student", "owner"]).withMessage("Role must be student or owner"),
  ],
  authCtrl.register
);

authRouter.post("/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authCtrl.login
);

authRouter.post("/logout", authCtrl.logout);
authRouter.get("/me", protect, authCtrl.getMe);
authRouter.patch("/update-password", protect, authCtrl.updatePassword);

module.exports = authRouter;