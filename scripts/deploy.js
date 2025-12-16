const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Đang bắt đầu deploy bằng ví:", deployer.address);

  // --- BƯỚC 1: MÁY TÍNH TỰ TẠO TOKEN FLIGHTCOIN ---
  console.log("1️⃣  Đang tạo FlightCoin...");
  
  // Lấy file hợp đồng FlightCoin từ thư mục contracts
  const FlightCoin = await hre.ethers.getContractFactory("FlightCoin");
  
  // Lệnh deploy() sẽ gửi giao dịch lên mạng để tạo token
  const token = await FlightCoin.deploy(); 
  
  // Lệnh này bắt máy tính PHẢI ĐỢI cho đến khi Token được tạo xong hoàn toàn
  await token.waitForDeployment();
  
  // SAU KHI TẠO XONG, máy tính tự lấy địa chỉ và gán vào biến 'tokenAddress'
  // Lúc này biến tokenAddress đã chứa chuỗi kiểu "0x123...abc" thật sự
  const tokenAddress = token.target; 
  
  console.log("✅ FlightCoin đã được tạo tại địa chỉ:", tokenAddress);


  // --- BƯỚC 2: MÁY TÍNH TỰ LẤY ĐỊA CHỈ TRÊN ĐỂ TẠO BẢO HIỂM ---
  console.log("2️⃣  Đang tạo Hợp đồng Bảo hiểm...");
  
  const FlightInsurance = await hre.ethers.getContractFactory("FlightInsurance");
  
  // CHÚ Ý: Biến 'tokenAddress' ở đây chính là địa chỉ vừa lấy được ở Bước 1
  // Máy tính tự truyền vào, bạn không cần gõ tay.
  const insurance = await FlightInsurance.deploy(tokenAddress); 

  await insurance.waitForDeployment();

  console.log("----------------------------------------------------");
  console.log("🎉 HOÀN TẤT TOÀN BỘ!");
  console.log("💰 Địa chỉ Token (Copy cái này):      ", tokenAddress);
  console.log("✈️  Địa chỉ Bảo Hiểm (Copy cái này):   ", insurance.target);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});