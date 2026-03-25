# Keploy Integration for AI-Research

Dự án này sử dụng [Keploy](https://keploy.io/) để tự động sinh test case bằng cách ghi lại các yêu cầu API và mock các dependency bên ngoài (như OpenAI, Ollama).

## Cài đặt Keploy Binary (Nếu chưa có)

```bash
curl --ssL https://keploy.io/install.sh | bash
```

## Cách sử dụng

### 1. Ghi lại Test Case (Record)

Để ghi lại các yêu cầu API và các phản hồi từ AI providers:

```bash
npm run keploy:record
```

- Sau khi ứng dụng khởi chạy, hãy thực hiện các cuộc gọi API (ví dụ: dùng CLI `/swarm "chào bạn"` hoặc dùng Postman gọi tới endpoint).
- Keploy sẽ tự động lưu các test case vào thư mục `keploy/` dưới định dạng YAML.
- Nhấn `Ctrl+C` để dừng ghi.

### 2. Chạy Test (Test)

Để chạy các test case đã ghi lại (Keploy sẽ tự động mock các cuộc gọi tới OpenAI/Ollama):

```bash
npm run keploy:test
```

## Lợi ích
- **Không tốn phí API khi test**: Keploy mock hoàn toàn các phản hồi từ OpenAI dựa trên dữ liệu đã ghi.
- **Tự động hóa**: Không cần viết code test bằng tay cho các luồng phức tạp.
- **Độ tin cây cao**: Kiểm tra xem logic của hệ thống có thay đổi so với bản ghi gốc hay không.

## Lưu ý
- Thư mục `keploy/` nên được commit vào Git để các thành viên khác có dữ liệu test.
- Nếu bạn thay đổi logic cốt lõi mà làm thay đổi format response, bạn cần chạy Record lại để cập nhật test case.
