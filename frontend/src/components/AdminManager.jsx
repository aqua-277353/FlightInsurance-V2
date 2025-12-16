import React, { useState } from 'react';
import { styles } from '../styles';

export default function AdminManager({ dbFlights, handleAddFlight, handleIssueTicket, formatTime, handleEmergencyFix }) {
  const [selectedFlight, setSelectedFlight] = useState("");

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        
        {/* CỘT TRÁI */}
        <div style={styles.col}>
          <h3>✈️ Thêm Chuyến Bay</h3>
          <form onSubmit={handleAddFlight}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mã Chuyến Bay</label>
              <input name="code" style={styles.input} placeholder="VD: VN123" required />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Giờ Cất Cánh</label>
              {/* Ô NHẬP LỊCH CHUẨN */}
              <input 
                type="datetime-local" 
                name="time" 
                style={{
                    ...styles.input, 
                    cursor: 'pointer',       
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold'
                }} 
                required 
              />
            </div>
            <button type="submit" style={styles.btnPrimary}>Lưu</button>
          </form>

          {/* DANGER ZONE */}
          <div style={{marginTop: '30px', borderTop: '2px dashed #ffcccc', paddingTop: '15px'}}>
             <h5 style={{color: '#c0392b', margin: '0 0 5px 0'}}>🚨 Vùng Nguy Hiểm</h5>
             <button 
                onClick={handleEmergencyFix}
                style={{...styles.btnDanger, fontSize: '12px', padding: '8px', width: '100%'}}
             >
                🛠 RESET DỮ LIỆU IPFS
             </button>
          </div>
        </div>
        
        {/* CỘT PHẢI */}
        <div style={styles.col}>
          <h3 style={{color: '#e67e22'}}>🎟️ Thêm Vé</h3>
          <form onSubmit={handleIssueTicket} style={{background: '#fff8e1', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffe0b2'}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Đang chọn chuyến:</label>
              <input 
                name="flightCode" 
                value={selectedFlight} 
                onChange={(e) => setSelectedFlight(e.target.value)} 
                style={{...styles.input, fontWeight: 'bold', color: '#e65100'}} 
                placeholder="Chọn từ bảng dưới..."
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ví Khách Hàng</label>
              <input name="customerWallet" style={styles.input} placeholder="0x..." required/>
            </div>
            <button type="submit" style={styles.btnSecondary}>Thêm vé</button>
          </form>

          <h4 style={{marginBottom:'10px'}}>Danh sách chuyến bay:</h4>
          <div style={{maxHeight:'300px', overflowY:'auto', border: '1px solid #eee'}}>
             <table style={styles.table}>
               <thead style={{position: 'sticky', top: 0, zIndex: 1}}>
                 <tr><th>Mã</th><th>Giờ Bay</th><th>Chọn</th></tr>
               </thead>
               <tbody>
                 {dbFlights.slice().reverse().map(f=>(
                   <tr key={f.flightId} style={{backgroundColor: selectedFlight === f.flightNumber ? '#fff3e0' : 'transparent'}}>
                     <td style={{fontWeight: 'bold', color: '#0056b3'}}>{f.flightNumber}</td>
                     <td>{formatTime(f.scheduledDeparture)}</td>
                     <td>
                       {!f.actualDeparture ? (
                         <button type="button" onClick={() => setSelectedFlight(f.flightNumber)} style={{backgroundColor: selectedFlight === f.flightNumber ? '#4caf50' : '#2196f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
                           {selectedFlight === f.flightNumber ? "✔" : "Chọn"}
                         </button>
                       ) : <span style={{fontSize:'12px', color:'gray'}}>Đã bay</span>}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}