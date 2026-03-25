import axios from 'axios';

export interface Embeddings {
  createEmbedding(text: string): Promise<number[]>;
}

export const createEmbeddings = (): Embeddings => {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

  return {
    createEmbedding: async (text: string): Promise<number[]> => {
      try {
        const response = await axios.post(`${baseUrl}/api/embeddings`, {
          model,
          prompt: text,
        });
        return response.data.embedding;
      } catch (error: any) {
        throw new Error(`Ollama Embedding Error: ${error.message}`);
      }
    },
  };
};
