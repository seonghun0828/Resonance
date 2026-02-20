/**
 * Type definitions for embedding operations
 */

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface StoredEmbedding {
  id: string;
  sourceId: string;
  sourceType: 'post' | 'user_profile' | 'user_interests';
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SimilarityResult {
  sourceId: string;
  similarity: number;
}
