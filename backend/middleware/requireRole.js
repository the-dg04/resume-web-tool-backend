module.exports = {
  requireUser: (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: "forbidden" });
    next();
  },
  requireCompany: (req, res, next) => {
    if (!req.company) return res.status(403).json({ message: "forbidden" });
    next();
  },
};


