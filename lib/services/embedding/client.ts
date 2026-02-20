/**
 * OpenAI Embedding Client
 *
 * This module handles communication with OpenAI's embedding API
 * to convert text into vector representations.
 */

import OpenAI from 'openai';
import { env } from '@/lib/config/env';
import { CONSTANTS } from '@/lib/config/constants';
import { EmbeddingRequest, EmbeddingResponse } from '@/lib/types/embedding';
import { OpenAIError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Generate a single embedding for text
 *
 * Converts text into a 1536-dimensional vector that represents
 * its semantic meaning. Similar texts will have similar vectors.
 *
 * @param request - Text and optional model configuration
 * @returns Embedding vector and usage statistics
 *
 * @example
 * const result = await generateEmbedding({
 *   text: "I'm building a SaaS product for indie hackers"
 * });
 * // result.embedding: [0.23, -0.15, 0.87, ...] (1536 numbers)
 * // Can now compare with other embeddings using cosine similarity
 */
export async function generateEmbedding(
  request: EmbeddingRequest
): Promise<EmbeddingResponse> {
  const model = request.model ?? CONSTANTS.EMBEDDING_MODEL;

  try {
    logger.debug('Generating embedding', {
      textLength: request.text.length,
      model,
    });

    const response = await openai.embeddings.create({
      model,
      input: request.text,
    });

    const embedding = response.data[0].embedding;

    logger.debug('Embedding generated', {
      dimensions: embedding.length,
      usage: response.usage,
    });

    return {
      embedding,
      model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to generate embedding', { error: message });
    throw new OpenAIError(`Failed to generate embedding: ${message}`);
  }
}

/**
 * Generate embeddings for multiple texts in a batch
 *
 * More efficient than calling generateEmbedding multiple times.
 * OpenAI allows up to ~2048 texts per batch.
 *
 * @param texts - Array of text strings to embed
 * @returns Array of embeddings in the same order as input
 *
 * @example
 * const posts = [
 *   "Just launched my MVP!",
 *   "Looking for co-founder in AI space",
 *   "Startup funding tips"
 * ];
 * const embeddings = await generateEmbeddings(posts);
 * // Returns 3 embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResponse[]> {
  if (texts.length === 0) return [];

  try {
    logger.debug('Generating batch embeddings', { count: texts.length });

    const response = await openai.embeddings.create({
      model: CONSTANTS.EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item, index) => ({
      embedding: item.embedding,
      model: CONSTANTS.EMBEDDING_MODEL,
      usage: {
        // Distribute usage evenly across all texts
        promptTokens: Math.ceil(response.usage.prompt_tokens / texts.length),
        totalTokens: Math.ceil(response.usage.total_tokens / texts.length),
      },
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to generate batch embeddings', { error: message });
    throw new OpenAIError(`Failed to generate embeddings: ${message}`);
  }
}

/**
 * Calculate embedding cost estimate
 *
 * OpenAI charges ~$0.00002 per 1K tokens for text-embedding-3-small
 *
 * @param tokenCount - Number of tokens processed
 * @returns Estimated cost in USD
 */
export function estimateEmbeddingCost(tokenCount: number): number {
  const COST_PER_1K_TOKENS = 0.00002; // text-embedding-3-small pricing
  return (tokenCount / 1000) * COST_PER_1K_TOKENS;
}
