/**
 * Topical Similarity - Complete Example
 *
 * This file demonstrates how topical similarity works end-to-end,
 * from text to embeddings to similarity scores.
 *
 * Run with: npx tsx lib/examples/topical-similarity-example.ts
 */

import { generateEmbedding, generateEmbeddings } from '../services/embedding/client';
import { cosineSimilarity } from '../services/embedding/similarity';
import {
  calculateTopicalSimilarity,
  interpretTopicalSimilarity,
} from '../services/scoring/topical-similarity';

/**
 * Example: Calculate similarity between user interests and posts
 */
async function demonstrateTopicalSimilarity() {
  console.log('='.repeat(60));
  console.log('Topical Similarity Calculation Demo');
  console.log('='.repeat(60));

  // Step 1: Define user interests
  const userInterests = [
    'SaaS products',
    'indie hacking',
    'startup building',
    'product development',
  ].join(', ');

  console.log('\n📌 User Interests:');
  console.log(`   "${userInterests}"`);

  // Step 2: Define sample posts from X/Twitter
  const posts = [
    {
      id: '1',
      text: 'Just launched my SaaS MVP for indie makers! Built it in 2 weeks. Feedback welcome! 🚀',
      author: '@maker1',
    },
    {
      id: '2',
      text: 'Today I learned about React Server Components and how they improve performance.',
      author: '@dev2',
    },
    {
      id: '3',
      text: 'Coffee recipes for the perfect morning brew ☕️',
      author: '@barista3',
    },
    {
      id: '4',
      text: 'Building in public: Day 30. Revenue hit $500 MRR! Here\'s what worked...',
      author: '@founder4',
    },
  ];

  console.log('\n📝 Sample Posts:');
  posts.forEach(post => {
    console.log(`   ${post.id}. ${post.author}: "${post.text.substring(0, 60)}..."`);
  });

  // Step 3: Generate embeddings
  console.log('\n🔄 Generating embeddings...');
  console.log('   (Converting text to 1536-dimensional vectors)');

  const userEmbeddingResult = await generateEmbedding({ text: userInterests });
  const userEmbedding = userEmbeddingResult.embedding;

  const postTexts = posts.map(p => p.text);
  const postEmbeddingResults = await generateEmbeddings(postTexts);
  const postEmbeddings = postEmbeddingResults.map(r => r.embedding);

  console.log(`   ✓ User embedding: ${userEmbedding.length} dimensions`);
  console.log(`   ✓ Post embeddings: ${postEmbeddings.length} vectors`);

  // Step 4: Calculate similarities
  console.log('\n📊 Calculating Topical Similarity:');
  console.log('   Using cosine similarity formula:');
  console.log('   similarity = (A · B) / (||A|| × ||B||)');
  console.log('');

  const results = posts.map((post, index) => {
    // Calculate raw cosine similarity (0-1)
    const similarity = cosineSimilarity(userEmbedding, postEmbeddings[index]);

    // Convert to 0-100 score with curve
    const score = calculateTopicalSimilarity(similarity);

    // Get interpretation
    const interpretation = interpretTopicalSimilarity(score);

    return {
      ...post,
      similarity,
      score,
      interpretation,
    };
  });

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  // Step 5: Display results
  console.log('\n🎯 Results (sorted by relevance):');
  console.log('─'.repeat(60));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. Post ${result.id} (${result.author})`);
    console.log(`   "${result.text.substring(0, 70)}..."`);
    console.log(`   Cosine Similarity: ${result.similarity.toFixed(4)} (0-1 scale)`);
    console.log(`   Topical Score: ${result.score}/100`);
    console.log(`   Relevance: ${result.interpretation}`);
  });

  // Step 6: Explanation
  console.log('\n' + '='.repeat(60));
  console.log('💡 Interpretation:');
  console.log('─'.repeat(60));
  console.log(`
The topical similarity scores show how semantically related each post
is to the user's interests (${userInterests}).

High scores (85-100): Posts directly about the user's interests
Medium scores (55-84): Posts somewhat related
Low scores (0-54): Posts not very relevant

The scoring process:
1. Text → Embeddings (OpenAI API)
2. Embeddings → Cosine Similarity (Math)
3. Similarity → Curved Score (0-100)

This helps the system recommend posts from authors who are likely
to respond because they're talking about topics the user cares about!
  `);

  // Step 7: Cost estimate
  const totalTokens = userEmbeddingResult.usage.totalTokens +
    postEmbeddingResults.reduce((sum, r) => sum + r.usage.totalTokens, 0);

  const costPer1K = 0.00002; // text-embedding-3-small pricing
  const cost = (totalTokens / 1000) * costPer1K;

  console.log('💰 API Usage:');
  console.log(`   Total tokens: ${totalTokens}`);
  console.log(`   Estimated cost: $${cost.toFixed(6)}`);
  console.log('='.repeat(60));
}

// Run the demo
if (require.main === module) {
  demonstrateTopicalSimilarity()
    .then(() => {
      console.log('\n✅ Demo completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Demo failed:', error);
      process.exit(1);
    });
}

export { demonstrateTopicalSimilarity };
