import OpenAI from 'openai';

export interface Embeddings {
  createEmbedding(text: string): Promise<number[]>;
}

export const createEmbeddings = (): Embeddings => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return {
    createEmbedding: async (text: string): Promise<number[]> => {
      try {
        const response = await client.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        throw new Error(`Embedding Error: ${error.message}`);
      }
    },
  };
};
