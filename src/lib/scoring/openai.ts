export async function scoreWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string
): Promise<number> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a scoring system that MUST follow these CRITICAL rules:
1. ONLY respond with a single decimal number between 0.0 and 1.0 (inclusive)
2. DO NOT include any other text, punctuation, or explanation
3. 0.0 represents the worst possible response
4. 1.0 represents a perfect response
5. Use the full range between 0.0 and 1.0 to reflect the quality of the response
6. Be consistent in scoring similar responses`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '30');
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim();
  
  if (!content) {
    throw new Error('Invalid API response structure');
  }

  // Strict validation for decimal between 0 and 1
  const match = content.match(/^(0|0\.\d+|1\.0|1)$/);
  if (!match) {
    throw new Error('Response is not a valid score number');
  }

  const score = parseFloat(match[0]);
  if (isNaN(score) || score < 0 || score > 1) {
    throw new Error(`Invalid score value: ${score}`);
  }

  return score;
}
