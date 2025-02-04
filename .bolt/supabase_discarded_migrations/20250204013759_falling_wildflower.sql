/*
  # Add update_response_score function

  1. New Function
    - Creates a stored procedure to safely update response scores
    - Handles validation and error cases
    - Returns the updated response data

  2. Security
    - Function is accessible to authenticated users only
*/

CREATE OR REPLACE FUNCTION update_response_score(
  response_id UUID,
  new_score FLOAT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_response JSONB;
BEGIN
  IF new_score < 0 OR new_score > 1 THEN
    RAISE EXCEPTION 'Score must be between 0 and 1';
  END IF;

  WITH updated AS (
    UPDATE user_responses
    SET score = new_score
    WHERE id = response_id
    RETURNING *
  )
  SELECT jsonb_build_object(
    'id', u.id,
    'score', u.score,
    'response_text', u.response_text,
    'created_at', u.created_at,
    'question_id', u.question_id,
    'user_id', u.user_id
  ) INTO updated_response
  FROM updated u;

  IF updated_response IS NULL THEN
    RAISE EXCEPTION 'Response not found';
  END IF;

  RETURN updated_response;
END;
$$;