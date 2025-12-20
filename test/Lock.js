const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Flight Insurance System", function () {

  // --- 1. SETUP MÔI TRƯỜNG (Chạy 1 lần dùng cho nhiều bài test) ---
  async function deployFixture() {
    // Lấy danh sách ví: Admin (deployer) và User (khách hàng)
    const [admin, user] = await ethers.getSigners();

    // Deploy Token (FLC)
    const FlightCoin = await ethers.getContractFactory("FlightCoin");
    const token = await FlightCoin.deploy();
    await token.waitForDeployment();

    // Deploy Bảo Hiểm (Truyền địa chỉ token vào)
    const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
    const insurance = await FlightInsurance.deploy(token.target);
    await insurance.waitForDeployment();

    // Chuyển trước 5000 token cho User để có tiền mua vé
    // Lưu ý: 5000 * 10^18 để đúng chuẩn đơn vị
    const amount = ethers.parseUnits("5000", 18);
    await token.transfer(user.address, amount);

    return { token, insurance, admin, user };
  }

  // --- 2. CÁC BÀI TEST ---
  describe("Deployment", function () {
    it("Admin phải có đúng 1 triệu coin - 5000 coin đã chuyển", async function () {
      const { token, admin } = await loadFixture(deployFixture);
      // Tổng cung 1 triệu, trừ đi 5000 đã cho user
      const expected = ethers.parseUnits("995000", 18); 
      expect(await token.balanceOf(admin.address)).to.equal(expected);
    });
  });

  describe("Mua Bảo Hiểm (Integration Test)", function () {
    it("Phải mua thành công khi đã Approve", async function () {
      const { token, insurance, user } = await loadFixture(deployFixture);

      // --- QUAN TRỌNG: Giá vé trong contract của bạn ---
      // Trong code Solidity bạn để: TICKET_PRICE = 1000
      // Tức là 1000 wei (số siêu nhỏ). Tôi sẽ giữ nguyên logic này của bạn để test chạy đúng.
      const ticketPrice = 1000; 

      // B1: User Approve cho contract Bảo hiểm lấy tiền
      await token.connect(user).approve(insurance.target, ticketPrice);

      // B2: Tính thời gian bay (Ngày mai)
      const now = Math.floor(Date.now() / 1000);
      const departureTime = now + 86400 * 2; // 2 ngày sau

      // B3: Gọi lệnh mua
      // .connect(user) để giả lập user là người bấm nút
      await expect(insurance.connect(user).buyInsurance("VN123", departureTime))
        .to.emit(insurance, "PolicyPurchased")
        .withArgs(0, user.address, "VN123");

      // B4: Kiểm tra tiền đã bị trừ chưa
      // Tiền contract bảo hiểm phải tăng lên 1000
      expect(await token.balanceOf(insurance.target)).to.equal(ticketPrice);
    });

    it("Phải BÁO LỖI nếu quên Approve", async function () {
      const { insurance, user } = await loadFixture(deployFixture);
      
      const now = Math.floor(Date.now() / 1000);
      const departureTime = now + 86400 * 2;

      // Cố tình mua mà không approve -> Mong đợi hệ thống báo lỗi (Reverted)
      await expect(
        insurance.connect(user).buyInsurance("VN123", departureTime)
      ).to.be.reverted; // Hoặc .to.be.revertedWith("Loi thanh toan...");
    });
  });
});