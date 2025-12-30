const jwt = require('jsonwebtoken');

const verifyDeviceToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  jwt.verify(token, process.env.DEVICE_JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: 'Invalid or expired token' });

    if (decoded.type !== "device")
      return res.status(403).json({ message: "Not a device token" });

    req.device = decoded;
    next();
  });
};
module.exports={verifyDeviceToken};