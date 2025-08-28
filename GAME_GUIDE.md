# 🎮 HƯỚNG DẪN CHƠI PET GAME

## 🚀 CÁCH CHẠY ỨNG DỤNG

### Bước 1: Chạy Backend
```powershell
cd backend
npm install
npm start
```

### Bước 2: Chạy Frontend (Terminal mới)
```powershell
cd frontend
npm install
npm run dev
```

### Bước 3: Truy cập game
- Mở trình duyệt: **http://localhost:3000**
- Backend API: **http://localhost:5000**

---

## 🎯 CÁCH CHƠI

### 1. Đăng ký & Đăng nhập
- Truy cập trang chủ và click **"Đăng ký"**
- Điền thông tin: tên người dùng, email, mật khẩu
- Đăng nhập với tài khoản vừa tạo

### 2. Tạo Pet đầu tiên
- Vào trang **"My Pets"**
- Click **"➕ Thêm Pet mới"**
- Chọn tên và loại pet (🐱 Mèo hoặc 🐶 Chó)
- Click **"Tạo Pet"**

### 3. Chăm sóc Pet
#### 🍖 Cho ăn
- Click nút **"🍖 Cho ăn"**
- Tăng độ đói (hunger) +20
- Tăng độ vui (happiness) +10

#### 🎾 Chơi đùa
- Click nút **"🎾 Chơi"**
- Tăng độ vui (happiness) +20
- Giảm độ đói (hunger) -5

### 4. Theo dõi trạng thái Pet
- **Thanh đói (🍽️)**: 0-100, màu xanh dương
- **Thanh vui (😊)**: 0-100, màu xanh lá
- **Màu sắc**:
  - 🟢 **70-100**: Tốt
  - 🟡 **40-69**: Bình thường
  - 🔴 **0-39**: Cần chăm sóc

### 5. Quản lý Pet
- **Xóa Pet**: Click biểu tượng 🗑️ (có xác nhận)
- **Thông tin**: Xem ngày tạo pet
- **Dashboard**: Theo dõi tổng số pet

---

## ⚙️ CẤU HÌNH HỆ THỐNG

### MongoDB đã được thiết lập:
- **Database**: pet_game
- **Collections**: users, pets
- **Connection**: Tự động kết nối MongoDB Atlas

### Công nghệ sử dụng:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + TailwindCSS + Vite
- **Authentication**: JWT tokens

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Backend không chạy được
```powershell
# Kiểm tra Node.js
node -v

# Xóa và cài lại dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend không load được
```powershell
# Xóa và cài lại dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Không kết nối được MongoDB
- Kiểm tra internet connection
- File `.env` đã có sẵn, không cần sửa

### Lỗi CORS hoặc API
- Đảm bảo backend chạy ở port 5000
- Đảm bảo frontend chạy ở port 3000
- Restart cả 2 server

---

## 📱 GIAO DIỆN

### Trang chủ (/)
- Giới thiệu game
- Nút đăng ký/đăng nhập

### Dashboard (/dashboard)
- Thống kê tổng số pet
- Thông tin tài khoản
- Hành động nhanh

### My Pets (/pets)
- Danh sách tất cả pet
- Tạo pet mới
- Chăm sóc pet

### Đăng nhập/Đăng ký
- Form xác thực
- Validation dữ liệu
- Chuyển hướng tự động

---

## 🎉 TIPS CHƠI HAY

1. **Chăm sóc đều đặn**: Đăng nhập hàng ngày để chăm sóc pet
2. **Cân bằng hoạt động**: Vừa cho ăn vừa chơi để pet luôn vui
3. **Đa dạng pet**: Thử tạo cả mèo và chó để trải nghiệm
4. **Theo dõi trạng thái**: Chú ý màu sắc thanh trạng thái
5. **Đặt tên hay**: Tên pet sẽ hiển thị trên thẻ pet

---

## 🔧 DEVELOPMENT MODE

### Chạy với auto-reload:
```powershell
# Backend với nodemon
cd backend
npm run dev

# Frontend với Vite hot reload
cd frontend  
npm run dev
```

### Build cho production:
```powershell
# Frontend build
cd frontend
npm run build
npm run preview
```

---

## 📞 HỖ TRỢ

### Cấu trúc project:
```
Pet/
├── backend/          # API server
├── frontend/         # React app  
├── README.md         # Tài liệu chính
├── QUICK_START.md    # Hướng dẫn chạy nhanh
└── FEATURES.md       # Tính năng & roadmap
```

### Health check:
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000

**🐾 Chúc bạn vui vẻ với Pet Game!**
