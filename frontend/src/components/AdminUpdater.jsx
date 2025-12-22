import React from 'react';
import { styles } from '../styles';

export default function AdminUpdater({ dbFlights, handleUpdateAndPayout, formatTime }) {
  return (
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
  );
}                                                                                        