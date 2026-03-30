const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: err.errors.map(e => e.message).join(', ')
        });
    }

    // Sequelize Optimistic Locking Error
    if (err.name === 'SequelizeOptimisticLockError') {
        return res.status(409).json({
            error: 'Conflict: The entry was updated by another request. Please try again.'
        });
    }

    res.status(statusCode).json({
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
