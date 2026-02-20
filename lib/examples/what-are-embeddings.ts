/**
 * What are Embeddings? - Interactive Explanation
 *
 * This example demonstrates what embeddings are and why they're useful
 * for measuring semantic similarity between texts.
 *
 * Run: npx tsx lib/examples/what-are-embeddings.ts
 */

import { generateEmbedding } from '../services/embedding/client';
import { cosineSimilarity } from '../services/embedding/similarity';

/**
 * Simple 2D example (for illustration only - real embeddings are 1536D!)
 */
function simple2DExample() {
  console.log('═'.repeat(70));
  console.log('PART 1: Simple 2D Example (Illustration)');
  console.log('═'.repeat(70));
  console.log(`
Imagine we map words in 2D space based on their meaning:

        Animal
           │
      Cat  │  Dog
       •   │   •
           │
    ───────┼────────── Pet vs Wild
           │
      Lion │  Tiger
       •   │   •
           │
        Wild

"Cat" and "Dog" are close → similar meaning (both pets)
"Lion" and "Tiger" are close → similar meaning (both wild cats)
"Cat" and "Lion" are far → different meaning (pet vs wild)
`);

  // Simplified 2D vectors (for illustration)
  const vectors = {
    cat: [1, 1],    // Pet, Animal
    dog: [1.2, 0.8], // Pet, Animal (similar to cat)
    lion: [-1, 1],  // Wild, Animal
    tiger: [-1.1, 0.9], // Wild, Animal (similar to lion)
  };

  console.log('2D Vector Coordinates:');
  console.log('  Cat:   [1.0, 1.0]');
  console.log('  Dog:   [1.2, 0.8]');
  console.log('  Lion:  [-1.0, 1.0]');
  console.log('  Tiger: [-1.1, 0.9]');

  const catDogSim = cosineSimilarity(vectors.cat, vectors.dog);
  const lionTigerSim = cosineSimilarity(vectors.lion, vectors.tiger);
  const catLionSim = cosineSimilarity(vectors.cat, vectors.lion);

  console.log('\nSimilarities (cosine similarity):');
  console.log(`  Cat ↔ Dog:   ${catDogSim.toFixed(3)} (very similar - both pets)`);
  console.log(`  Lion ↔ Tiger: ${lionTigerSim.toFixed(3)} (very similar - both wild)`);
  console.log(`  Cat ↔ Lion:  ${catLionSim.toFixed(3)} (less similar - pet vs wild)`);
}

/**
 * Real OpenAI embeddings example
 */
async function realEmbeddingsExample() {
  console.log('\n' + '═'.repeat(70));
  console.log('PART 2: Real OpenAI Embeddings (1536 Dimensions!)');
  console.log('═'.repeat(70));
  console.log(`
OpenAI's embedding model converts text into 1,536-dimensional vectors.
Each dimension captures a different aspect of meaning.

Let's embed some sentences and see how similar they are:
`);

  // Example sentences
  const sentences = [
    'I love building SaaS products',
    'Creating software as a service is my passion',
    'Pizza is my favorite food',
    'The weather is nice today',
  ];

  console.log('Sentences to embed:');
  sentences.forEach((s, i) => {
    console.log(`  ${i + 1}. "${s}"`);
  });

  console.log('\n🔄 Calling OpenAI API to generate embeddings...\n');

  // Generate embeddings
  const embeddings = [];
  for (const sentence of sentences) {
    const result = await generateEmbedding({ text: sentence });
    embeddings.push(result.embedding);
  }

  console.log('✅ Embeddings generated!');
  console.log(`   Each sentence is now a vector of ${embeddings[0].length} numbers\n`);

  // Show a tiny sample of the embedding
  console.log('Example: First 10 dimensions of sentence 1:');
  console.log(`  [${embeddings[0].slice(0, 10).map(n => n.toFixed(4)).join(', ')}, ...]`);
  console.log(`  ... and 1,526 more numbers!\n`);

  // Calculate similarities
  console.log('━'.repeat(70));
  console.log('Similarity Matrix (how similar is each sentence to the others?)');
  console.log('━'.repeat(70));
  console.log('Scale: 0 = completely different, 1 = identical\n');

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      const percentage = Math.round(similarity * 100);

      let interpretation = '';
      if (similarity > 0.85) interpretation = '🔥 Very Similar';
      else if (similarity > 0.7) interpretation = '✅ Similar';
      else if (similarity > 0.5) interpretation = '🤷 Somewhat Similar';
      else interpretation = '❌ Different';

      console.log(`Sentence ${i + 1} ↔ Sentence ${j + 1}:`);
      console.log(`  Similarity: ${similarity.toFixed(4)} (${percentage}%) ${interpretation}`);
      console.log(`  "${sentences[i]}"`);
      console.log(`  "${sentences[j]}"`);
      console.log('');
    }
  }
}

