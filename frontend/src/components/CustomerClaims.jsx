import React from 'react';
import { styles } from '../styles';

export default function CustomerClaims({ blockchainPolicies, address, formatTime, formatNumber }) {
  const myClaims = blockchainPolicies.filter(p => p.customer.toLowerCase() === address.toLowerCase());

  return (
    <div style={styles.card}>
      <h3>📂 Bảo hiểm của tôi</h3>
      <table style={styles.table}>
        <thead><tr><th>Chuyến</th><th>Giờ Bay</th><th>Trạng Thái</th><th>Tiền</th></tr></thead>
        <tbody>
          {myClaims.map(p => (
            <tr key={p.id}>
              <td><strong>{p.flightCode}</strong></td><td>{formatTime(p.scheduledDeparture)}</td>
              <td>{p.status == 0 ? "⏳ Chờ" : p.status == 1 ? "❌ Từ chối" : "✅ Đã nhận"}</td>
              <td>{p.payoutAmount > 0 ? `+${formatNumber(p.payoutAmount)}` : "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}