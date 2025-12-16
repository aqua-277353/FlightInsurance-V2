import React from 'react';
import { styles } from '../styles';

export default function CustomerBuy({ myTicketFlights, handleBuyTicket, formatTime }) {
  return (
    <div style={styles.card}>
      <h3>🎫 Mua Bảo Hiểm (Theo Vé Của Bạn)</h3>
      {myTicketFlights.length > 0 ? (
        <div style={styles.grid}>
          {myTicketFlights.map(f=>(
            <div key={f.flightId} style={styles.itemCard}>
              <div style={{color:'#0056b3', fontWeight:'bold', marginBottom:'10px'}}>✅ BẠN CÓ VÉ</div>
              <h4>{f.flightNumber}</h4>
              <p>{formatTime(f.scheduledDeparture)}</p>
              <button style={styles.btnPrimary} onClick={()=>handleBuyTicket(f)}>Mua (1000 FLC)</button>
            </div>
          ))}
        </div>
      ) : <p>Bạn chưa có vé phù hợp.</p>}
    </div>
  );
}