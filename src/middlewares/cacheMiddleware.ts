import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";

// Create the Redis client
const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? process.env.REDIS_HOST : "127.0.0.1",
  port: 6379,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Cache responses using the provided TTL
export const cacheMiddleware = (indexUrl: string, ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cacheKey = `cache:${req.originalUrl}`;
      const cacheIndexKey = `cache_index:${indexUrl}`;

      // Return a cached response when available
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        res.status(200).json(parsedData);
        return;
      }

      // Capture the original response when no cached response exists
      const originalJson = res.json;

      res.on("finish", async () => {
        try {
          // Cache the response and index its key for later invalidation
          await redis.setex(cacheKey, ttl, JSON.stringify(res.locals._cacheData));
          await redis.sadd(cacheIndexKey, cacheKey);
        } catch (e) {
          console.error("Failed to store cached response:", e);
        }
      });

      res.locals._cacheData = null;

      res.json = function (data: any): Response {
        res.locals._cacheData = data;
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      // Continue serving requests when Redis is unavailable
      next();
    }
  };
};

// Invalidate cache entries for the provided URL indexes
export const invalidateCache = (indexUrls: string[] | string | null = null) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targets: string[] = [];

      if (Array.isArray(indexUrls)) {
        targets.push(...indexUrls);
      } else if (typeof indexUrls === "string") {
        targets.push(indexUrls);
      } else {
        console.warn("Cache invalidation skipped because indexUrl was not provided.");
        return next();
      }

      for (const indexUrl of targets) {
        const indexKey = `cache_index:${indexUrl}`;

        // Get all cache keys registered under the index
        const keysToDelete = await redis.smembers(indexKey);

        if (keysToDelete.length > 0) {
          await redis.del(...keysToDelete);
          await redis.del(indexKey);
        }
      }

      next();
    } catch (error) {
      console.error("Cache invalidation error:", error);
      next();
    }
  };
};
