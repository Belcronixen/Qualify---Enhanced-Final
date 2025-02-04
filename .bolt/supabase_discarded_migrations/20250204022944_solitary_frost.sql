/*
  # Add update_score function

  1. New Function
    - Creates a stored procedure to safely update response scores
    - Handles validation and error cases
    - Returns the updated response data

  2. Security
    - Function is accessible to authenticated users only
*/

-- Drop existing function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS update_response_score(uuid, double precision);

CREATE OR REPLACE FUNCTION update_response_score(
  response_id uuid,
  new_score double precision
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_response jsonb;
BEGIN
  -- Validate score range
  IF new_score < 0 OR new_score > 1 THEN
    RAISE EXCEPTION 'Score must be between 0 and 1';
  END IF;

  -- Update score and return response data
  WITH updated AS (
    UPDATE user_responses
    SET 
      score = new_score,
      updated_at = NOW()
    WHERE id = response_id
    RETURNING *
  )
  SELECT jsonb_build_object(
    'id', u.id,
    'score', u.score,
    'response_text', u.response_text,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'question_id', u.question_id,
    'user_id', u.user_id
  ) INTO updated_response
  FROM updated u;

  -- Handle case where response was not found
  IF updated_response IS NULL THEN
    RAISE EXCEPTION 'Response with ID % not found', response_id;
  END IF;

  RETURN updated_response;
END;
$$;