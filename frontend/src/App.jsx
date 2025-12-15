import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import FlightCoinABI from './FlightCoin.json';
import InsuranceABI from './FlightInsurance.json';
import { styles } from './styles'; // Import styles

// --- IMPORT CÁC COMPONENT CON ---
import AdminFlightManager from './components/AdminFlightManager';
import AdminUpdateManager from './components/AdminUpdateManager';
import AdminStats from './components/AdminStats';
import CustomerBuyTicket from './components/CustomerBuyTicket';
import CustomerClaims from './components/CustomerClaims';
import CustomerProfile from './components/CustomerProfile';

// --- CẤU HÌNH (ĐIỀN KEY CỦA BẠN VÀO ĐÂY) ---
const PINATA_API_KEY = "YOUR_KEY"; 
const PINATA_SECRET_KEY = "YOUR_SECRET";
const TOKEN_ADDRESS = "0x6C04b47aF82C34D70F9108784619786a1E5C31FE";
const INSURANCE_ADDRESS = "0xb02382D5b48fe757F4D8d401F07D67A8163562C5";
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
  const [dbProfile, setDbProfile] = useState({});
  const [currentCid, setCurrentCid] = useState("");
  const [blockchainPolicies, setBlockchainPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState(1);

  // Helper Format
  const formatTime = (ts) => new Date(Number(ts) * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatNumber = (num) => Number(num).toLocaleString('vi-VN');

  // --- PINATA & LOGIC (GIỮ NGUYÊN NHƯ CŨ) ---
  const fetchFromPinata = async (cid) => {
    if (!cid) return null;
    try {
      const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
      return res.data;
    } catch (error) { return null; }
  };

  const uploadToPinata = async (flights, tickets, profiles) => {
    const body = { flights, tickets, profiles, timestamp: Date.now() };
    try {
      setIpfsLoading(true);
      const res = await axios.post(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, body, {
        headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET_KEY }
      });
      const newCid = res.data.IpfsHash;
      setCurrentCid(newCid);
      localStorage.setItem('LATEST_IPFS_CID', newCid);
      return newCid;
    } catch (error) { alert("Lỗi IPFS!"); } finally { setIpfsLoading(false); }
  };

  const loadData = useCallback(async (signer, userAddress) => {
    setLoading(true);
    setAccount(signer);
    setAddress(userAddress);
    setIsAdmin(userAddress.toLowerCase() === ADMIN_WALLET);
    try {
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, FlightCoinABI.abi, signer);
      const bal = await tokenContract.balanceOf(userAddress);
      setFlcBalance(bal.toString());

      const insuranceContract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, signer);
      const total = await insuranceContract.nextPolicyId();
      const policies = [];
      for (let i = 0; i < total; i++) {
        const p = await insuranceContract.policies(i);
        policies.push({ id: i, customer: p.customer, flightCode: p.flightCode, scheduledDeparture: p.scheduledDeparture, status: p.status, payoutAmount: p.payoutAmount, claimTime: p.claimTime });
      }
      setBlockchainPolicies(policies);

      const savedCid = localStorage.getItem('LATEST_IPFS_CID');
      if (savedCid) {
        setIpfsLoading(true);
        const data = await fetchFromPinata(savedCid);
        if (data) {
          setDbFlights(data.flights || []);
          setDbTickets(data.tickets || []);
          setDbProfile(data.profiles?.[userAddress.toLowerCase()] || {});
          setCurrentCid(savedCid);
        }
        setIpfsLoading(false);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(async (acc) => { if (acc.length) { const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), acc[0]); } });
      window.ethereum.on('accountsChanged', async (acc) => { if (acc.length) { const p = new ethers.BrowserProvider(window.ethereum); setActiveTab(1); loadData(await p.getSigner(), acc[0]); } else { setAccount(null); } });
    }
  }, [loadData]);

  const connectWallet = async () => { if (window.ethereum) { const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), await (await p.getSigner()).getAddress()); } };

  // --- HANDLERS ---
  const handleAddFlight = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.toUpperCase();
    const timeStr = e.target.time.value;
    const timestamp = Math.floor(new Date(timeStr).getTime() / 1000);
    if(dbFlights.find(f => f.flightNumber === code)) return alert("Trùng mã!");
    const updatedFlights = [...dbFlights, { flightId: Date.now(), flightNumber: code, scheduledDeparture: timestamp, actualDeparture: null }];
    setDbFlights(updatedFlights);
    await uploadToPinata(updatedFlights, dbTickets, { [address.toLowerCase()]: dbProfile });
    alert(`✅ Đã thêm chuyến bay!`);
    e.target.reset();
  };

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    const flightCode = e.target.flightCode.value;
    const customerWallet = e.target.customerWallet.value.trim().toLowerCase();
    const customerName = e.target.customerName.value;
    const newTicket = { ticketId: Date.now(), flightCode, customerWallet, customerName };
    const updatedTickets = [...dbTickets, newTicket];
    setDbTickets(updatedTickets);
    await uploadToPinata(dbFlights, updatedTickets, { [address.toLowerCase()]: dbProfile });
    alert(`✅ Đã cấp vé!`);
    e.target.reset();
  };

  const handleUpdateAndPayout = async (flightCode, scheduledTime, isDelayed) => {
    if (!account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
      const actualTime = isDelayed ? Number(scheduledTime) + (3 * 3600) : Number(scheduledTime);
      const txUpdate = await contract.updateFlightStatus(flightCode, actualTime);
      await txUpdate.wait();
      const updatedFlights = dbFlights.map(f => f.flightNumber === flightCode ? { ...f, actualDeparture: actualTime } : f);
      setDbFlights(updatedFlights);
      uploadToPinata(updatedFlights, dbTickets, { [address.toLowerCase()]: dbProfile });
      if (isDelayed) {
        const pendingClaims = blockchainPolicies.filter(p => p.flightCode === flightCode && Number(p.status) === 0);
        if (pendingClaims.length) { for (let c of pendingClaims) { await (await contract.processClaim(c.id)).wait(); } alert("🎉 Đã chi trả xong!"); }
      } else alert("✅ Cập nhật xong.");
      const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), await (await p.getSigner()).getAddress());
    } catch (err) { alert("Lỗi: " + err.message); }
    setLoading(false);
  };

  const handleBuyTicket = async (flight) => {
    if (!account) return;
    setLoading(true);
    try {
      const token = new ethers.Contract(TOKEN_ADDRESS, FlightCoinABI.abi, account);
      const ins = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
      if ((await token.allowance(address, INSURANCE_ADDRESS)) < 1000n) await (await token.approve(INSURANCE_ADDRESS, 1000)).wait();
      await (await ins.buyInsurance(flight.flightNumber, flight.scheduledDeparture)).wait();
      alert("🎉 Mua thành công!");
      const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), await (await p.getSigner()).getAddress());
    } catch (err) { alert("Lỗi: " + err.message); }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newProfile = { fullName: e.target.fullName.value, email: e.target.email.value, phone: e.target.phone.value };
    setDbProfile(newProfile);
    await uploadToPinata(dbFlights, dbTickets, { [address.toLowerCase()]: newProfile });
    alert("✅ Cập nhật xong!");
  };

  // --- RENDER ---
  if (!account) return (
    <div style={styles.centerBox}>
      <div style={styles.loginCard}>
        <h1 style={{color: '#0056b3', marginBottom: '20px'}}>✈️ FlightShield</h1>
        <button onClick={connectWallet} style={styles.btnConnectLarge}>🦊 Kết nối Ví MetaMask</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>✈️ FlightShield <span style={styles.versionBadge}>Modular</span></div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize:'13px', color:'#555'}}>{address.slice(0,6)}...{address.slice(-4)}</div>
          <div style={{color: '#27ae60', fontWeight: 'bold'}}>{formatNumber(flcBalance)} FLC</div>
        </div>
      </header>
      <div style={styles.ipfsBar}>
         <span>🌐 Status: {ipfsLoading ? <strong>⏳ Syncing...</strong> : <strong>✅ Synced</strong>}</span>
         <span>📦 CID: {currentCid ? currentCid.slice(0, 10)+"..." : "Empty"}</span>
      </div>

      <div style={styles.navBar}>
        <div style={styles.navContainer}>
          {isAdmin ? (
            <>
              <button style={activeTab===1?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(1)}>1. Quản lý</button>
              <button style={activeTab===2?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(2)}>2. Cập nhật</button>
              <button style={activeTab===3?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(3)}>3. Thống kê</button>
            </>
          ) : (
            <>
              <button style={activeTab===1?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(1)}>1. Mua Vé</button>
              <button style={activeTab===2?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(2)}>2. Claim</button>
              <button style={activeTab===3?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(3)}>3. Hồ Sơ</button>
            </>
          )}
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {(loading || ipfsLoading) && <div style={styles.loadingOverlay}><div style={styles.spinner}></div>Đang xử lý...</div>}

        {/* --- RENDER COMPONENTS DỰA TRÊN TAB --- */}
        {isAdmin ? (
          <>
            {activeTab === 1 && <AdminFlightManager dbFlights={dbFlights} dbTickets={dbTickets} handleAddFlight={handleAddFlight} handleIssueTicket={handleIssueTicket} formatTime={formatTime} />}
            {activeTab === 2 && <AdminUpdateManager dbFlights={dbFlights} handleUpdateAndPayout={handleUpdateAndPayout} formatTime={formatTime} />}
            {activeTab === 3 && <AdminStats blockchainPolicies={blockchainPolicies} formatNumber={formatNumber} />}
          </>
        ) : (
          <>
            {activeTab === 1 && <CustomerBuyTicket dbFlights={dbFlights} dbTickets={dbTickets} blockchainPolicies={blockchainPolicies} address={address} handleBuyTicket={handleBuyTicket} formatTime={formatTime} />}
            {activeTab === 2 && <CustomerClaims blockchainPolicies={blockchainPolicies} address={address} formatTime={formatTime} formatNumber={formatNumber} />}
            {activeTab === 3 && <CustomerProfile address={address} dbProfile={dbProfile} handleUpdateProfile={handleUpdateProfile} />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;