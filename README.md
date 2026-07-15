# Resource Allocation Management System (RAMS)

Hệ thống Quản lý Phân bổ Nhân sự (Resource Allocation Management System - RAMS) là ứng dụng Fullstack chuyên biệt dành cho công ty outsourcing. Hệ thống hỗ trợ Resource Manager/PM quản lý nhân viên, dự án, theo dõi workload, lập báo cáo utilization, và đặc biệt là phân tích rủi ro năng lực đội ngũ thông qua Trợ lý AI thông minh tích hợp **Google Gemini AI**.

Dự án được xây dựng chuẩn hóa:
- **Backend**: Java 17, Spring Boot 3.3.1, Spring Data JPA, PostgreSQL.
- **Frontend**: Angular 18 (Standalone Components) thiết kế theo phong cách **Glassmorphism Dark Mode** hiện đại và mượt mà.

---

## 1. Hướng dẫn Chạy Dự Án Nhanh Bằng Docker Compose (Khuyên dùng)

Để chạy thử nghiệm toàn bộ hệ thống ngay lập tức mà không cần cài đặt môi trường Java, Node.js hay PostgreSQL:

### Yêu cầu:
- Máy tính đã cài đặt **Docker Desktop**.

### Các bước thực hiện:
1. Mở terminal tại thư mục gốc của dự án.
2. Thiết lập API Key của Google Gemini để kích hoạt AI thực tế (nếu không có, AI sẽ hiển thị thông báo nhắc cấu hình thân thiện):
   - **Trên Windows (PowerShell)**:
     ```powershell
     $env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
     ```
   - **Trên Linux/macOS**:
     ```bash
     export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
     ```
3. Chạy lệnh khởi động Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
4. Truy cập trình duyệt và mở địa chỉ: http://localhost để trải nghiệm ứng dụng.
*(Dữ liệu mẫu gồm 50 nhân viên, 25 dự án, và 53 phân bổ mẫu đã được tự động chèn sẵn vào database PostgreSQL).*

---

## 2. Hướng dẫn Chạy Thủ Công (Local Development)

### 2.1 Cấu hình & Chạy Backend (Spring Boot)
1. **Cấu hình DB**: Tạo một database PostgreSQL tên là `resource_allocation`.
2. **Cấu hình properties**: Mở file [backend/src/main/resources/application.properties](file:///c:/Users/vuong/IdeaProjects/Resource-Allocation-Management-System/backend/src/main/resources/application.properties) và chỉnh sửa thông tin kết nối và API Key Gemini:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/resource_allocation
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   gemini.api.key=YOUR_GEMINI_API_KEY
   ```
3. **Import dữ liệu thô**: Chạy file [init_db.sql](file:///c:/Users/vuong/IdeaProjects/Resource-Allocation-Management-System/init_db.sql) ở root để tạo bảng, index, triggers và chèn dữ liệu mẫu.
4. **Khởi động Backend**: Chạy lệnh Maven tại thư mục `backend`:
   ```bash
   mvn clean spring-boot:run
   ```
   Backend sẽ hoạt động tại cổng 8080 (http://localhost:8080).

### 2.2 Khởi động Frontend (Angular)
1. Mở terminal tại thư mục `frontend`.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi động Frontend dev server:
   ```bash
   npm start
   ```
   Frontend sẽ hoạt động tại địa chỉ: http://localhost:4200.

---

## 3. Hướng dẫn Lấy và Cấu hình Google Gemini API Key

Hệ thống sử dụng model Gemini để phân tích rủi ro và đề xuất nhân sự thông minh. Để kích hoạt tính năng này:

### 3.1 Cách lấy API Key (Miễn phí)
1. Truy cập vào [Google AI Studio](https://aistudio.google.com/).
2. Đăng nhập bằng tài khoản Google của bạn.
3. Nhấn nút **Create API Key** và sao chép chuỗi Key được sinh ra (chuỗi bắt đầu bằng `AIzaSy...`).

### 3.2 Cách cấu hình vào ứng dụng

* **Nếu chạy bằng Docker Compose (Cách 1)**:
  Thiết lập API Key thành biến môi trường trước khi khởi chạy container (Docker sẽ tự động map biến này vào ứng dụng):
  * **Windows (PowerShell)**:
    ```powershell
    $env:GEMINI_API_KEY="AIzaSyYourKeyHere..."
    docker-compose up -d
    ```
  * **Linux/macOS**:
    ```bash
    export GEMINI_API_KEY="AIzaSyYourKeyHere..."
    docker-compose up -d
    ```

* **Nếu chạy local thủ công (Cách 2)**:
  Mở file [backend/src/main/resources/application.properties](file:///c:/Users/vuong/IdeaProjects/Resource-Allocation-Management-System/backend/src/main/resources/application.properties) và điền key của bạn vào dòng sau:
  ```properties
  gemini.api.key=AIzaSyYourKeyHere...
  ```

---

## 4. Tài liệu API & Kiểm thử

### 4.1 Swagger UI
Sau khi chạy Backend, bạn có thể truy cập tài liệu Swagger UI để test trực tiếp các API tại:
http://localhost:8080/swagger-ui/index.html

### 4.2 Postman Collection
File Postman Collection hoàn chỉnh nằm tại thư mục root của dự án:
[Resource_Allocation_Management_System.postman_collection.json](file:///c:/Users/vuong/IdeaProjects/Resource-Allocation-Management-System/Resource_Allocation_Management_System.postman_collection.json)

### 4.3 Chạy Unit Test
Để chạy kiểm thử tự động các business rules của Allocation Service ở Backend:
```bash
mvn test
```

---

## 5. Các Tính Năng Nổi Bật

1. **Quản lý CRUD toàn diện**: Hỗ trợ đầy đủ Thêm, Sửa, Xóa, Tìm kiếm cho Nhân sự, Dự án, và Phân bổ.
2. **Server-side Dynamic Sorting & Pagination**: Hỗ trợ phân trang và sắp xếp động trên toàn bộ DB. Sắp xếp thông minh theo **Workload** (Tổng phân bổ của nhân sự) trực tiếp ở Backend DB.
3. **Double-layer Protection (Bảo vệ 2 lớp)**: Các luật ràng buộc (Chặn tổng phân bổ quá 100%, chặn phân bổ vào dự án COMPLETED) được kiểm tra chặt chẽ ở cả tầng ứng dụng (Java Service) và tầng cơ sở dữ liệu (PL/pgSQL Trigger).
4. **RAMS AI Assistant**: Tích hợp Google Gemini AI, tự động nhận diện ý định của người dùng để trả về đề xuất nhân sự (recommend), phát hiện rủi ro (risk), hoặc trả lời câu hỏi tự nhiên về dự án và phân bổ.
5. **Dashboard Glassmorphism**: Biểu đồ cột phân bổ lướt ngang mượt mà, xoay nhãn nghiêng -45 độ chuyên nghiệp cùng 4 bảng thống kê trực quan.
