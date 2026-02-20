/**
 * Application-wide constants
 */

export const CONSTANTS = {
  // OpenAI Embedding Configuration
  EMBEDDING_MODEL: 'text-embedding-3-small',
  EMBEDDING_DIMENSIONS: 1536,

  // API Rate Limits
  TWITTER_RATE_LIMIT_PER_15MIN: 450,
  OPENAI_RATE_LIMIT_PER_MIN: 3000,

  // Scoring Weights (must sum to 1.0)
  SCORING_WEIGHTS: {
    ACTIVITY_FREQUENCY: 0.30,
    FOLLOWER_RATIO: 0.25,
    RECENT_POST_COUNT: 0.20,
    TOPICAL_SIMILARITY: 0.25,
  },

  // Discovery Configuration
  DEFAULT_POSTS_PER_SESSION: 5,
  MAX_POSTS_PER_SESSION: 20,
  SIMILARITY_THRESHOLD: 0.7,

  // Cache TTL (in seconds)
  CACHE_TTL_POSTS: 300,      // 5 minutes
  CACHE_TTL_EMBEDDINGS: 3600, // 1 hour
} as const;
