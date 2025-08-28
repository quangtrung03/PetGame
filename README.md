# 🐾 Pet Game - Web Nuôi Thú Cưng Ảo

Một ứng dụng web đơn giản cho phép người dùng nuôi và chăm sóc thú cưng ảo.

## ✨ Tính năng

- 🔐 **Đăng ký/Đăng nhập**: Xác thực người dùng với JWT
- 🐱 **Quản lý Pet**: Tạo, xem, xóa thú cưng (mèo/chó)
- 🍖 **Chăm sóc**: Cho pet ăn để tăng độ đói và hạnh phúc
- 🎾 **Chơi đùa**: Chơi với pet để tăng độ vui
- 📊 **Theo dõi**: Hiển thị thanh trạng thái cho từng pet
- 📱 **Responsive**: Giao diện thân thiện trên mọi thiết bị

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js**: Server và API
- **MongoDB** + **Mongoose**: Cơ sở dữ liệu
- **JWT**: Xác thực người dùng
- **bcrypt**: Mã hóa mật khẩu
- **CORS**: Hỗ trợ cross-origin requests

### Frontend
- **React 18**: Thư viện UI
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Router**: Điều hướng
- **Axios**: HTTP client

## 📦 Cài đặt và Chạy

### 🚀 Hướng dẫn chi tiết
👉 **Xem file [GAME_GUIDE.md](GAME_GUIDE.md)** để có hướng dẫn cài đặt và chơi game chi tiết.

### ⚡ Chạy nhanh:
```powershell
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

**Truy cập**: http://localhost:3000

## 🗄️ Cấu trúc Database

### Collection: users
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  pets: [ObjectId], // references to Pet
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: pets
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // 'cat' or 'dog'
  hunger: Number, // 0-100
  happiness: Number, // 0-100
  owner: ObjectId, // reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user (cần token)

### Pets
- `GET /api/pets` - Lấy danh sách pet của user (cần token)
- `POST /api/pets` - Tạo pet mới (cần token)
- `PATCH /api/pets/:id/feed` - Cho pet ăn (cần token)
- `PATCH /api/pets/:id/play` - Chơi với pet (cần token)
- `DELETE /api/pets/:id` - Xóa pet (cần token)

### Health Check
- `GET /api/health` - Kiểm tra trạng thái API

## 🎮 Cách chơi

1. **Đăng ký tài khoản** tại trang Register
2. **Đăng nhập** với tài khoản vừa tạo
3. **Tạo pet đầu tiên** trong trang "My Pets"
4. **Chăm sóc pet** bằng cách:
   - 🍖 **Cho ăn**: Tăng độ đói (hunger) +20, độ vui (happiness) +10
   - 🎾 **Chơi đùa**: Tăng độ vui (happiness) +20, giảm độ đói (hunger) -5
5. **Theo dõi trạng thái** pet qua thanh màu:
   - 🟢 Xanh (70-100): Tốt
   - 🟡 Vàng (40-69): Bình thường  
   - 🔴 Đỏ (0-39): Cần chăm sóc

## 🔧 Development

### Cấu trúc thư mục Backend
```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── petController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Pet.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── petRoutes.js
│   └── server.js
├── .env.example
└── package.json
```

### Cấu trúc thư mục Frontend
```
frontend/
├── src/
│   ├── api/
│   │   ├── index.js
│   │   ├── auth.js
│   │   └── pets.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── PetCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Pets.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🛠️ Scripts Available

### Backend
- `npm start`: Chạy production server
- `npm run dev`: Chạy development server với nodemon

### Frontend  
- `npm run dev`: Chạy development server
- `npm run build`: Build cho production
- `npm run preview`: Preview production build

## 🌟 Tính năng tương lai

👉 **Xem file [FEATURES.md](FEATURES.md)** để biết roadmap phát triển chi tiết.

**Highlights**:
- 🏪 Cửa hàng mua đồ cho pet
- ⭐ Hệ thống XP và Level  
- � Mini-games kiếm XP
- � Kết bạn và thăm pet
- � Bảng xếp hạng và achievements

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB URI trong file `.env`
- Đảm bảo IP được whitelist trên MongoDB Atlas
- Kiểm tra username/password

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` trong `.env` backend
- Đảm bảo frontend chạy đúng port

### Lỗi JWT
- Kiểm tra `JWT_SECRET` trong `.env`
- Xóa token cũ trong localStorage nếu có lỗi

## 📄 Tài liệu

- **[GAME_GUIDE.md](GAME_GUIDE.md)** - Hướng dẫn cài đặt và chơi game
- **[FEATURES.md](FEATURES.md)** - Tính năng hiện có và lộ trình phát triển

## 📄 License

MIT License

## 👨‍💻 Author

Tạo bởi AI Assistant theo yêu cầu của người dùng.

---

🎉 **Chúc bạn vui vẻ với thú cưng ảo!** 🐾
