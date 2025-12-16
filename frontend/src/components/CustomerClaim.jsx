import React from 'react';
import { styles } from '../styles';

export default function CustomerClaim({ blockchainPolicies, address }) {
  return (
    <div style={styles.card}>
      <h3>Danh sách Bảo Hiểm</h3>
      <table style={styles.table}>
        <thead><tr><th>Chuyến</th><th>Trạng thái</th><th>Tiền</th></tr></thead>
        <tbody>
          {blockchainPolicies.filter(p=>p.customer.toLowerCase()===address.toLowerCase()).map(p=>(
            <tr key={p.id}>
              <td>{p.flightCode}</td>
              <td>{p.status==0?"Chờ":p.status==1?"Từ chối":"Đã nhận"}</td>
              <td>{p.payoutAmount>0?`+${p.payoutAmount}`:"--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}