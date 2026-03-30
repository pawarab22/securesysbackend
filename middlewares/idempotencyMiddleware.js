const idempotencyCache = new Map();

const ensureIdempotency = (req, res, next) => {
    // Only apply to POST requests
    if (req.method !== 'POST') {
        return next();
    }

    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
        // Idempotency key is optional, if not provided proceed
        return next();
    }

    if (idempotencyCache.has(idempotencyKey)) {
        // Return cached response
        const cachedResponse = idempotencyCache.get(idempotencyKey);
        return res.status(cachedResponse.statusCode).json(cachedResponse.data);
    }

    // Capture the original response to cache it
    const originalJson = res.json;
    res.json = function (data) {
        idempotencyCache.set(idempotencyKey, {
            statusCode: res.statusCode,
            data
        });
        
        // Cleanup after some time (1 hour)
        setTimeout(() => {
            idempotencyCache.delete(idempotencyKey);
        }, 1000 * 60 * 60);

        return originalJson.call(res, data);
    };

    next();
};

module.exports = { ensureIdempotency };
