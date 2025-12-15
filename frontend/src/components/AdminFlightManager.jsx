import React from 'react';
import { styles } from '../styles';

export default function AdminFlightManager({ dbFlights, dbTickets, handleAddFlight, handleIssueTicket, formatTime }) {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        {/* Cột Trái: Thêm Chuyến */}
        <div style={styles.col}>
          <h3 style={styles.cardTitle}>✈️ Thêm Chuyến Bay</h3>
          <form onSubmit={handleAddFlight}>
            <div style={styles.formGroup}><label style={styles.label}>Mã Chuyến</label><input name="code" style={styles.input} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Giờ Bay</label><input type="datetime-local" name="time" style={styles.input} required /></div>
            <button type="submit" style={styles.btnPrimary}>Lưu IPFS</button>
          </form>
          {/* List nhỏ bên dưới */}
          <div style={{marginTop:'20px', maxHeight:'200px', overflowY:'auto'}}>
             <table style={styles.table}>
               <thead><tr><th>Mã</th><th>Giờ</th></tr></thead>
               <tbody>
                 {dbFlights.slice().reverse().map(f=>(
                   <tr key={f.flightId}><td>{f.flightNumber}</td><td>{formatTime(f.scheduledDeparture)}</td></tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
        
        {/* Cột Phải: Cấp Vé */}
        <div style={styles.col}>
          <h3 style={{...styles.cardTitle, color: '#e67e22'}}>🎟️ Cấp Vé</h3>
          <form onSubmit={handleIssueTicket}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Chọn Chuyến</label>
              <select name="flightCode" style={styles.select} required>
                <option value="">-- Chọn --</option>
                {dbFlights.filter(f=>!f.actualDeparture).map(f=><option key={f.flightId} value={f.flightNumber}>{f.flightNumber}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}><label style={styles.label}>Ví Khách</label><input name="customerWallet" style={styles.input} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Tên Khách</label><input name="customerName" style={styles.input} required /></div>
            <button type="submit" style={styles.btnSecondary}>Cấp Vé</button>
          </form>
        </div>
      </div>
    </div>
  );
}