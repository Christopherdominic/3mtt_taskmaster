const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    console.log('Incoming Request:', {
        url: req.url,
        method: req.method,
        headers: req.headers, // Debug log to see all headers
    });

    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Validate the Authorization header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authorization Header Missing or Malformed');
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token); // Debug log for the extracted token

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Attach user info to the request object
        req.user = user;
        console.log('JWT Verified, User:', user);

        next();
    });
};

module.exports = { authenticateJWT };

