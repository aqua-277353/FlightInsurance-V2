import CryptoJS from 'crypto-js';

// Hàm mã hóa dữ liệu
export const encryptData = (data, key) => {
  // Chuyển object data thành chuỗi JSON
  const dataString = JSON.stringify(data);
  // Mã hóa chuỗi đó bằng AES và key (là chữ ký ví)
  const encrypted = CryptoJS.AES.encrypt(dataString, key).toString();
  return encrypted;
};

// Hàm giải mã dữ liệu (Dùng khi bạn muốn hiển thị lại thông tin)
export const decryptData = (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Không thể giải mã (Sai key hoặc dữ liệu lỗi)", error);
    return null;
  }
};