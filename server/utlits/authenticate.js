const EmployeeModel = require("../models/Employee.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization; // "Bearer token"
  // console.log({ authHeader });

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

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ message: "Forbidden: Refresh token not provided" });
    }

    jwt.verify(refreshToken, refreshSecretKey, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
      }

      const employeeId = decoded.id;

      const findEmployee = await EmployeeModel.findById(employeeId);
      if (!findEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const newAccessToken = jwt.sign(
        {
          id: findEmployee._id,
          username: findEmployee.username,
          isAdmin: findEmployee.isAdmin,
          isActive: findEmployee.isActive,
          isVerified: findEmployee.isVerified,
          role: findEmployee.role,
          shift: findEmployee.shift,
        },
        secretKey,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authenticateToken, refreshAccessToken };

