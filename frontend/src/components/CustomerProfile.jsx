import React, { useState, useEffect } from 'react';
import { styles } from '../styles';
import { ethers } from 'ethers';
// Import các hàm tiện ích
import { pinFileToIPFS, pinJSONToIPFS } from '../utils/pinata';
import { encryptData, decryptData } from '../utils/encryption';

// --- CẤU HÌNH SMART CONTRACT ---
const RAW_ADDRESS = "0x884098fB1F874391A73BBa61b84aDb34382af2C1"; 
const CONTRACT_ADDRESS = RAW_ADDRESS.replace(/\./g, "").trim();

const CONTRACT_ABI = [
  "function updateUserProfile(string memory _newCid) external", 
  "function userProfiles(address _user) public view returns (string memory)"
];

const IPFS_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/", 
    "https://ipfs.io/ipfs/",             
    "https://4everland.io/ipfs/",         
];

export default function CustomerProfile({ address }) {
  // 1. STATE FORM
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  // 2. STATE ẢNH ĐẠI DIỆN
  const [avatarUrl, setAvatarUrl] = useState('');
  const [file, setFile] = useState(null);

  // 3. STATE CĂN CƯỚC CÔNG DÂN (PDF) - MỚI
  const [pdfUrl, setPdfUrl] = useState(''); // Link hiển thị
  const [pdfFile, setPdfFile] = useState(null); // File gốc để upload

  // 4. STATE TRẠNG THÁI
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // --- HÀM TRÍCH XUẤT CID SẠCH ---
  const extractCID = (input) => {
      if (!input) return "";
      let cid = input;
      if (cid.includes("/ipfs/")) cid = cid.split("/ipfs/").pop();
      if (cid.startsWith("ipfs://")) cid = cid.replace("ipfs://", "");
      return cid.split("?")[0].split("#")[0];
  };

  // --- HÀM TẢI DỮ LIỆU ĐA CỔNG ---
  const fetchFromIPFS = async (rawInput) => {
      const cid = extractCID(rawInput); 
      for (const gateway of IPFS_GATEWAYS) {
          try {
              const url = `${gateway}${cid}`;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000); 
              const response = await fetch(url, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (response.ok) return await response.json();
          } catch (err) {
              console.warn(`Gateway ${gateway} failed, trying next...`);
          }
      }
      throw new Error("Không thể tải dữ liệu (Tất cả Gateway đều bận hoặc bị chặn).");
  };

  // --- HÀM TẠO LINK GATEWAY (Dùng chung cho cả Ảnh và PDF) ---
  const getGatewayUrl = (rawCid) => {
      if (!rawCid) return "";
      const cid = extractCID(rawCid);
      return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  // --- TỰ ĐỘNG TẢI DỮ LIỆU ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address || !window.ethereum) return;
      if (!ethers.isAddress(CONTRACT_ADDRESS)) {
          setStatus("⚠️ Lỗi Config: Địa chỉ Contract sai.");
          return;
      }

      setFetching(true);
      setStatus('⏳ Đang kết nối Blockchain...'); 

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        let rawHash;
        try {
            rawHash = await contract.userProfiles(address);
        } catch (contractErr) {
            throw new Error("Không thể đọc dữ liệu từ Smart Contract.");
        }

        if (!rawHash || rawHash === "") {
          setStatus(''); 
          setFetching(false);
          return;
        }

        setStatus('🌍 Đang tải dữ liệu từ IPFS...');
        let data;
        try {
            data = await fetchFromIPFS(rawHash);
        } catch (ipfsErr) {
            throw new Error("Không tải được file JSON từ IPFS.");
        }

        setStatus('🔐 Vui lòng KÝ TRÊN VÍ để xem dữ liệu...');
        
        // --- GIẢI MÃ DỮ LIỆU ---
        if (!data.encryptedData) {
            // Trường hợp dữ liệu cũ chưa mã hóa (Fallback)
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || ''
            });
            setAvatarUrl(getGatewayUrl(data.image));
            setPdfUrl(getGatewayUrl(data.pdf)); // Lấy PDF nếu có
            setStatus('✅ Dữ liệu đã tải (Không bảo mật)!');
            setFetching(false);
            return;
        }

        const signer = await provider.getSigner();
        const signature = await signer.signMessage("Ký để bảo mật dữ liệu FlightInsurance của bạn");
        const decryptedData = decryptData(data.encryptedData, signature);

        if (decryptedData) {
          setFormData({
            fullName: decryptedData.fullName || '',
            email: decryptedData.email || '',
            phone: decryptedData.phone || '',
          });
          
          // Set URL cho Ảnh và PDF
          setAvatarUrl(getGatewayUrl(decryptedData.image));
          setPdfUrl(getGatewayUrl(decryptedData.pdf)); // Trường dữ liệu mới: pdf

          setStatus('✅ Hồ sơ đã được tải thành công!');
        } else {
          throw new Error("Giải mã thất bại. Có thể bạn dùng sai ví?");
        }

      } catch (error) {
        console.error("Chi tiết lỗi Load:", error);
        if (error.code === 'ACTION_REJECTED' || error.info?.error?.code === 4001) {
            setStatus('⚠️ Bạn đã từ chối ký xác nhận.');
        } else {
            setStatus('❌ Lỗi: ' + (error.reason || error.message));
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [address, reloadTrigger]); 

  // --- XỬ LÝ LƯU HỒ SƠ ---
  const handleSave = async () => {
    if (!address) return alert("Chưa kết nối ví!");
    setLoading(true);
    setStatus('🕒 Đang xử lý...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus('🔐 Vui lòng ký để mã hóa dữ liệu...');
      const signature = await signer.signMessage("Ký để bảo mật dữ liệu FlightInsurance của bạn");

      // 1. Upload ẢNH (Nếu có file mới)
      let finalImageCid = avatarUrl ? extractCID(avatarUrl) : "";
      if (file) {
        setStatus('☁️ Đang tải ảnh Avatar lên IPFS...');
        const resultUrl = await pinFileToIPFS(file);
        if (!resultUrl) throw new Error("Lỗi upload ảnh.");
        finalImageCid = extractCID(resultUrl); 
      }

      // 2. Upload PDF CCCD (Nếu có file mới) - MỚI
      let finalPdfCid = pdfUrl ? extractCID(pdfUrl) : "";
      if (pdfFile) {
        setStatus('📄 Đang tải Căn cước công dân lên IPFS...');
        const resultPdfUrl = await pinFileToIPFS(pdfFile);
        if (!resultPdfUrl) throw new Error("Lỗi upload file PDF.");
        finalPdfCid = extractCID(resultPdfUrl);
      }

      // 3. Đóng gói dữ liệu
      const rawData = { 
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          image: finalImageCid, 
          pdf: finalPdfCid, // Thêm trường PDF vào JSON
          walletAddress: address 
      };
      
      setStatus('🔒 Đang mã hóa dữ liệu...');
      const encryptedData = encryptData(rawData, signature);

      const payload = {
        pinataMetadata: { name: `FlightUser_${address}` },
        pinataContent: {
          owner: address,
          encryptedData: encryptedData,
          updatedAt: new Date().toISOString()
        }
      };
      
      setStatus('🚀 Đang lưu dữ liệu lên IPFS...');
      const ipfsHash = await pinJSONToIPFS(payload); 

      if (ipfsHash) {
        setStatus('🔗 Đang xác thực trên Blockchain...');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const tx = await contract.updateUserProfile(ipfsHash);
        setStatus('⏳ Đang chờ xác nhận giao dịch...');
        await tx.wait(); 

        setStatus('✅ Lưu thành công! Đang tải lại...');
        setReloadTrigger(prev => prev + 1);
        setFile(null);
        setPdfFile(null); // Reset file input
      }

    } catch (error) {
      console.error("Lỗi Save:", error);
      if (error.code === 'ACTION_REJECTED') {
          setStatus('⚠️ Bạn đã hủy giao dịch.');
      } else {
          setStatus('❌ Lỗi: ' + (error.reason || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // Handle đổi Ảnh
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setAvatarUrl(URL.createObjectURL(f));
  };

  // Handle đổi PDF - MỚI
  const handlePdfChange = (e) => {
      const f = e.target.files[0];
      if (f && f.type === "application/pdf") {
          setPdfFile(f);
          setPdfUrl(URL.createObjectURL(f)); // Tạo link preview tạm thời
      } else {
          alert("Vui lòng chỉ chọn file PDF!");
      }
  };

  return (
    <div style={styles.card}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3>👤 Hồ sơ khách hàng</h3>
        {fetching && <span style={{fontSize: '12px', color: '#007bff'}}>⏳ Đang đồng bộ...</span>}
      </div>
      
      {/* VÍ */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Ví kết nối</label>
        <input value={address || ''} disabled style={{...styles.input, background:'#eee', color: '#555'}}/>
      </div>

      {/* ẢNH ĐẠI DIỆN */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Ảnh đại diện</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', 
            border: '2px solid #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{color: '#ccc', fontSize: '30px'}}>👤</span>
            )}
          </div>
          <input type="file" onChange={handleFileChange} accept="image/*" disabled={loading || fetching} style={{ fontSize: '14px' }} />
        </div>
      </div>

      {/* THÔNG TIN CÁ NHÂN */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Họ và Tên</label>
        <input name="fullName" value={formData.fullName} onChange={handleChange} disabled={loading || fetching} style={styles.input} />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email</label>
        <input name="email" value={formData.email} onChange={handleChange} disabled={loading || fetching} style={styles.input} />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Số điện thoại</label>
        <input name="phone" value={formData.phone} onChange={handleChange} disabled={loading || fetching} style={styles.input} />
      </div>

      {/* --- PHẦN MỚI: CĂN CƯỚC CÔNG DÂN (PDF) --- */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Căn cước công dân (File PDF)</label>
        <input 
            type="file" 
            accept="application/pdf" 
            onChange={handlePdfChange} 
            disabled={loading || fetching}
            style={{...styles.input, padding: '5px'}} 
        />
        
        {/* KHUNG HIỂN THỊ PDF */}
        {pdfUrl && (
            <div style={{ marginTop: '10px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
                <p style={{fontSize: '12px', padding: '5px', background: '#f1f1f1', margin: 0, borderBottom: '1px solid #ddd'}}>📄 Xem trước tài liệu:</p>
                <embed 
                    src={pdfUrl} 
                    type="application/pdf" 
                    width="100%" 
                    height="250px" 
                />
                <div style={{padding: '5px', textAlign: 'right'}}>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '12px', color: '#007bff'}}>
                        Mở trong tab mới ↗
                    </a>
                </div>
            </div>
        )}
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handleSave}
          disabled={loading || fetching}
          style={{
            width: '100%', padding: '12px',
            backgroundColor: (loading || fetching) ? '#ccc' : '#4CAF50',
            color: 'white', border: 'none', borderRadius: '5px',
            cursor: (loading || fetching) ? 'not-allowed' : 'pointer', fontWeight: 'bold'
          }}
        >
          {loading ? 'Đang lưu vào Blockchain...' : 'Lưu & Cập nhật Hồ Sơ'}
        </button>

        {status && (
          <p style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', textAlign: 'center', borderRadius: '5px', fontSize: '14px', color: status.includes('❌') ? 'red' : status.includes('⚠️') ? 'orange' : 'green' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}