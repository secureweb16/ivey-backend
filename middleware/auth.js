const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the user info to the request object
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
