import OpenAI from 'openai';

/**
 * SECURITY WARNING:
 * This is a demo application that uses the OpenAI API directly from the browser.
 * In a production application, you should NEVER expose your API key to the browser.
 * Instead, create a backend API that handles the OpenAI API calls.
 */

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow API key usage in browser for demo purposes only
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
    throw error; // Let the component handle the error
  }
}