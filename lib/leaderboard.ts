import { supabase } from './supabaseClient';

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  top_score: number;
};


export async function upsertScore(
  user_id: string,
  username: string,
  score: number
): Promise<void> {

  const { data: existing, error: selectError } = await supabase
    .from('leaderboard')
    .select('top_score')
    .eq('user_id', user_id)
    .single();

  // Si erreur autre que "aucune ligne trouvée", on remonte
  if (selectError && (selectError as any).code !== 'PGRST116') {
    console.error('Erreur lecture leaderboard :', selectError);
    throw selectError;
  }

  if (!existing) {
    // 2a) Pas de record existant → INSERT
    const { error: insertError } = await supabase
      .from('leaderboard')
      .insert({ user_id, username, top_score: score });

    if (insertError) {
      console.error('Échec insert leaderboard :', insertError);
      throw insertError;
    }
  } else if (score > existing.top_score) {
    // 2b) Record existant et nouveau score plus élevé → UPDATE
    const { error: updateError } = await supabase
      .from('leaderboard')
      .update({ username, top_score: score })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Échec update leaderboard :', updateError);
      throw updateError;
    }
  }
  // Sinon (nouveau score ≤ ancien), on ne fait rien
}

/**
 * Récupère le top N joueurs, triés par top_score décroissant.
 */
export async function fetchTop(
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('user_id, username, top_score')
    .order('top_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Leaderboard fetch failed :', error);
    throw error;
  }

  return data as LeaderboardEntry[];
}
