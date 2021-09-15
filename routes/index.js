const express = require("express");
const router = express.Router();
const User = require("../config/db").models.User;
const passport = require("passport");
const { genPassword } = require("../lib/passwordUtils");
const { isAuth, isAdmin } = require("./authMiddleware");
const { body, validationResult } = require("express-validator");
const Request = require("../config/db").models.Request;
/* GET home page. */
router.get("/", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("index", {
      title: "Express",
      authenticated: req.isAuthenticated(),
    });
  }
});
router.get("/signup", async (req, res, next) => {
  res.render("sign-up-form", {
    title: "Sign Up",
  });
});
router.post(
  "/signup",
  body("username", "Empty name")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("confirmPassword")
    .trim()
    .isLength({
      min: 4,
      max: 16,
    })
    .withMessage("Password must be between 4 to 16 characters")
    .custom(async (confirmPassword, { req }) => {
      const password = req.body.password;

      if (password !== confirmPassword) {
        throw new Error("Passwords must be same");
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign-up-form", {
        username: req.body.username,
        password: req.body.password,
        errors: errors.array(),
      });
    } else {
      const saltHash = genPassword(req.body.password);
      const hash = saltHash.hash;
      const salt = saltHash.salt;
      const user = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
        member: false,
        admin: false,
        adminMessage: "Welcome user",
      }).save((user) => {});
      res.redirect("/login");
    }
  }
);
router.get("/login", async (req, res, next) => {
  res.render("login-form", {
    title: "Login",
  });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/dashboard",
  })
);
router.get("/logout", async (req, res, next) => {
  req.logout();
  res.redirect("/");
});
router.get("/dashboard", isAuth, async (req, res, next) => {
  const context = req.session.context;
  req.session.context = "";
  res.render("dashboard", { context: context });
});

router.post("/request", isAuth, async (req, res, next) => {
  const present = await Request.exists({
    identity: /* "613dd8103e7b34c4d4d93ca3" */ req.user._id,
  });

  if (!present) {
    let request = new Request({
      identity: res.req.user._id,
      Type: req.body.permission,
    });
    request.save((request) => {
      req.session.context = `Permit for ${req.body.permission} access requested`;
      res.redirect("/dashboard");
    });
  } else {
    req.session.context = `Duplicate request for ${req.body.permission} ignored`;

    res.redirect("/dashboard");
  }
});
router.get("/request", isAdmin, async (req, res, next) => {
  let Requests = await Request.find({}).populate("identity").lean();
  res.render("adminRoute", { Requests: Requests });
});
router.get("/request/accept/member/:id", isAdmin, async (req, res, next) => {
  const filter = { _id: req.params.id };

  let checkMessage = await User.findOne(
    { _id: req.params.id },
    {
      member: 1,
    }
  );
  if (checkMessage.member) {
    let user = User.findOneAndUpdate(
      filter,
      { adminMessage: `You have messaging rights already` },
      { new: true }
    );

    Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
      if (err) {
        next(err);
      }
    });
    res.redirect("/request");
  } else {
    const update = { member: true };

    // `doc` is the document _after_ `update` was applied because of
    // `new: true`
    let user = await User.findOneAndUpdate(filter, update, {
      new: true,
    });
    Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
      if (err) {
        next(err);
      }
    });

    res.redirect("/request");
  }
});

router.get("/request/accept/admin/:id", isAdmin, async (req, res, next) => {
  const filter = { _id: req.params.id };

  let checkAdmin = await User.findOne(
    { _id: req.params.id },
    {
      admin: 1,
    }
  );
  if (checkAdmin.member) {
    let user = User.findOneAndUpdate(
      filter,
      { adminMessage: `You have admin rights already` },
      { new: true }
    );

    Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
      if (err) {
        next(err);
      }
    });
    res.redirect("/request");
  } else {
    const update = { admin: true };

    // `doc` is the document _after_ `update` was applied because of
    // `new: true`
    let user = await User.findOneAndUpdate(filter, update, {
      new: true,
    });
    Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
      if (err) {
        next(err);
      }
    });

    res.redirect("/request");
  }
});

router.get("/request/decline/member/:id", isAdmin, async (req, res, next) => {
  const filter = { _id: req.params.id };

  let user = User.findOneAndUpdate(
    filter,
    { adminMessage: `Your member access request denied by admin` },
    { new: true }
  );

  Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
    if (err) {
      next(err);
    }
  });
  res.redirect("/request");
});

router.get("/request/decline/admin/:id", isAdmin, async (req, res, next) => {
  const filter = { _id: req.params.id };

  let user = User.findOneAndUpdate(
    filter,
    { adminMessage: `Your admin access request denied by admin` },
    { new: true }
  );

  Request.findOneAndDelete({ identity: req.params.id }, function (err, docs) {
    if (err) {
      next(err);
    }
  });
  res.redirect("/request");
});

module.exports = router;
