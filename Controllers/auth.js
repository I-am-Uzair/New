const User = require("../Models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport({
  service: "Mail Service",
  auth: {
    user: "Your E Mail Addres",
    pass: "Password",
  },
});

exports.getLoginPage = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};
exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "SingUp",
    path: "/signup",
    errorMessage: message,
    oldInput: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationError: [],
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid Email or Password",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt.compare(password, user.password).then((passwordMatch) => {
        if (passwordMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log("Error while saving Session ", err);
            res.redirect("/");
          });
        }
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid Password",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      });
    })
    .catch((err) => {
      console.log("User with this email doesn't exist", err);
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("Error while destroying the session", err);
    res.redirect("/");
  });
};

exports.postSingUp = (req, res, next) => {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "SignUp",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationError: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter
        .sendMail({
          to: email,
          from: "Your E-Mail",
          subject: "Sign Up Successfully",
          html: "<h2> You successfully sign up! Thanks for your  Registeration. <h2>",
        })
        .catch((err) => {
          {
            console.log("Email faild to Send", err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          }
        });
    });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("error while generating Token", err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Account Found With That Email!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "Your E-Mail",
          subject: "Password Reset",
          html: `<p> You Requested for Password Reseting. </p>
          <p>Click this <a href = "http://localhost:3000/reset/${token}">link</a> To Reset The Password</P>`,
        });
      })
      .catch((err) => {
        {
          console.log("Error while finding User in Data Base with email", err);
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        }
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: message,
        resetToken: token,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      {
        console.log("User Doesn't exist", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.resetToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      {
        console.log("User Doesn't exist", err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};
