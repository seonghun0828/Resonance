/**
 * Embedding service - exports all embedding-related functions
 */

export { generateEmbedding, generateEmbeddings, estimateEmbeddingCost } from './client';
export {
  cosineSimilarity,
  findMostSimilar,
  normalizeToPercent,
  batchCosineSimilarity,
  averageSimilarity,
} from './similarity';
