import React from 'react';
import { styles } from '../styles';

export default function CustomerProfile({ address, dbProfile, handleUpdateProfile }) {
  return (
    <div style={{...styles.card, maxWidth: '600px', margin: '0 auto'}}>
      <h3 style={styles.cardTitle}>👤 Hồ Sơ Cá Nhân</h3>
      <form onSubmit={handleUpdateProfile}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Ví</label>
          <input value={address} disabled style={{...styles.input, background:'#f0f0f0', color: '#555'}} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tên</label>
          <input name="fullName" defaultValue={dbProfile.fullName} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input name="email" defaultValue={dbProfile.email} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>SĐT</label>
          <input name="phone" defaultValue={dbProfile.phone} style={styles.input} />
        </div>
        <button type="submit" style={styles.btnPrimary}>Cập nhật lên IPFS</button>
      </form>
    </div>
  );
}