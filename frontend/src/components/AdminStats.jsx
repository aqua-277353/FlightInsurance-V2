import React from 'react';
import { styles } from '../styles';

export default function AdminStats({ blockchainPolicies }) {
  return (
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
  );
}