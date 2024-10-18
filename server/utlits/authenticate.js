const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization; // "Bearer token"
  console.log({ authHeader });

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: Token unfound" }); // Unauthorized
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" }); // Unauthorized
  }

  jwt.verify(token, secretKey, (err, employee) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" }); // Forbidden
    }

    // Check if employee object exists and has required properties
    if (
      !employee ||
      typeof employee.role !== "string" ||
      typeof employee.isAdmin !== "boolean" ||
      typeof employee.isActive !== "boolean"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid employee information in token" }); // Forbidden
    }

    // Check if employee is admin and active
    if (!employee.isAdmin || !employee.isActive) {
      return res
        .status(403)
        .json({ message: "Forbidden: Employee not authorized" }); // Forbidden
    }

    req.employee = employee;
    next();
  });
};

module.exports = authenticateToken;
