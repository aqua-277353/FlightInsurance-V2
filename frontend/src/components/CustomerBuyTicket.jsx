import React from 'react';
import { styles } from '../styles';

export default function CustomerBuyTicket({ dbFlights, dbTickets, blockchainPolicies, address, handleBuyTicket, formatTime }) {
  // Logic lọc vé được chuyển vào đây
  const myTicketFlights = dbFlights.filter(f => {
    const notFlown = !f.actualDeparture;
    const hasTicket = dbTickets.some(t => t.flightCode === f.flightNumber && t.customerWallet.toLowerCase() === address.toLowerCase());
    const alreadyBought = blockchainPolicies.some(p => p.flightCode === f.flightNumber && p.customer.toLowerCase() === address.toLowerCase());
    return notFlown && hasTicket && !alreadyBought;
  });

  return (
    <div style={styles.card}>
      <h3>🎫 Mua Vé (Theo Vé Đã Cấp)</h3>
      {myTicketFlights.length > 0 ? (
        <div style={styles.grid}>
          {myTicketFlights.map(f => (
            <div key={f.flightId} style={styles.itemCard}>
              <div style={{color:'#0056b3', fontWeight:'bold', marginBottom:'10px'}}>✅ BẠN CÓ VÉ</div>
              <h3>{f.flightNumber}</h3>
              <p>{formatTime(f.scheduledDeparture)}</p>
              <button style={styles.btnPrimary} onClick={()=>handleBuyTicket(f)}>Mua (1000 FLC)</button>
            </div>
          ))}
        </div>
      ) : <p style={{textAlign:'center', color:'#777'}}>Bạn chưa có vé hoặc đã mua bảo hiểm rồi.</p>}
    </div>
  );
}