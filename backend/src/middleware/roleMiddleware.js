/**
 * Role-based access control middleware
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
                yourRole: req.user.role,
            });
        }

        next();
    };
};

/**
 * Check if user is owner of resource OR admin
 * Usage: isOwnerOrAdmin(req.user, resourceOwnerId)
 */
const isOwnerOrAdmin = (user, ownerId) => {
    return user.role === 'admin' || user.id === ownerId;
};

module.exports = { authorize, isOwnerOrAdmin };