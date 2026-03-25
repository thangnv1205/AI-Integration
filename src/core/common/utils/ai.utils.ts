export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildAugmentedPrompt(contextText: string, prompt: string): string {
  return `Sử dụng các thông tin sau đây để trả lời câu hỏi.\n\nThông tin ngữ cảnh:\n${contextText}\n\nCâu hỏi: ${prompt}`;
}

export function parseOllamaChunk(chunk: Buffer): string[] {
  const lines = chunk.toString().split('\n');
  const results: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line);
      if (json.response) results.push(json.response);
    } catch (e) {
      // Ignore parse errors for partial chunks
    }
  }
  return results;
}

export function formatOpenAiChatMessages(prompt: string) {
  return [{ role: 'user' as const, content: prompt }];
}

