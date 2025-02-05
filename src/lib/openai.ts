export const generateReleaseNotes = async (commits: string[]): Promise<string> => {
  const prompt = `Given these git commits, generate concise and friendly release notes. Use appropriate emojis for different types of changes. Group similar changes together:

${commits.join('\n')}

Format the response in markdown.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};