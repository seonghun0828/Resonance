/**
 * X (Twitter) API service
 * Handles interactions with X API using user's OAuth token
 */

import { TwitterApi } from 'twitter-api-v2';

/**
 * Fetch posts from X home timeline
 */
export async function fetchHomeTimeline(accessToken: string, maxResults: number = 10) {
  const client = new TwitterApi(accessToken);

  const timeline = await client.v2.homeTimeline({
    max_results: maxResults,
    'tweet.fields': ['created_at', 'public_metrics', 'conversation_id'],
    'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics'],
    expansions: ['author_id'],
  });

  return timeline;
}

/**
 * Search for posts by keyword
 */
export async function searchPosts(
  accessToken: string,
  query: string,
  maxResults: number = 10
) {
  const client = new TwitterApi(accessToken);

  const searchResults = await client.v2.search(query, {
    max_results: maxResults,
    'tweet.fields': ['created_at', 'public_metrics', 'conversation_id'],
    'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics'],
    expansions: ['author_id'],
  });

  return searchResults;
}

/**
 * Post a reply to a tweet
 */
export async function postReply(
  accessToken: string,
  postId: string,
  replyText: string
) {
  const client = new TwitterApi(accessToken);

  const reply = await client.v2.reply(replyText, postId);

  return reply.data;
}

/**
 * Get user profile information
 */
export async function getUserProfile(accessToken: string) {
  const client = new TwitterApi(accessToken);

  const user = await client.v2.me({
    'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics'],
  });

  return user.data;
}

/**
 * Get user's posting frequency (posts in last 7 days)
 */
export async function getUserPostingFrequency(
  accessToken: string,
  userId: string
): Promise<number> {
  const client = new TwitterApi(accessToken);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const timeline = await client.v2.userTimeline(userId, {
      max_results: 100,
      start_time: sevenDaysAgo.toISOString(),
    });

    return timeline.data?.data?.length || 0;
  } catch (error) {
    console.error('Failed to get posting frequency:', error);
    return 0;
  }
}
