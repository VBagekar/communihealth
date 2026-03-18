const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Read Bearer token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload to req.user
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const roleCheck = (rolesArray) => {
  return async (req, res, next) => {
    try {
      // Ensure the user exists from verifyToken middleware
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'User info not found in request' });
      }

      // Check if user's role is in the allowed roles array
      if (!rolesArray.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error.message);
      return res.status(500).json({ message: 'Internal server error during role validation' });
    }
  };
};

module.exports = {
  verifyToken,
  roleCheck
};
