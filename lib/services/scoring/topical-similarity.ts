/**
 * Topical Similarity Scoring
 *
 * This module calculates how relevant a post is to a user's interests
 * based on semantic similarity of their embeddings.
 */

import { cosineSimilarity } from '../embedding/similarity';

/**
 * Calculate topical similarity score (0-100)
 *
 * Takes the cosine similarity between user interests and post content
 * and converts it to a 0-100 score with a slight curve to emphasize
 * high similarity matches.
 *
 * The curve (power of 0.8) slightly boosts mid-to-high similarities
 * to differentiate between "somewhat relevant" and "very relevant".
 *
 * @param similarity - Cosine similarity score (0-1)
 * @returns Topical similarity score (0-100)
 *
 * @example
 * // User interests: "SaaS, indie hacking, startups"
 * // Post: "Just launched my SaaS MVP for indie makers!"
 * const similarity = 0.85; // High semantic similarity
 * const score = calculateTopicalSimilarity(similarity);
 * // Returns ~88 (very relevant)
 */
export function calculateTopicalSimilarity(similarity: number): number {
  // Clamp input to valid range
  const clamped = Math.max(0, Math.min(1, similarity));

  // Apply curve to emphasize high similarity
  // Math.pow(0.8, 0.8) = ~0.83 (slight boost)
  // Math.pow(0.5, 0.8) = ~0.57 (moderate boost)
  // Math.pow(0.2, 0.8) = ~0.26 (small boost)
  const curved = Math.pow(clamped, 0.8);

  // Convert to 0-100 range
  return Math.round(curved * 100);
}

/**
 * Calculate topical similarity directly from embeddings
 *
 * Combines the cosine similarity calculation and scoring in one step.
 *
 * @param userInterestsEmbedding - User's interests as a vector
 * @param postEmbedding - Post content as a vector
 * @returns Topical similarity score (0-100)
 *
 * @example
 * const userEmbedding = [0.23, -0.15, 0.87, ...]; // 1536 dimensions
 * const postEmbedding = [0.21, -0.18, 0.82, ...]; // 1536 dimensions
 * const score = calculateTopicalSimilarityFromEmbeddings(
 *   userEmbedding,
 *   postEmbedding
 * );
 * // Returns 85 (highly relevant)
 */
export function calculateTopicalSimilarityFromEmbeddings(
  userInterestsEmbedding: number[],
  postEmbedding: number[]
): number {
  const similarity = cosineSimilarity(userInterestsEmbedding, postEmbedding);
  return calculateTopicalSimilarity(similarity);
}

/**
 * Interpret topical similarity score
 *
 * Provides human-readable interpretation of the score.
 *
 * @param score - Topical similarity score (0-100)
 * @returns Interpretation string
 */
export function interpretTopicalSimilarity(score: number): string {
  if (score >= 85) return 'Highly relevant';
  if (score >= 70) return 'Very relevant';
  if (score >= 55) return 'Moderately relevant';
  if (score >= 40) return 'Somewhat relevant';
  if (score >= 25) return 'Loosely relevant';
  return 'Not relevant';
}

/**
 * Calculate average topical similarity across multiple posts
 *
 * Useful for understanding overall relevance of a collection.
 *
 * @param userInterestsEmbedding - User's interests vector
 * @param postEmbeddings - Array of post embeddings
 * @returns Average topical similarity score (0-100)
 */
export function calculateAverageTopicalSimilarity(
  userInterestsEmbedding: number[],
  postEmbeddings: number[][]
): number {
  if (postEmbeddings.length === 0) return 0;

  const scores = postEmbeddings.map(postEmbedding =>
    calculateTopicalSimilarityFromEmbeddings(userInterestsEmbedding, postEmbedding)
  );

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}
