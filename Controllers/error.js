exports.get404 = (req, res) => {
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/page not found",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.get500 = (req, res) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
