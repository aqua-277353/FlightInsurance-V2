import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import FlightCoinABI from './FlightCoin.json';
import InsuranceABI from './FlightInsurance.json';
import { styles } from './styles';

// --- IMPORT COMPONENTS ---
import AdminManager from './components/AdminManager';
import AdminUpdater from './components/AdminUpdater';
import AdminStats from './components/AdminStats';
import CustomerBuy from './components/CustomerBuy';
import CustomerClaim from './components/CustomerClaim';
import CustomerProfile from './components/CustomerProfile';

// --- CẤU HÌNH ---
const PINATA_API_KEY = "4702f3f047ffed450424";
const PINATA_SECRET_KEY = "e1e5e87727cd351d829952668864dd930241018cc4b52a2cda5a72000d3d3864";
const TOKEN_ADDRESS = "0x9532E005075d7e81d2958aa64B133cDD909Ea279";
const INSURANCE_ADDRESS = "0x884098fB1F874391A73BBa61b84aDb34382af2C1";
const ADMIN_WALLET = "0xA96f8B97e96c5aC60a22494474dc9A50231B466A".toLowerCase();

function App() {
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [flcBalance, setFlcBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [ipfsLoading, setIpfsLoading] = useState(false);

  // Data State
  const [dbFlights, setDbFlights] = useState([]);
  const [dbTickets, setDbTickets] = useState([]);
  const [currentCid, setCurrentCid] = useState(""); 
  const [blockchainPolicies, setBlockchainPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState(1);

  const formatTime = (ts) => new Date(Number(ts) * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatNumber = (num) => Number(num).toLocaleString('vi-VN');

  // --- API ---
  const fetchFromPinata = async (cid) => {
    try { 
        const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
        return res.data; 
    } catch (e) { return null; }
  };

  const uploadToPinata = async (flights, tickets) => {
    try {
      setIpfsLoading(true);
      const res = await axios.post(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, { flights, tickets, timestamp: Date.now() }, { headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET_KEY } });
      return res.data.IpfsHash;
    } catch (e) { alert("Lỗi Upload IPFS!"); return null; } finally { setIpfsLoading(false); }
  };

  // --- LOAD DATA ---
  const loadData = useCallback(async (signer, userAddress) => {
    setLoading(true); 
    setAccount(signer); 
    setAddress(userAddress); 
    const isUserAdmin = userAddress.toLowerCase() === ADMIN_WALLET;
    setIsAdmin(isUserAdmin);

    try {
      const token = new ethers.Contract(TOKEN_ADDRESS, FlightCoinABI.abi, signer);
      const bal = await token.balanceOf(userAddress);
      setFlcBalance(bal.toString());

      const insurance = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, signer);
      
      const cid = await insurance.latestDataCID();
      if (cid && cid.length > 0) {
        setCurrentCid(cid); setIpfsLoading(true);
        const data = await fetchFromPinata(cid);
        if (data) { 
            setDbFlights(data.flights || []); 
            setDbTickets(data.tickets || []); 
        }
        setIpfsLoading(false);
      } else { 
          setDbFlights([]); setDbTickets([]); 
      }

      const total = await insurance.nextPolicyId();
      const policies = [];
      for (let i = 0; i < total; i++) {
        const p = await insurance.policies(i);
        policies.push({ id: i, customer: p.customer, flightCode: p.flightCode, scheduledDeparture: p.scheduledDeparture, status: p.status, payoutAmount: p.payoutAmount });
      }
      setBlockchainPolicies(policies);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  // --- QUẢN LÝ TÀI KHOẢN ---
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
            const newAddress = accounts[0];
            setDbTickets([]); setBlockchainPolicies([]); setFlcBalance("0"); setActiveTab(1);
            setAddress(newAddress);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await provider.getSigner();
            await loadData(newSigner, newAddress); 
        } else {
            setAccount(null); setAddress(""); setIsAdmin(false);
        }
    };

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
         if (accounts.length > 0) {
             handleAccountsChanged(accounts);
         }
      });
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => { 
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    };
  }, [loadData]);

  const connectWallet = async () => { 
      if(window.ethereum) { 
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch(e) { alert("Lỗi kết nối: " + e.message); }
      } else alert("Vui lòng cài MetaMask!");
  };

  // --- HANDLERS ---
  const handleAddFlight = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.toUpperCase();
    const timestamp = Math.floor(new Date(e.target.time.value).getTime() / 1000);
    if(dbFlights.find(f => f.flightNumber === code)) return alert("Trùng mã!");
    const updated = [...dbFlights, { flightId: Date.now(), flightNumber: code, scheduledDeparture: timestamp, actualDeparture: null }];
    const cid = await uploadToPinata(updated, dbTickets);
    if(cid) { setLoading(true); await (await (new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account)).updateDataCID(cid)).wait(); setDbFlights(updated); setCurrentCid(cid); alert("Đã thêm!"); setLoading(false); }
  };

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    const updated = [...dbTickets, { ticketId: Date.now(), flightCode: e.target.flightCode.value, customerWallet: e.target.customerWallet.value.trim().toLowerCase() }];
    const cid = await uploadToPinata(dbFlights, updated);
    if(cid) { setLoading(true); await (await (new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account)).updateDataCID(cid)).wait(); setDbTickets(updated); setCurrentCid(cid); alert("Đã cấp vé!"); setLoading(false); }
  };

  // --- [ĐÃ SỬA LỖI] HÀM CẬP NHẬT GIỜ & XỬ LÝ TRẠNG THÁI ---
  const handleUpdateAndPayout = async (flightCode, scheduledTime, isDelayed) => {
    // 1. Tính toán giờ hạ cánh thực tế
    const actual = isDelayed ? Number(scheduledTime) + (3*3600) : Number(scheduledTime);
    
    // 2. Cập nhật dữ liệu IPFS
    const updated = dbFlights.map(f => f.flightNumber === flightCode ? { ...f, actualDeparture: actual } : f);
    const cid = await uploadToPinata(updated, dbTickets);
    
    if(cid) {
      setLoading(true);
      try {
          const contract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
          
          // 3. Cập nhật giờ bay và CID lên Blockchain
          console.log("⏳ Đang cập nhật giờ bay...");
          const txUpdate = await contract.updateFlightStatus(flightCode, actual, cid);
          await txUpdate.wait();
          
          setDbFlights(updated); 
          setCurrentCid(cid);
          
          // 4. [FIX LỖI QUAN TRỌNG] XỬ LÝ TOÀN BỘ ĐƠN BẢO HIỂM "PENDING"
          // Dù Trễ hay Đúng Giờ, ta đều phải gọi hàm processClaim.
          // Smart Contract sẽ tự quyết định là Trả tiền (PAID) hay Từ chối (REJECTED).
          
          const pendingClaims = blockchainPolicies.filter(p => p.flightCode === flightCode && Number(p.status) === 0);
          
          if(pendingClaims.length > 0) {
              console.log(`🔍 Tìm thấy ${pendingClaims.length} đơn bảo hiểm đang chờ xử lý...`);
              
              for(let c of pendingClaims) {
                 console.log(`Processing claim ID: ${c.id}`);
                 const txProcess = await contract.processClaim(c.id);
                 await txProcess.wait();
              }
              
              if(isDelayed) {
                  alert(`🎉 Đã cập nhật TRỄ (>2h). Đã chi trả cho ${pendingClaims.length} khách hàng.`);
              } else {
                  alert(`✅ Đã cập nhật ĐÚNG GIỜ. Đã từ chối/đóng ${pendingClaims.length} đơn bảo hiểm.`);
              }
          } else {
              alert("✅ Cập nhật trạng thái thành công (Không có đơn bảo hiểm nào cần xử lý).");
          }
          
          // 5. Reload data để cập nhật bảng thống kê
          loadData(account, address); 
      } catch (err) { alert("Lỗi: " + err.message); }
      setLoading(false);
    }
  };

  const handleBuyTicket = async (flight) => {
      if(!account) return alert("Kết nối ví!");
      setLoading(true);
      try {
        const token = new ethers.Contract(TOKEN_ADDRESS, FlightCoinABI.abi, account);
        const ins = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
        if((await token.allowance(address, INSURANCE_ADDRESS)) < 1000n) await (await token.approve(INSURANCE_ADDRESS, 1000)).wait();
        await (await ins.buyInsurance(flight.flightNumber, flight.scheduledDeparture)).wait();
        alert("Mua thành công!"); loadData(account, address);
      } catch (e) { alert("Lỗi: " + (e.reason || e.message)); } finally { setLoading(false); }
  };

  const handleEmergencyFix = async () => {
    if(!window.confirm("CẢNH BÁO: Reset toàn bộ dữ liệu IPFS?")) return;
    setLoading(true);
    try {
        const newCid = await uploadToPinata([], []);
        if (newCid) {
            await (await (new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account)).updateDataCID(newCid)).wait();
            setDbFlights([]); setDbTickets([]); setCurrentCid(newCid);
            alert("Đã Reset!");
        }
    } catch (err) { alert("Lỗi Reset: " + err.message); } finally { setLoading(false); }
  };

  const myTicketFlights = dbFlights.filter(f => !f.actualDeparture && dbTickets.some(t => t.flightCode === f.flightNumber && t.customerWallet.toLowerCase() === address.toLowerCase()) && !blockchainPolicies.some(p => p.flightCode === f.flightNumber && p.customer.toLowerCase() === address.toLowerCase()));

  // --- RENDER ---
  if (!account) return <div style={styles.centerBox}><button onClick={connectWallet} style={styles.btnConnectLarge}>Kết nối Ví MetaMask</button></div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>✈️ FlightShield <span style={styles.versionBadge}>Final Fix</span></div>
        <div style={{textAlign:'right'}}><div>{address.slice(0,6)}...</div><div style={{color:'green', fontWeight:'bold'}}>{formatNumber(flcBalance)} FLC</div></div>
      </header>
      <div style={styles.ipfsBar}><span>Status: {ipfsLoading ? "Syncing..." : "Synced"}</span><span>CID: {currentCid ? currentCid.slice(0,10)+"..." : "Trống"}</span></div>

      <div style={styles.navBar}>
         <div style={styles.navContainer}>
            <button style={activeTab===1?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(1)}>{isAdmin?"1. Quản lý":"1. Mua Vé"}</button>
            <button style={activeTab===2?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(2)}>{isAdmin?"2. Cập nhật":"2. Claim"}</button>
            <button style={activeTab===3?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(3)}>{isAdmin?"3. Thống kê":"3. Hồ sơ"}</button>
         </div>
      </div>

      <div style={styles.contentWrapper}>
         {loading && <div style={styles.loadingOverlay}><div style={styles.spinner}></div>Đang xử lý...</div>}
         {isAdmin ? (
            <>
              {activeTab === 1 && <AdminManager dbFlights={dbFlights} handleAddFlight={handleAddFlight} handleIssueTicket={handleIssueTicket} formatTime={formatTime} handleEmergencyFix={handleEmergencyFix} />}
              {activeTab === 2 && <AdminUpdater dbFlights={dbFlights} handleUpdateAndPayout={handleUpdateAndPayout} formatTime={formatTime} />}
              {activeTab === 3 && <AdminStats blockchainPolicies={blockchainPolicies} />}
            </>
         ) : (
            <>
              {activeTab === 1 && <CustomerBuy myTicketFlights={myTicketFlights} handleBuyTicket={handleBuyTicket} formatTime={formatTime} />}
              {activeTab === 2 && <CustomerClaim blockchainPolicies={blockchainPolicies} address={address} />}
              {activeTab === 3 && <CustomerProfile address={address} />}
            </>
         )}
      </div>
    </div>
  );
}
export default App;