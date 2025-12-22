```markdown
# ✈️ FlightShield - Decentralized Flight Insurance DApp

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-363636)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22.5-yellow)
![IPFS](https://img.shields.io/badge/Storage-IPFS_(Pinata)-green)

> **FlightShield** là ứng dụng phi tập trung (DApp) cung cấp dịch vụ bảo hiểm chuyến bay tự động trên nền tảng Blockchain Ethereum (Sepolia Testnet). Hệ thống đảm bảo tính minh bạch, dữ liệu không thể thay đổi và tự động bồi thường ngay lập tức khi chuyến bay bị trễ (Delay).

---

## 🌟 Tính Năng Chính (Key Features)

Dự án đáp ứng đầy đủ các tiêu chí Rubric của môn học:

### 1. 🔗 Smart Contract (Hợp đồng thông minh)
* **Mua bảo hiểm:** Khách hàng mua bảo hiểm và nhận lại NFT chứng nhận (ERC-721).
* **Token bồi thường:** Sử dụng token riêng (`FlightCoin` - FLC) để thanh toán bồi thường (ERC-20).
* **Xử lý yêu cầu:** Tự động kiểm tra điều kiện trễ chuyến (> 2 giờ) để chấp nhận hoặc từ chối bồi thường.

### 2. 🌐 Lưu trữ Phi tập trung (IPFS)
* Tích hợp **Pinata (IPFS)** để lưu trữ dữ liệu chuyến bay, vé điện tử và hồ sơ khách hàng.
* Chỉ lưu mã băm (CID) trên Blockchain để tối ưu hóa chi phí Gas.

### 3. 💻 Giao diện Web3 (Frontend)
* **Admin Dashboard:** Quản lý chuyến bay, cập nhật trạng thái bay (Đúng giờ/Trễ), phê duyệt bồi thường hàng loạt.
* **User Portal:** Mua bảo hiểm, xem trạng thái hồ sơ, kết nối ví MetaMask.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Blockchain:** Ethereum Sepolia Testnet.
* **Smart Contract:** Solidity (v0.8.28), OpenZeppelin Contracts.
* **Framework:** Hardhat (Development & Deployment).
* **Frontend:** ReactJS + Vite + Ethers.js v6.
* **Storage:** IPFS (via Pinata SDK).
* **Environment:** Node.js v20.18.0 (LTS).

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### 1. Yêu cầu tiên quyết (Prerequisites)
* [Node.js](https://nodejs.org/) (Phiên bản **v20.18.0 LTS** trở lên - Khuyến nghị để tránh lỗi trên Windows).
* [MetaMask](https://metamask.io/) Extension đã cài đặt trên trình duyệt.
* Tài khoản [Pinata](https://www.pinata.cloud/) (để lấy API Key).

### 2. Cài đặt Project
Clone dự án về máy:

```bash
git clone [https://github.com/username/flight-insurance-dapp.git](https://github.com/username/flight-insurance-dapp.git)
cd flight-insurance-dapp

```

Cài đặt các thư viện phụ thuộc (Dependencies):

```bash
npm install

```

### 3. Cấu hình Biến môi trường

Tạo file `.env` tại thư mục gốc và điền thông tin của bạn:

```env
SEPOLIA_URL=[https://ethereum-sepolia-rpc.publicnode.com](https://ethereum-sepolia-rpc.publicnode.com)
PRIVATE_KEY=your_metamask_private_key_here

```

---

## ⛓️ Triển Khai Smart Contract (Deployment)

Biên dịch hợp đồng:

```bash
npx hardhat compile

```

Triển khai lên mạng Sepolia Testnet (với cấu hình Gas tối ưu):

```bash
npx hardhat run scripts/deploy.js --network sepolia

```

Sau khi chạy xong, Terminal sẽ trả về 2 địa chỉ quan trọng. Hãy lưu lại chúng:

* `FlightCoin Address` (Token)
* `FlightInsurance Address` (Logic)

---

## 🖥️ Chạy Ứng Dụng (Frontend)

1. Mở file `src/App.jsx` (hoặc nơi cấu hình contract).
2. Cập nhật 2 địa chỉ Contract vừa deploy vào biến:
```javascript
const TOKEN_ADDRESS = "0x...";
const INSURANCE_ADDRESS = "0x...";

```


3. Cập nhật API Key Pinata của bạn vào code.
4. Khởi chạy ứng dụng:

```bash
npm run dev

```

Truy cập: `http://localhost:5173`

---

## 📖 Hướng Dẫn Sử Dụng (User Guide)

### Dành cho Admin (Ví Deployer)

1. Vào tab **"Quản lý"**: Thêm chuyến bay mới, Cấp vé cho khách hàng.
2. Vào tab **"Cập nhật"**:
* Chọn chuyến bay.
* Nhập giờ hạ cánh thực tế.
* Bấm **"Cập nhật Trạng Thái"**.
* *Lưu ý:* Nếu trễ > 2 tiếng, hệ thống sẽ tự động chuyển tiền bồi thường cho tất cả khách hàng đang chờ.



### Dành cho Khách hàng

1. Kết nối ví MetaMask.
2. Vào tab **"Mua Vé"**: Chọn chuyến bay và bấm "Mua Bảo Hiểm".
3. Vào tab **"Claim"**: Xem trạng thái đơn bảo hiểm của mình.

---

## 📸 Hình ảnh Demo

<img width="1918" height="879" alt="image" src="https://github.com/user-attachments/assets/957df7b1-6367-40a4-8e98-464dcab08a9d" />


---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by Lê Bá Vinh - 2025**

```
```
