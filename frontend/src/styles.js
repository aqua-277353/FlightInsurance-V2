// src/styles.js

export const styles = {
  container: { fontFamily: "Arial, sans-serif", backgroundColor: '#f4f7f6', minHeight: '100vh', color: '#333' },
  centerBox: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#eef2f3' },
  loginCard: { background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  
  header: { background: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd' },
  brand: { fontSize: '24px', fontWeight: 'bold', color: '#0056b3' },
  versionBadge: { fontSize: '12px', background: '#eee', padding: '2px 5px', borderRadius: '4px', color: '#555' },
  ipfsBar: { background: '#e1f5fe', padding: '8px 30px', fontSize: '12px', color: '#0277bd', display: 'flex', justifyContent: 'space-between' },
  
  navBar: { background: '#fff', borderBottom: '1px solid #ddd', padding: '0 30px' },
  navContainer: { display: 'flex', gap: '20px' },
  navItem: { padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#666', borderBottom: '3px solid transparent' },
  navItemActive: { padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#0056b3', borderBottom: '3px solid #0056b3', fontWeight: 'bold' },
  
  contentWrapper: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  card: { background: '#ffffff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', color: '#333' },
  cardTitle: { marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#333' },
  
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box', fontSize: '15px' },
  select: { width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc', borderRadius: '5px' },
  
  row: { display: 'flex', gap: '30px' },
  col: { flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  itemCard: { background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' },
  
  btnConnectLarge: { background: '#f6851b', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  btnPrimary: { background: '#0056b3', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', width: '100%', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { background: '#e67e22', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', width: '100%', cursor: 'pointer', fontWeight: 'bold' },
  btnSuccess: { background: '#27ae60', color: '#fff', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  btnDanger: { background: '#c0392b', color: '#fff', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
  
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  loadingOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, color: '#333', fontSize: '20px', fontWeight: 'bold' },
  spinner: { width: '40px', height: '40px', border: '4px solid #ddd', borderTop: '4px solid #0056b3', borderRadius: '50%', marginBottom: '10px' }
};

// CSS Global inject
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  table th, table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; color: #333; }
  table th { background-color: #f5f5f5; color: #555; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .spinner { animation: spin 1s linear infinite; }
`;
document.head.appendChild(styleSheet);