const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Import the User model

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ THE REAL FIX: Fetch the user from DB and attach to req
      const userId = decoded.id || decoded.userId;
      req.user = await User.findById(userId).select("-password"); // Attach full user object (minus password)
      req.userId = userId; // Keep this for routes that only need the ID

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      
      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;