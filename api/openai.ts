// api/openai.ts
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow API key usage in browser for demo purposes
});

// Function to get a streaming response from OpenAI
export async function getStreamingResponse(
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    onChunk('\n[Error: Failed to get response from OpenAI]');
  }
}

// Legacy non-streaming function (kept for compatibility)
export async function getOpenAIResponse(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });
    
    return completion.choices[0]?.message?.content || 'No response';
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return 'Error: Failed to get response from OpenAI';
  }
}