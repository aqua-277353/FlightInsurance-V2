import React from 'react';
import { styles } from '../styles';

export default function AdminStats({ blockchainPolicies, formatNumber }) {
  return (
    <div style={styles.card}>
      <h3>📊 Thống Kê On-chain</h3>
      <table style={styles.table}>
        <thead><tr><th>ID</th><th>Khách</th><th>Chuyến</th><th>Trạng Thái</th><th>Tiền</th></tr></thead>
        <tbody>
          {[...blockchainPolicies].sort((a,b) => b.claimTime - a.claimTime).map(p => (
            <tr key={p.id}>
              <td>#{p.id}</td><td>{p.customer.slice(0,6)}...</td><td><strong>{p.flightCode}</strong></td>
              <td>{p.status == 0 ? "⏳" : p.status == 1 ? "❌" : "✅"}</td>
              <td>{p.payoutAmount > 0 ? <span style={{color: '#27ae60'}}>+{formatNumber(p.payoutAmount)} FLC</span> : "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}