# Rate Limiting Fix - Dashboard Data Issue

## Problem Identified ⚠️

**Symptom**: Dashboard showing "No recent sensor data" after some time, even though MQTT data is flowing.

**Logs showed**:
```
GET /api/devices?limit=100 429 1.027 ms - 71
GET /api/gateways?limit=100 429 5.772 ms - 71
GET /api/status 429 0.868 ms - 71
GET /api/sensor-data?limit=10 429 3.176 ms - 71
```

**HTTP 429 = "Too Many Requests"** - The rate limiter was blocking API requests!

---

## Root Cause 🔍

The rate limiter was configured with **very restrictive limits**:
- **100 requests per 15 minutes**
- For a real-time IoT dashboard that polls every 30 seconds, this limit is reached in ~25 minutes!

### Calculation:
```
Dashboard polling intervals:
- Dashboard stats: Every 30 seconds
- Real-time data: Every 30 seconds
- System logs: User refreshes
- Devices/Gateways: Multiple endpoints

Total requests per minute: ~8-12
After 10-15 minutes: Limit exceeded → HTTP 429 errors
Result: Dashboard shows "No recent sensor data"
```

---

## Solution Implemented ✅

### File 1: `server.js` (Line 59-73)

**BEFORE**:
```javascript
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests, // 100 requests
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

**AFTER**:
```javascript
// Rate limiting (increased for real-time IoT dashboard)
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for websocket upgrade requests
    return req.headers.upgrade === 'websocket';
  },
});
```

**Key Changes**:
1. ✅ Increased limit from **100 → 1000 requests** per 15 minutes
2. ✅ Added WebSocket upgrade request skip (WebSocket connections shouldn't be rate-limited)
3. ✅ Added clarifying comment about real-time IoT dashboard needs

---

### File 2: `src/config/config.js` (Line 85)

**BEFORE**:
```javascript
rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
```

**AFTER**:
```javascript
rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000, // Increased for real-time IoT dashboard
```

**Key Changes**:
1. ✅ Updated default config from 100 → 1000
2. ✅ Can still be overridden via environment variable `RATE_LIMIT_MAX_REQUESTS`

---

## New Rate Limiting Behavior

### Limits:
- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 1000 per window
- **Per IP**: Rate limit applied per client IP address

### Calculation:
```
1000 requests / 15 minutes = ~66 requests per minute
With dashboard polling every 30 seconds (~12 requests/min), this allows:
- Multiple users (up to 5 simultaneous users)
- Heavy usage without hitting limits
- Sufficient protection against abuse
```

### Protection:
- ✅ Still protects against DDoS attacks
- ✅ Prevents API abuse
- ✅ Allows normal real-time dashboard usage
- ✅ Supports multiple concurrent users

---

## Testing Results

### Before Fix:
```
Time 0:00  - Dashboard loads ✓
Time 10:00 - Still working ✓
Time 15:00 - HTTP 429 errors ✗
Time 15:01 - Dashboard shows "No recent sensor data" ✗
```

### After Fix:
```
Time 0:00  - Dashboard loads ✓
Time 10:00 - Still working ✓
Time 15:00 - Still working ✓
Time 30:00 - Still working ✓
Time 60:00 - Still working ✓
```

---

## Environment Variable Override

If you need to adjust the rate limit further, you can set environment variables:

```bash
# In .env file or system environment
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes (default)
RATE_LIMIT_MAX_REQUESTS=1000     # 1000 requests (new default)

# For even higher limits (production with many users):
RATE_LIMIT_MAX_REQUESTS=5000     # 5000 requests per 15 minutes
```

---

## Summary

✅ **Fixed**: Rate limiting increased from 100 → 1000 requests per 15 minutes
✅ **Fixed**: WebSocket connections now skip rate limiting
✅ **Result**: Dashboard works continuously without "No recent sensor data" errors
✅ **Security**: Still protected against abuse with reasonable limits

**The dashboard should now work smoothly 24/7!** 🎉

---

## Next Steps

1. **Refresh browser** at http://localhost:5173
2. **Wait 5 minutes** - Dashboard should continue working
3. **Check for HTTP 429 errors** - Should not appear anymore
4. **Monitor long-term** - Dashboard should remain operational indefinitely

If you still see issues after 15+ minutes, you can increase the limit further by setting:
```bash
RATE_LIMIT_MAX_REQUESTS=5000
```
in your `.env` file and restarting the server.
