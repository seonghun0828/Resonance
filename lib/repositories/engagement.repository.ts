/**
 * Engagement log repository
 * Handles CRUD operations for user engagement tracking
 */

import { createClient } from '@/lib/utils/supabase';

export interface EngagementLog {
  id: string;
  user_id: string;
  post_id: string;
  post_author_id: string;
  post_content: string | null;
  reply_id: string | null;
  reply_text: string | null;
  engagement_score: number | null;
  created_at: string;
}

/**
 * Log a user engagement with a post
 */
export async function logEngagement(
  userId: string,
  postId: string,
  postAuthorId: string,
  postContent?: string,
  replyId?: string,
  replyText?: string,
  engagementScore?: number
): Promise<EngagementLog> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('engagement_log')
    .insert({
      user_id: userId,
      post_id: postId,
      post_author_id: postAuthorId,
      post_content: postContent || null,
      reply_id: replyId || null,
      reply_text: replyText || null,
      engagement_score: engagementScore || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log engagement: ${error.message}`);
  }

  return data;
}

/**
 * Get user's engagement history
 */
export async function getEngagementHistory(
  userId: string,
  limit: number = 50
): Promise<EngagementLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('engagement_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch engagement history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get engagements for a specific post
 */
export async function getPostEngagements(
  userId: string,
  postId: string
): Promise<EngagementLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('engagement_log')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch post engagements: ${error.message}`);
  }

  return data || [];
}

/**
 * Get engagement count for user
 */
export async function getEngagementCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('engagement_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to get engagement count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get average engagement score for user
 */
export async function getAverageEngagementScore(userId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('engagement_log')
    .select('engagement_score')
    .eq('user_id', userId)
    .not('engagement_score', 'is', null);

  if (error) {
    throw new Error(`Failed to get average engagement score: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc, item) => acc + (item.engagement_score || 0), 0);
  return sum / data.length;
}
