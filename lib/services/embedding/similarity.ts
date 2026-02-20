/**
 * Embedding Similarity Calculations
 *
 * This module provides functions to calculate similarity between vector embeddings
 * using cosine similarity. Used to measure topical relevance between user interests
 * and social media posts.
 */

export interface SimilarityResult {
  sourceId: string;
  similarity: number;
}

/**
 * Calculate cosine similarity between two vectors
 *
 * Cosine similarity measures the cosine of the angle between two vectors.
 * Returns a value between -1 and 1, where:
 * - 1 means identical direction (very similar)
 * - 0 means orthogonal (unrelated)
 * - -1 means opposite direction (opposite meaning)
 *
 * For text embeddings, the result is typically between 0 and 1.
 *
 * Formula: similarity = (A · B) / (||A|| × ||B||)
 *
 * @param vectorA - First embedding vector (e.g., user interests)
 * @param vectorB - Second embedding vector (e.g., post text)
 * @returns Cosine similarity score between -1 and 1
 *
 * @example
 * const userInterests = [0.1, 0.5, 0.3]; // Simplified 3D example
 * const postEmbedding = [0.2, 0.4, 0.4];
 * const similarity = cosineSimilarity(userInterests, postEmbedding);
 * // Returns ~0.99 (very similar)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vector dimensions must match: ${vectorA.length} vs ${vectorB.length}`
    );
  }

  if (vectorA.length === 0) {
    throw new Error('Vectors cannot be empty');
  }

  // Calculate dot product: A · B = sum(A[i] * B[i])
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Calculate magnitudes: ||A|| = sqrt(sum(A[i]²))
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Handle zero vectors
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Calculate cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find most similar vectors from a collection
 *
 * Compares a query vector against a collection of candidate vectors
 * and returns the most similar ones, sorted by similarity score.
 *
 * @param queryVector - The vector to compare against (e.g., user interests)
 * @param candidates - Collection of vectors to search (e.g., all posts)
 * @param limit - Maximum number of results to return
 * @param threshold - Minimum similarity score to include (0-1)
 * @returns Array of results sorted by similarity (highest first)
 *
 * @example
 * const userInterests = await generateEmbedding("indie hacking, SaaS");
 * const posts = [
 *   { id: "1", vector: [0.1, 0.5, ...] },
 *   { id: "2", vector: [0.8, 0.2, ...] },
 * ];
 * const similar = findMostSimilar(userInterests, posts, 5, 0.7);
 * // Returns top 5 posts with similarity >= 0.7
 */
export function findMostSimilar(
  queryVector: number[],
  candidates: Array<{ id: string; vector: number[] }>,
  limit = 10,
  threshold = 0
): SimilarityResult[] {
  const results: SimilarityResult[] = candidates
    .map(candidate => ({
      sourceId: candidate.id,
      similarity: cosineSimilarity(queryVector, candidate.vector),
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
}

/**
 * Normalize similarity score to 0-100 percentage range
 *
 * Cosine similarity ranges from -1 to 1, but for text embeddings
 * it's typically 0 to 1 (all positive values). This function converts
 * the 0-1 range to a 0-100 percentage score.
 *
 * @param similarity - Cosine similarity score (typically 0-1)
 * @returns Percentage score (0-100)
 *
 * @example
 * const similarity = 0.85;
 * const percentage = normalizeToPercent(similarity);
 * // Returns 85
 */
export function normalizeToPercent(similarity: number): number {
  // Clamp to 0-1 range (typical for text embeddings)
  const clamped = Math.max(0, Math.min(1, similarity));
  return Math.round(clamped * 100);
}

/**
 * Batch calculate similarities between one query and multiple targets
 *
 * More efficient than calling cosineSimilarity multiple times when
 * comparing one vector against many.
 *
 * @param queryVector - The vector to compare against
 * @param targetVectors - Array of vectors to compare with
 * @returns Array of similarity scores in the same order as input
 *
 * @example
 * const userInterests = [0.1, 0.5, 0.3];
 * const posts = [
 *   [0.2, 0.4, 0.4],
 *   [0.1, 0.1, 0.1],
 * ];
 * const similarities = batchCosineSimilarity(userInterests, posts);
 * // Returns [0.99, 0.71]
 */
export function batchCosineSimilarity(
  queryVector: number[],
  targetVectors: number[][]
): number[] {
  return targetVectors.map(target => cosineSimilarity(queryVector, target));
}

/**
 * Calculate average similarity across multiple comparisons
 *
 * Useful when you want to get an overall similarity score between
 * a user's interests and multiple posts.
 *
 * @param similarities - Array of similarity scores
 * @returns Average similarity (0-1)
 */
export function averageSimilarity(similarities: number[]): number {
  if (similarities.length === 0) return 0;
  const sum = similarities.reduce((acc, val) => acc + val, 0);
  return sum / similarities.length;
}
