// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlightInsurance is Ownable, ReentrancyGuard {
    
    IERC20 public paymentToken;
    uint256 public nextPolicyId;
    string public latestDataCID; // CID dữ liệu chuyến bay (Admin quản lý)

    // --- MỚI: Mapping lưu CID hồ sơ cá nhân (Mỗi người tự quản lý) ---
    mapping(address => string) public userProfiles;

    enum Status { PENDING, REJECTED, PAID }

    struct Policy {
        uint256 claimId;
        address customer;
        string flightCode;
        uint256 scheduledDeparture;
        Status status;
        uint256 claimTime;
        uint256 payoutAmount;
    }

    mapping(uint256 => Policy) public policies;
    mapping(string => uint256) public flightActualDepartures;

    uint256 public constant TICKET_PRICE = 1000;      
    uint256 public constant PAYOUT_AMOUNT = 8888;     
    uint256 public constant PURCHASE_DEADLINE = 2 days; 
    uint256 public constant DELAY_THRESHOLD = 2 hours;

    event PolicyPurchased(uint256 policyId, address customer, string flightCode);
    event ClaimProcessed(uint256 policyId, string status, uint256 amount);
    event DataUpdated(string newCid); 
    
    // --- MỚI: Sự kiện khi người dùng cập nhật hồ sơ ---
    event UserProfileUpdated(address indexed user, string newCid);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        paymentToken = IERC20(_tokenAddress);
    }

    // --- 1. HÀM CẬP NHẬT CID CHUYẾN BAY (ADMIN) ---
    function updateDataCID(string memory _newCid) external onlyOwner {
        latestDataCID = _newCid;
        emit DataUpdated(_newCid);
    }

    // --- 2. CẬP NHẬT TRẠNG THÁI BAY (ADMIN) ---
    function updateFlightStatus(string memory _flightCode, uint256 _actualDeparture, string memory _newCid) external onlyOwner {
        flightActualDepartures[_flightCode] = _actualDeparture;
        latestDataCID = _newCid; 
        emit DataUpdated(_newCid);
    }

    // --- 3. MUA BẢO HIỂM ---
    function buyInsurance(string memory _flightCode, uint256 _scheduledDeparture) external nonReentrant {
        require(_scheduledDeparture > block.timestamp, "Gio bay khong hop le");
        // require(_scheduledDeparture - block.timestamp >= PURCHASE_DEADLINE, "Phai mua truoc 2 ngay");
        
        bool success = paymentToken.transferFrom(msg.sender, address(this), TICKET_PRICE);
        require(success, "Loi thanh toan: Hay Approve Token truoc");

        uint256 policyId = nextPolicyId++;

        policies[policyId] = Policy({
            claimId: policyId,
            customer: msg.sender,
            flightCode: _flightCode,
            scheduledDeparture: _scheduledDeparture,
            status: Status.PENDING,
            claimTime: block.timestamp,
            payoutAmount: 0
        });

        emit PolicyPurchased(policyId, msg.sender, _flightCode);
    }

    // --- 4. XỬ LÝ ĐỀN BÙ ---
    function processClaim(uint256 _policyId) external nonReentrant {
        Policy storage p = policies[_policyId];
        require(p.status == Status.PENDING, "Don da xu ly xong");

        uint256 actualTime = flightActualDepartures[p.flightCode];
        require(actualTime > 0, "Chua co gio ha canh");

        if (actualTime > p.scheduledDeparture && (actualTime - p.scheduledDeparture > DELAY_THRESHOLD)) {
            require(paymentToken.balanceOf(address(this)) >= PAYOUT_AMOUNT, "Quy bao hiem tam het tien");

            p.status = Status.PAID;
            p.payoutAmount = PAYOUT_AMOUNT;

            require(paymentToken.transfer(p.customer, PAYOUT_AMOUNT), "Loi chuyen khoan den bu");
            emit ClaimProcessed(_policyId, "PAID", PAYOUT_AMOUNT);
        } else {
            p.status = Status.REJECTED;
            p.payoutAmount = 0;
            emit ClaimProcessed(_policyId, "REJECTED", 0);
        }
    }
    
    // --- 5. TÍNH NĂNG MỚI: CẬP NHẬT HỒ SƠ NGƯỜI DÙNG (AI CŨNG GỌI ĐƯỢC) ---
    function updateUserProfile(string memory _newCid) external {
        // Lưu CID vào mapping của chính người gọi hàm (msg.sender)
        userProfiles[msg.sender] = _newCid;
        emit UserProfileUpdated(msg.sender, _newCid);
    }

    // --- 6. QUẢN LÝ TOKEN ---
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(paymentToken.transfer(msg.sender, amount), "Loi rut tien");
    }
}