/**
 * Why embeddings are useful
 */
function explainUseCases() {
  console.log('═'.repeat(70));
  console.log('PART 3: Why Embeddings Are Useful');
  console.log('═'.repeat(70));
  console.log(`
🎯 Problem: How do you measure if two texts are about the same topic?

❌ BAD Approach: Keyword matching
   "I love building SaaS products"
   "Creating software as a service is my passion"
   → No matching keywords! But clearly the same meaning.

✅ GOOD Approach: Embeddings + Cosine Similarity
   → Converts both to vectors
   → Measures angle between vectors
   → Similarity: 0.89 (89% similar!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Use Cases:

1. **Search** - Find relevant documents
   Query: "startup advice"
   → Find posts about "indie hacking", "building companies", etc.

2. **Recommendation** - Suggest similar content
   User likes: "SaaS tutorials"
   → Recommend posts about "software development", "product building"

3. **Classification** - Categorize text
   Post: "Just shipped my MVP!"
   → Category: "Product Launch" (not "Marketing", "Support", etc.)

4. **Duplicate Detection** - Find similar posts
   Post A: "Launched my startup!"
   Post B: "My company just went live!"
   → Similarity: 0.92 (likely duplicates)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 For Your Project:

You want to find posts where authors are likely to respond.
One factor: Are they talking about topics YOU care about?

Process:
1. User interests: "SaaS, indie hacking, MVPs"
   → Embedding: [0.23, -0.15, 0.87, ...]

2. Post text: "Just launched my indie SaaS!"
   → Embedding: [0.21, -0.18, 0.82, ...]

3. Similarity: 0.89 (89% match)
   → This person is talking about YOUR interests!
   → High chance they'll respond to you!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * Technical details
 */
function technicalDetails() {
  console.log('═'.repeat(70));
  console.log('PART 4: Technical Details');
  console.log('═'.repeat(70));
  console.log(`
📊 OpenAI Embedding Specifications:

Model: text-embedding-3-small
- Dimensions: 1,536
- Context Window: 8,191 tokens (~6,000 words)
- Cost: $0.00002 per 1,000 tokens (~$0.02 per million tokens)
- Response Time: ~100-300ms
- Accuracy: State-of-the-art for semantic similarity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔢 What Each Dimension Represents:

OpenAI doesn't tell us exactly what each dimension means, but through
analysis, we know they capture semantic features like:

- Topic categories (technology, food, sports, etc.)
- Sentiment (positive, negative, neutral)
- Entity types (person, place, product, etc.)
- Abstract concepts (time, causation, relationships, etc.)
- Linguistic patterns (formal, casual, technical, etc.)

The neural network learned these patterns from billions of texts!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧮 Cosine Similarity Math:

Given two vectors A and B:

  similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product = sum(A[i] × B[i])
- ||A|| = magnitude = sqrt(sum(A[i]²))
- ||B|| = magnitude = sqrt(sum(B[i]²))

Result: A number between -1 and 1
- 1 = vectors point in same direction (identical meaning)
- 0 = vectors are perpendicular (unrelated)
- -1 = vectors point in opposite directions (opposite meaning)

For text embeddings, results are typically 0 to 1 (all positive).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Storage & Performance:

Each embedding: 1,536 numbers × 4 bytes = ~6 KB
100,000 posts: ~600 MB of embeddings

Use pgvector (PostgreSQL extension) for efficient storage and search:
- IVFFlat index for approximate nearest neighbor search
- Query time: <100ms for millions of vectors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * Main function
 */
async function main() {
  console.clear();
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                   ║');
  console.log('║              WHAT ARE EMBEDDINGS? - Interactive Guide             ║');
  console.log('║                                                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Part 1: Simple illustration
  simple2DExample();

  // Part 2: Real embeddings
  await realEmbeddingsExample();

  // Part 3: Use cases
  explainUseCases();

  // Part 4: Technical details
  technicalDetails();

  console.log('\n✅ Tutorial complete!\n');
  console.log('Next steps:');
  console.log('  1. Try the topical similarity demo: pnpm run example:similarity');
  console.log('  2. Read the implementation: lib/services/embedding/');
  console.log('  3. Check the README for the full implementation plan\n');
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

export { main as explainEmbeddings };
