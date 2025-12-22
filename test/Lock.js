const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Flight Insurance System (Strict Mode)", function () {

  async function deployFixture() {
    const [admin, user, stranger] = await ethers.getSigners();

    // Deploy Token
    const FlightCoin = await ethers.getContractFactory("FlightCoin");
    const token = await FlightCoin.deploy();
    await token.waitForDeployment();

    // Deploy Insurance
    const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
    const insurance = await FlightInsurance.deploy(token.target);
    await insurance.waitForDeployment();

    // Chuyển tiền cho user
    const amount = ethers.parseUnits("5000", 18);
    await token.transfer(user.address, amount);

    return { token, insurance, admin, user, stranger };
  }

  // --- 1. TEST TIÊU CHUẨN ERC20 (MỚI THÊM) ---
  describe("ERC20 Compliance Checks", function () {
    it("Phải có đúng Name, Symbol và Decimals", async function () {
      const { token } = await loadFixture(deployFixture);
      // Nếu dev lười không khai báo name/symbol -> Test Fail ngay
      expect(await token.name()).to.equal("FlightCoin");
      expect(await token.symbol()).to.equal("FLC");
      // Decimals chuẩn thường là 18
      expect(await token.decimals()).to.equal(18);
    });

    it("Phải emit sự kiện Transfer khi chuyển tiền", async function () {
      const { token, admin, user } = await loadFixture(deployFixture);
      // ERC20 bắt buộc phải bắn event Transfer để ví MetaMask cập nhật số dư
      await expect(token.transfer(user.address, 100))
        .to.emit(token, "Transfer")
        .withArgs(admin.address, user.address, 100);
    });

    it("Approve phải cập nhật đúng Allowance (Quyền tiêu tiền)", async function () {
      const { token, user, insurance } = await loadFixture(deployFixture);
      const amount = 1000;
      
      // Lúc đầu chưa approve thì allowance phải là 0
      expect(await token.allowance(user.address, insurance.target)).to.equal(0);

      // Sau khi approve
      await token.connect(user).approve(insurance.target, amount);
      
      // Allowance phải tăng lên đúng số đó -> Chống việc hàm approve "giả trân"
      expect(await token.allowance(user.address, insurance.target)).to.equal(amount);
    });

    it("Không thể chuyển tiền quá số dư (Chống hack tiền âm)", async function () {
      const { token, user, stranger } = await loadFixture(deployFixture);
      // User chỉ có 5000, cố chuyển 1 triệu -> Phải lỗi
      const hugeAmount = ethers.parseUnits("1000000", 18);
      await expect(token.connect(user).transfer(stranger.address, hugeAmount))
        .to.be.reverted; 
        // Hoặc .to.be.revertedWithCustomError nếu dùng error mới
    });
  });

  // --- 2. TEST LOGIC NGHIỆP VỤ (CŨ) ---
  describe("Insurance Logic", function () {
    it("Mua bảo hiểm phải trừ đúng tiền và trừ vào allowance", async function () {
      const { token, insurance, user } = await loadFixture(deployFixture);
      const ticketPrice = 1000; 

      await token.connect(user).approve(insurance.target, ticketPrice);
      
      const now = Math.floor(Date.now() / 1000);
      
      // Mua vé
      await expect(insurance.connect(user).buyInsurance("VN123", now + 86400))
        .to.emit(insurance, "PolicyPurchased");

      // Check 1: Tiền về Contract bảo hiểm
      expect(await token.balanceOf(insurance.target)).to.equal(ticketPrice);

      // Check 2 (QUAN TRỌNG): Allowance của user phải về 0
      // Nếu Token "dỏm", nó trừ tiền nhưng không trừ allowance -> Lỗi ERC20
      expect(await token.allowance(user.address, insurance.target)).to.equal(0);
    });
  });
});