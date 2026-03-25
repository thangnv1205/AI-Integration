# AI Research CLI

Terminal CLI để tương tác với AI Research Backend.

## Yêu cầu

- Backend đang chạy tại `http://localhost:3000` (hoặc đặt `AI_BASE_URL`)
- Node.js >= 18

## Cài đặt & Chạy

```bash
npm install
npm run dev
```

## Biến môi trường

```env
AI_BASE_URL=http://localhost:3000   # mặc định
```

## Lệnh

| Lệnh | Mô tả |
|------|-------|
| `<message>` | Hỏi AI thông thường |
| `/stream <msg>` | Streaming real-time |
| `/rag <msg>` | Hỏi có ngữ cảnh RAG |
| `/learn <text>` | Dạy AI kiến thức mới |
| `/providers` | Liệt kê AI providers |
| `/help` | Hiển thị trợ giúp |
| `/exit` | Thoát |

## Build

```bash
npm run build
node dist/index.js
```
