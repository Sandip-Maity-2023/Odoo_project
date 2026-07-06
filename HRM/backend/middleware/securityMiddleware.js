const loginAttempts = new Map();

const loginLimiter = (req, res, next) => {
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 8;
  const attempts = (loginAttempts.get(key) || []).filter((time) => now - time < windowMs);

  if (attempts.length >= maxAttempts) {
    return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
  }

  attempts.push(now);
  loginAttempts.set(key, attempts);
  next();
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = { loginLimiter, securityHeaders };
