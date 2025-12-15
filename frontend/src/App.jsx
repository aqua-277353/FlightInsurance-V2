import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import FlightCoinABI from './FlightCoin.json';
import InsuranceABI from './FlightInsurance.json';
import { styles } from './styles';

// --- CẤU HÌNH ---
const PINATA_API_KEY = "4702f3f047ffed450424";
const PINATA_SECRET_KEY = "e1e5e87727cd351d829952668864dd930241018cc4b52a2cda5a72000d3d3864";
const TOKEN_ADDRESS = "0x92455c50F230b3427D4161f64d0ed871FAfAbAFA";
const INSURANCE_ADDRESS = "0x2C3A571fa309CB7658aF24c95fDE20F87A4cF0C0";
const ADMIN_WALLET = "0xA96f8B97e96c5aC60a22494474dc9A50231B466A".toLowerCase();

function App() {
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [flcBalance, setFlcBalance] = useState("0");
  
  const [loading, setLoading] = useState(false);
  const [ipfsLoading, setIpfsLoading] = useState(false);

  // Dữ liệu Off-chain
  const [dbFlights, setDbFlights] = useState([]);
  const [dbTickets, setDbTickets] = useState([]);
  const [currentCid, setCurrentCid] = useState(""); 

  // Dữ liệu On-chain
  const [blockchainPolicies, setBlockchainPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState(1);

  const formatTime = (ts) => new Date(Number(ts) * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatNumber = (num) => Number(num).toLocaleString('vi-VN');

  // --- 1. PINATA API ---
  const fetchFromPinata = async (cid) => {
    try {
      const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
      return res.data;
    } catch (error) { console.error("IPFS Fetch Error", error); return null; }
  };

  const uploadToPinata = async (flights, tickets) => {
    const body = { flights, tickets, timestamp: Date.now() };
    try {
      setIpfsLoading(true);
      const res = await axios.post(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, body, {
        headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET_KEY }
      });
      return res.data.IpfsHash;
    } catch (error) { 
      alert("Lỗi Upload Pinata! Kiểm tra API Key."); 
      return null;
    } finally { setIpfsLoading(false); }
  };

  // --- 2. LOAD DATA ---
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
      
      // A. Lấy CID mới nhất
      const cidFromChain = await insuranceContract.latestDataCID();
      console.log("CID On-chain:", cidFromChain);

      if (cidFromChain && cidFromChain.length > 0) {
        setCurrentCid(cidFromChain);
        setIpfsLoading(true);
        const data = await fetchFromPinata(cidFromChain);
        if (data) {
          setDbFlights(data.flights || []);
          setDbTickets(data.tickets || []);
        }
        setIpfsLoading(false);
      }

      // B. Lấy danh sách bảo hiểm
      const total = await insuranceContract.nextPolicyId();
      const policies = [];
      for (let i = 0; i < total; i++) {
        const p = await insuranceContract.policies(i);
        policies.push({ id: i, customer: p.customer, flightCode: p.flightCode, scheduledDeparture: p.scheduledDeparture, status: p.status, payoutAmount: p.payoutAmount });
      }
      setBlockchainPolicies(policies);

    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(async (acc) => { if(acc.length) { const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), acc[0]); }});
      window.ethereum.on('accountsChanged', async (acc) => { if(acc.length) { const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), acc[0]); } else setAccount(null); });
    }
  }, [loadData]);

  const connectWallet = async () => { if(window.ethereum) { const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), await (await p.getSigner()).getAddress()); }};

  // --- 3. LOGIC ADMIN ---
  const handleAddFlight = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.toUpperCase();
    const timeStr = e.target.time.value;
    const timestamp = Math.floor(new Date(timeStr).getTime() / 1000);
    
    if(dbFlights.find(f => f.flightNumber === code)) return alert("Mã chuyến đã tồn tại!");

    const newFlight = { flightId: Date.now(), flightNumber: code, scheduledDeparture: timestamp, actualDeparture: null };
    const updatedFlights = [...dbFlights, newFlight];

    const newCid = await uploadToPinata(updatedFlights, dbTickets);
    if (!newCid) return;

    try {
        setLoading(true);
        const contract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
        const tx = await contract.updateDataCID(newCid);
        await tx.wait();
        
        setDbFlights(updatedFlights);
        setCurrentCid(newCid);
        alert(`✅ Đã thêm chuyến bay & Lưu CID lên Blockchain!`);
        e.target.reset();
    } catch (err) { alert("Lỗi Blockchain: " + err.message); }
    setLoading(false);
  };

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    const flightCode = e.target.flightCode.value;
    const customerWallet = e.target.customerWallet.value.trim().toLowerCase();
    
    const newTicket = { ticketId: Date.now(), flightCode, customerWallet };
    const updatedTickets = [...dbTickets, newTicket];

    const newCid = await uploadToPinata(dbFlights, updatedTickets);
    if(!newCid) return;

    try {
        setLoading(true);
        const contract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
        const tx = await contract.updateDataCID(newCid);
        await tx.wait();

        setDbTickets(updatedTickets);
        setCurrentCid(newCid);
        alert("✅ Đã cấp vé & Lưu CID lên Blockchain!");
        e.target.reset();
    } catch (err) { alert("Lỗi Blockchain: " + err.message); }
    setLoading(false);
  };

  const handleUpdateAndPayout = async (flightCode, scheduledTime, isDelayed) => {
    if (!account) return;
    
    const actualTime = isDelayed ? Number(scheduledTime) + (3 * 3600) : Number(scheduledTime);
    const updatedFlights = dbFlights.map(f => f.flightNumber === flightCode ? { ...f, actualDeparture: actualTime } : f);

    const newCid = await uploadToPinata(updatedFlights, dbTickets);
    if(!newCid) return;

    try {
        setLoading(true);
        const contract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
        const tx = await contract.updateFlightStatus(flightCode, actualTime, newCid);
        await tx.wait();
        
        setDbFlights(updatedFlights);
        setCurrentCid(newCid);

        if (isDelayed) {
            const pendingClaims = blockchainPolicies.filter(p => p.flightCode === flightCode && Number(p.status) === 0);
            if (pendingClaims.length > 0) {
                for (let claim of pendingClaims) {
                    await (await contract.processClaim(claim.id)).wait();
                }
                alert("🎉 Đã cập nhật trễ & Chi trả bảo hiểm!");
            } else alert("✅ Đã cập nhật trễ (Không có đơn).");
        } else alert("✅ Cập nhật đúng giờ.");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        loadData(await provider.getSigner(), await (await provider.getSigner()).getAddress());

    } catch (err) { alert("Lỗi: " + err.message); }
    setLoading(false);
  };

  const handleBuyTicket = async (flight) => {
      try {
          setLoading(true);
          const token = new ethers.Contract(TOKEN_ADDRESS, FlightCoinABI.abi, account);
          const ins = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, account);
          if ((await token.allowance(address, INSURANCE_ADDRESS)) < 1000n) await (await token.approve(INSURANCE_ADDRESS, 1000)).wait();
          await (await ins.buyInsurance(flight.flightNumber, flight.scheduledDeparture)).wait();
          alert("Mua thành công!");
          const p = new ethers.BrowserProvider(window.ethereum); loadData(await p.getSigner(), address);
      } catch (e) { alert(e.message) }
      setLoading(false);
  }

  const myTicketFlights = dbFlights.filter(f => {
    const notFlown = !f.actualDeparture;
    const hasTicket = dbTickets.some(t => t.flightCode === f.flightNumber && t.customerWallet.toLowerCase() === address.toLowerCase());
    const bought = blockchainPolicies.some(p => p.flightCode === f.flightNumber && p.customer.toLowerCase() === address.toLowerCase());
    return notFlown && hasTicket && !bought;
  });

  if (!account) return <div style={styles.centerBox}><button onClick={connectWallet} style={styles.btnConnectLarge}>Connect Wallet</button></div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>✈️ FlightShield <span style={styles.versionBadge}>On-chain CID</span></div>
        <div style={{textAlign:'right'}}>
           <div>{address.slice(0,6)}...</div>
           <div style={{color:'green', fontWeight:'bold'}}>{formatNumber(flcBalance)} FLC</div>
        </div>
      </header>
      <div style={styles.ipfsBar}>
         <span>Status: {ipfsLoading ? "Syncing..." : "Synced"}</span>
         <span>CID: {currentCid ? <a href={`https://gateway.pinata.cloud/ipfs/${currentCid}`} target="_blank">{currentCid.slice(0,10)}...</a> : "Empty"}</span>
      </div>

      <div style={styles.navBar}>
         <div style={styles.navContainer}>
            {/* ĐÃ SỬA LẠI: Thêm nút Tab 3 */}
            <button style={activeTab===1?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(1)}>{isAdmin?"1. Quản lý":"1. Mua Vé"}</button>
            <button style={activeTab===2?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(2)}>{isAdmin?"2. Cập nhật":"2. Claim"}</button>
            <button style={activeTab===3?styles.navItemActive:styles.navItem} onClick={()=>setActiveTab(3)}>{isAdmin?"3. Thống kê":"3. Hồ sơ"}</button>
         </div>
      </div>

      <div style={styles.contentWrapper}>
         {loading && <div style={styles.loadingOverlay}>Processing...</div>}

         {/* ADMIN TAB 1: THÊM CHUYẾN & VÉ */}
         {isAdmin && activeTab === 1 && (
            <div style={styles.card}>
               <div style={styles.row}>
                  <div style={styles.col}>
                     <h3>Thêm Chuyến Bay</h3>
                     <form onSubmit={handleAddFlight}>
                        <div style={styles.formGroup}><label style={styles.label}>Mã</label><input name="code" style={styles.input} required/></div>
                        <div style={styles.formGroup}><label style={styles.label}>Giờ</label><input type="datetime-local" name="time" style={styles.input} required/></div>
                        <button type="submit" style={styles.btnPrimary}>Lưu & Update Chain</button>
                     </form>
                  </div>
                  <div style={styles.col}>
                     <h3>Cấp Vé</h3>
                     <form onSubmit={handleIssueTicket}>
                        <div style={styles.formGroup}>
                           <label style={styles.label}>Chuyến</label>
                           <select name="flightCode" style={styles.select}>
                              {dbFlights.filter(f=>!f.actualDeparture).map(f=><option key={f.flightId} value={f.flightNumber}>{f.flightNumber}</option>)}
                           </select>
                        </div>
                        <div style={styles.formGroup}><label style={styles.label}>Ví Khách</label><input name="customerWallet" style={styles.input} required/></div>
                        <button type="submit" style={styles.btnSecondary}>Cấp & Update Chain</button>
                     </form>
                  </div>
               </div>
            </div>
         )}

         {/* ADMIN TAB 2: UPDATE GIỜ */}
         {isAdmin && activeTab === 2 && (
             <div style={styles.card}>
                <h3>Cập nhật trạng thái</h3>
                <div style={styles.grid}>
                   {dbFlights.filter(f=>!f.actualDeparture).map(f=>(
                      <div key={f.flightId} style={styles.itemCard}>
                         <h4>{f.flightNumber}</h4>
                         <p>{formatTime(f.scheduledDeparture)}</p>
                         <div style={{display:'flex', gap:'10px'}}>
                            <button style={styles.btnSuccess} onClick={()=>handleUpdateAndPayout(f.flightNumber, f.scheduledDeparture, false)}>Đúng giờ</button>
                            <button style={styles.btnDanger} onClick={()=>handleUpdateAndPayout(f.flightNumber, f.scheduledDeparture, true)}>Trễ</button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
         )}

         {/* ĐÃ SỬA LẠI: Thêm phần Admin Tab 3 (Thống kê) */}
         {isAdmin && activeTab === 3 && (
            <div style={styles.card}>
               <h3>📊 Lịch sử Đền bù (On-chain)</h3>
               <table style={styles.table}>
                  <thead><tr><th>ID</th><th>Khách</th><th>Chuyến</th><th>Trạng Thái</th><th>Tiền</th></tr></thead>
                  <tbody>
                     {[...blockchainPolicies].sort((a,b) => b.id - a.id).map(p => (
                        <tr key={p.id}>
                           <td>#{p.id}</td>
                           <td>{p.customer.slice(0,6)}...</td>
                           <td><strong>{p.flightCode}</strong></td>
                           <td>{p.status==0?"Chờ":p.status==1?"Từ chối":"Đã trả"}</td>
                           <td>{p.payoutAmount>0?`+${p.payoutAmount}`:"--"}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* CUSTOMER TAB 1: MUA VÉ */}
         {!isAdmin && activeTab === 1 && (
             <div style={styles.card}>
                <h3>Mua Bảo Hiểm (Theo Vé Của Bạn)</h3>
                {myTicketFlights.length > 0 ? (
                   <div style={styles.grid}>
                      {myTicketFlights.map(f=>(
                         <div key={f.flightId} style={styles.itemCard}>
                            <h4>{f.flightNumber}</h4>
                            <p>{formatTime(f.scheduledDeparture)}</p>
                            <button style={styles.btnPrimary} onClick={()=>handleBuyTicket(f)}>Mua (1000 FLC)</button>
                         </div>
                      ))}
                   </div>
                ) : <p>Bạn chưa có vé phù hợp.</p>}
             </div>
         )}
         
         {/* CUSTOMER TAB 2: CLAIM LIST */}
         {!isAdmin && activeTab === 2 && (
             <div style={styles.card}>
                <h3>Danh sách Bảo Hiểm</h3>
                <table style={styles.table}>
                   <thead><tr><th>Chuyến</th><th>Trạng thái</th><th>Tiền</th></tr></thead>
                   <tbody>
                      {blockchainPolicies.filter(p=>p.customer.toLowerCase()===address.toLowerCase()).map(p=>(
                         <tr key={p.id}>
                            <td>{p.flightCode}</td>
                            <td>{p.status==0?"Chờ":p.status==1?"Từ chối":"Đã nhận"}</td>
                            <td>{p.payoutAmount>0?`+${p.payoutAmount}`:"--"}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
         )}

         {/* ĐÃ SỬA LẠI: Thêm phần Customer Tab 3 (Hồ sơ) cho đồng bộ */}
         {!isAdmin && activeTab === 3 && (
            <div style={styles.card}>
               <h3>👤 Hồ sơ cá nhân</h3>
               <p>Chức năng đang phát triển...</p>
               <div style={styles.formGroup}><label style={styles.label}>Ví</label><input value={address} disabled style={{...styles.input, background:'#eee'}}/></div>
            </div>
         )}
      </div>
    </div>
  );
}
export default App;