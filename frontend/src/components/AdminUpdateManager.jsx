import React from 'react';
import { styles } from '../styles';

export default function AdminUpdateManager({ dbFlights, handleUpdateAndPayout, formatTime }) {
  return (
    <div style={styles.card}>
      <h3>⏱ Cập nhật Trạng Thái</h3>
      <div style={styles.grid}>
        {dbFlights.filter(f => !f.actualDeparture).map(f => (
          <div key={f.flightId} style={styles.itemCard}>
            <h4>{f.flightNumber}</h4>
            <p>Bay: {formatTime(f.scheduledDeparture)}</p>
            <div style={{display:'flex', gap:'10px'}}>
              <button style={styles.btnSuccess} onClick={()=>handleUpdateAndPayout(f.flightNumber, f.scheduledDeparture, false)}>🟢 Đúng giờ</button>
              <button style={styles.btnDanger} onClick={()=>handleUpdateAndPayout(f.flightNumber, f.scheduledDeparture, true)}>🔴 Trễ {'>'}2h</button>
            </div>
          </div>
        ))}
        {dbFlights.filter(f => !f.actualDeparture).length === 0 && <p>Không có chuyến cần cập nhật.</p>}
      </div>
    </div>
  );
}