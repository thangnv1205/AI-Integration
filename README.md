# 🤖 AI Research & Integration Base

Một **NestJS backend** dùng làm nền tảng nghiên cứu và tích hợp AI, kết hợp **Terminal CLI** để tương tác ngay lập tức.

## Kiến trúc tổng quan

```
AI-Research/
├── src/                    # Backend NestJS
│   ├── core/
│   │   ├── ai-engine/      # Multi-model AI (OpenAI, Ollama)
│   │   ├── embeddings/     # OpenAI Embeddings
│   │   ├── vector-store/   # In-memory RAG store
│   │   ├── tools/          # Tool Calling framework
│   │   └── common/utils/   # Pure functional utilities
│   └── features/
│       ├── assistant/       # REST + WebSocket Gateway
│       └── automation/      # Tool execution endpoints
├── cli/                    # Terminal CLI client
│   └── src/
│       ├── api-client.ts   # Factory function client
│       └── repl.ts         # Interactive REPL
└── tools/hooks/            # React Hooks (copy vào Mobile/Web)
    ├── useChat.ts
    └── useAssistantStream.ts
```

---

## Yêu cầu hệ thống

- **Node.js** >= 18
- **npm** >= 9
- **Ollama** (để dùng model local): [ollama.ai](https://ollama.ai)
- **OpenAI API Key** (tùy chọn)

---

## 1. Cài đặt Backend

```bash
# Clone và cài đặt
cd /path/to/AI-Research
npm install

# Cấu hình biến môi trường
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
OPENAI_API_KEY=sk-...          # Bỏ trống nếu chỉ dùng Ollama
OLLAMA_BASE_URL=http://localhost:11434
PORT=3000
```

### Khởi động Backend

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Backend sẽ chạy tại `http://localhost:3000`.

---

## 2. Cài đặt Ollama (Local AI)

```bash
# Cài Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Tải model (llama3 ~4.7GB)
ollama pull llama3

# Kiểm tra
ollama run llama3 "Hello!"
```

---

## 3. Cài đặt & Chạy CLI

```bash
cd cli
npm install
npm run dev
```

### Giao diện CLI

Sau khi chọn provider, bạn có thể dùng:

| Lệnh | Mô tả |
|------|-------|
| `<message>` | Hỏi AI thông thường (REST) |
| `/stream <message>` | Streaming real-time (WebSocket) |
| `/rag <message>` | Hỏi có ngữ cảnh RAG |
| `/learn <text>` | Dạy AI kiến thức mới |
| `/providers` | Hiển thị providers khả dụng |
| `/help` | Hiển thị trợ giúp |
| `/exit` | Thoát |

Ví dụ:
```
You › /learn NestJS là một framework Node.js sử dụng TypeScript.
✅ Knowledge saved!

You › /rag NestJS là gì?
🤖 AI: NestJS là một framework Node.js sử dụng TypeScript...
```

---

## 4. REST API Reference

### `POST /assistant/ask`
Hỏi AI thông thường.
```json
{ "prompt": "Hello!", "provider": "ollama" }
```

### `POST /assistant/ask-with-context`
Hỏi có RAG context.
```json
{ "prompt": "NestJS là gì?", "provider": "ollama" }
```

### `POST /assistant/learn`
Dạy AI kiến thức mới.
```json
{ "text": "...", "metadata": { "source": "manual" } }
```

### `GET /assistant/providers`
Lấy danh sách providers đang hoạt động.

### `GET /tools`
Lấy danh sách tools AI có thể dùng.

### `POST /tools/execute/:name`
Thực thi một tool.

---

## 5. WebSocket (Streaming)

Kết nối: `ws://localhost:3000`

```javascript
socket.emit('ask', { prompt: '...', provider: 'ollama' });
socket.on('chat-chunk', (chunk) => process.stdout.write(chunk));
socket.on('chat-complete', () => console.log('\nDone!'));
socket.on('chat-error', (err) => console.error(err));
```

---

## 6. Tích hợp Frontend (React / React Native)

Copy file từ `tools/hooks/` vào dự án của bạn:

```tsx
// useChat: REST API
import { useChat } from './useChat';
const { ask, loading, error } = useChat('http://localhost:3000');
const response = await ask('Hello!');

// useAssistantStream: WebSocket streaming
import { useAssistantStream } from './useAssistantStream';
const { ask, response, isStreaming } = useAssistantStream('http://localhost:3000');
ask('Hello!'); // response sẽ được cập nhật real-time
```

> **Lưu ý:** Cần cài `socket.io-client` vào dự án frontend: `npm install socket.io-client`

---

## 7. Scripts

| Script | Mô tả |
|--------|-------|
| `npm run start:dev` | BE: Hot reload development |
| `npm run build` | BE: Build production |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run format` | Format code với Prettier |
| `cd cli && npm run dev` | CLI: Chạy interactive REPL |

---

## 8. Thêm Tool mới

Tạo file `src/core/tools/my-tool.tool.ts`:

```typescript
import { BaseTool, ToolDefinition } from './base.tool';

export class MyTool implements BaseTool {
  definition: ToolDefinition = {
    name: 'my_tool',
    description: 'Mô tả tool của bạn',
    parameters: {},
  };

  execute = async (args: any) => {
    return { result: 'done' };
  };
}
```

Đăng ký trong `src/core/core.module.ts`:
```typescript
inject: [SystemInfoTool, MyTool],
registry.registerTool(myTool);
```

---

## 9. Bước phát triển tiếp theo

- [ ] **Web Dashboard** — React giao tiếp trực tiếp với BE
- [ ] **Persistent Vector Store** — Thay In-memory bằng ChromaDB/Pinecone
- [ ] **Authentication** — Thêm JWT Guard cho các endpoints
- [ ] **Custom Tools** — `FileExplorerTool`, `ScriptExecutorTool`
