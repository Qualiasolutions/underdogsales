-- Leaderboard: Aggregates user performance scores for ranking
-- Created: 2026-01-29

-- Function to get leaderboard data with rankings
-- Uses weighted average of dimension scores across all sessions
CREATE OR REPLACE FUNCTION get_leaderboard(
  result_limit INT DEFAULT 50,
  time_period INTERVAL DEFAULT '30 days'::INTERVAL
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_initial TEXT,
  total_sessions INT,
  avg_score NUMERIC,
  best_score NUMERIC,
  total_practice_minutes INT,
  rank BIGINT,
  trend TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      u.id AS uid,
      COALESCE(u.name, 'Anonymous') AS uname,
      COUNT(DISTINCT rs.id)::INT AS sessions,
      ROUND(AVG(ss.score)::NUMERIC, 1) AS average_score,
      MAX(ss.score)::NUMERIC AS max_score,
      COALESCE(SUM(rs.duration_seconds) / 60, 0)::INT AS practice_mins
    FROM users u
    LEFT JOIN roleplay_sessions rs ON rs.user_id = u.id
      AND rs.created_at > NOW() - time_period
      AND rs.deleted_at IS NULL
    LEFT JOIN session_scores ss ON ss.session_id = rs.id
      AND ss.deleted_at IS NULL
    GROUP BY u.id, u.name
    HAVING COUNT(DISTINCT rs.id) > 0
  ),
  ranked_stats AS (
    SELECT
      *,
      RANK() OVER (ORDER BY average_score DESC, sessions DESC) AS user_rank
    FROM user_stats
  )
  SELECT
    rs.uid,
    -- Anonymize: show first name + last initial or "User #rank"
    CASE
      WHEN rs.uname = 'Anonymous' THEN 'Underdog #' || rs.user_rank::TEXT
      WHEN POSITION(' ' IN rs.uname) > 0 THEN
        SPLIT_PART(rs.uname, ' ', 1) || ' ' || LEFT(SPLIT_PART(rs.uname, ' ', 2), 1) || '.'
      ELSE rs.uname
    END,
    UPPER(LEFT(rs.uname, 1)),
    rs.sessions,
    rs.average_score,
    rs.max_score,
    rs.practice_mins,
    rs.user_rank,
    -- Trend indicator based on recent activity
    CASE
      WHEN rs.sessions >= 5 THEN 'hot'
      WHEN rs.sessions >= 3 THEN 'rising'
      ELSE 'steady'
    END
  FROM ranked_stats rs
  ORDER BY rs.user_rank
  LIMIT result_limit;
END;
$$;

-- Grant execute to authenticated users (leaderboard is public to logged-in users)
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;

-- Create index to optimize leaderboard queries
CREATE INDEX IF NOT EXISTS idx_session_scores_score
  ON session_scores(score)
  WHERE deleted_at IS NULL;

COMMENT ON FUNCTION get_leaderboard IS 'Returns ranked leaderboard of users based on average session scores';
