const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    console.log('Incoming Request:', {
        url: req.url,
        method: req.method,
        headers: req.headers, // Debug log to see all headers
    });

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.error('Authorization Header Missing');
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateJWT };

