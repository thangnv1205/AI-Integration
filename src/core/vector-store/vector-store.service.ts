import { cosineSimilarity } from '../common/utils/ai.utils';
import type { Embeddings } from '../embeddings/embeddings.service';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: any;
  embedding?: number[];
}

export interface VectorStore {
  addDocument(text: string, metadata?: any): Promise<VectorDocument>;
  search(query: string, limit?: number): Promise<VectorDocument[]>;
}

export const createVectorStore = (embeddings: Embeddings): VectorStore => {
  const documents: VectorDocument[] = [];

  return {
    addDocument: async (text: string, metadata: any = {}): Promise<VectorDocument> => {
      const embedding = await embeddings.createEmbedding(text);
      const doc: VectorDocument = {
        id: Math.random().toString(36).substring(7),
        text,
        metadata,
        embedding,
      };
      documents.push(doc);
      return doc;
    },

    search: async (query: string, limit = 3): Promise<VectorDocument[]> => {
      const queryEmbedding = await embeddings.createEmbedding(query);
      return documents
        .map((doc) => ({
          doc,
          similarity: doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0,
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((r) => r.doc);
    },
  };
};
