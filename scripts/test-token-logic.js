const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 BẮT ĐẦU TEST LOGIC BẢO HIỂM DÙNG TOKEN...");

  const [admin, customer] = await ethers.getSigners();
  console.log(`- Ví Admin:    ${admin.address}`);
  console.log(`- Ví Customer: ${customer.address}`);

  // --- 1. DEPLOY TOKEN (FLIGHT COIN) ---
  console.log(`\n--- 1. DEPLOY TOKEN (FLC) ---`);
  const FlightCoin = await ethers.getContractFactory("FlightCoin");
  const token = await FlightCoin.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ Token FLC đã deploy tại: ${tokenAddress}`);

  // --- 2. DEPLOY INSURANCE (BẢO HIỂM) ---
  console.log(`\n--- 2. DEPLOY HỢP ĐỒNG BẢO HIỂM ---`);
  const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
  // Truyền địa chỉ Token vào Constructor
  const insurance = await FlightInsurance.deploy(tokenAddress);
  await insurance.waitForDeployment();
  const insuranceAddress = await insurance.getAddress();
  console.log(`✅ Insurance đã deploy tại: ${insuranceAddress}`);

  // --- 3. CHUẨN BỊ TÀI CHÍNH (QUAN TRỌNG) ---
  console.log(`\n--- 3. CHUẨN BỊ TIỀN NONG ---`);
  
  // A. Admin nạp tiền vào Quỹ Bảo Hiểm (Để có tiền đền bù)
  // Admin chuyển 10,000 FLC vào hợp đồng Insurance
  await token.connect(admin).transfer(insuranceAddress, 10000);
  console.log(`✅ Admin đã nạp 10,000 FLC vào quỹ bảo hiểm.`);

  // B. Admin phát tiền cho Khách (Để khách có tiền mua vé)
  await token.connect(admin).transfer(customer.address, 2000);
  console.log(`✅ Admin đã bắn 2,000 FLC cho khách hàng.`);

  // Check số dư
  const balanceCustomer = await token.balanceOf(customer.address);
  console.log(`=> Số dư ví khách: ${balanceCustomer} FLC`);

  // --- 4. KHÁCH MUA BẢO HIỂM (BƯỚC KHÓ NHẤT: APPROVE) ---
  console.log(`\n--- 4. KHÁCH MUA VÉ ---`);
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const currentTime = blockBefore.timestamp;
  // Giả lập bay sau 50 tiếng (đủ điều kiện > 48h)
  const scheduledTime = currentTime + (50 * 60 * 60); 

  // QUAN TRỌNG: Khách phải Approve cho Insurance được tiêu 1000 FLC của mình
  console.log(`⏳ Khách đang Approve...`);
  const approveTx = await token.connect(customer).approve(insuranceAddress, 1000);
  await approveTx.wait();
  console.log(`✅ Approve thành công!`);

  // Sau khi Approve mới được mua
  console.log(`⏳ Khách đang Mua...`);
  // Lưu ý: Hàm buyInsurance bây giờ chỉ còn 2 tham số
  const buyTx = await insurance.connect(customer).buyInsurance("VN123", scheduledTime);
  await buyTx.wait();
  console.log(`✅ Mua bảo hiểm thành công!`);

  // Kiểm tra token đã bị trừ chưa
  const balanceCustomerAfterBuy = await token.balanceOf(customer.address);
  console.log(`=> Số dư ví khách sau khi mua: ${balanceCustomerAfterBuy} FLC (Đã mất 1000)`);

  // --- 5. GIẢ LẬP TRỄ CHUYẾN VÀ ĐỀN BÙ ---
  console.log(`\n--- 5. XỬ LÝ ĐỀN BÙ ---`);
  // Trễ 3 tiếng
  const actualTime = scheduledTime + (3 * 60 * 60);
  
  // Admin cập nhật giờ
  await insurance.connect(admin).updateFlightStatus("VN123", actualTime);
  console.log(`✅ Admin đã cập nhật giờ trễ.`);

  // Thực hiện đền bù (Admin hoặc Khách gọi đều được)
  const processTx = await insurance.connect(admin).processClaim(0);
  await processTx.wait();
  console.log(`✅ Đã thực hiện lệnh đền bù (Payout).`);

  // --- 6. KIỂM TRA KẾT QUẢ CUỐI CÙNG ---
  console.log(`\n--- KẾT QUẢ CUỐI CÙNG ---`);
  const finalBalance = await token.balanceOf(customer.address);
  console.log(`💰 Số dư ví khách: ${finalBalance} FLC`);

  // Logic kiểm tra: Ban đầu có 2000 - 1000 mua vé + 8888 đền bù = 9888
  if (finalBalance == 9888n) {
      console.log(`🎉 TEST THÀNH CÔNG.`);
  } else {
      console.log(`❌ CÓ GÌ ĐÓ SAI. Số dư không khớp.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });