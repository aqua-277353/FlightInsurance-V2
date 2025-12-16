const colors = {
  primary: '#2563EB',     
  primaryHover: '#1D4ED8',
  bg: '#F3F4F6',          
  cardBg: '#FFFFFF',
  textMain: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  accent: '#F59E0B',
};

export const styles = {
  // --- LAYOUT CHÍNH ---
  container: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: colors.bg,
    minHeight: '100vh',
    color: colors.textMain,
    display: 'flex',
    flexDirection: 'column',
  },
  
  centerBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: `linear-gradient(135deg, ${colors.primary} 0%, #4F46E5 100%)`,
  },

  contentWrapper: {
    maxWidth: '1200px',
    width: '100%',
    margin: '40px auto',
    padding: '0 24px',
    flex: 1,
  },

  // --- HEADER & NAVIGATION ---
  header: {
    background: colors.cardBg,
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  
  brand: {
    fontSize: '22px',
    fontWeight: '800',
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '-0.5px',
  },
  
  versionBadge: {
    fontSize: '11px',
    background: '#EFF6FF',
    color: colors.primary,
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  ipfsBar: {
    background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
    padding: '10px 32px',
    fontSize: '13px',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
  },

  navBar: {
    background: colors.cardBg,
    borderBottom: `1px solid ${colors.border}`,
    padding: '0 32px',
    marginTop: '1px',
  },
  
  navContainer: {
    display: 'flex',
    gap: '40px',
    // --- CĂN GIỮA MENU TẠI ĐÂY ---
    justifyContent: 'center', 
    maxWidth: '100%',
    margin: '0 auto',
  },
  
  navItem: {
    padding: '18px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.textLight,
    borderBottom: '2px solid transparent',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  
  navItemActive: {
    padding: '18px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.primary,
    borderBottom: `2px solid ${colors.primary}`,
    fontSize: '15px',
    fontWeight: '700',
  },

  // --- CARDS & FORMS ---
  card: {
    background: colors.cardBg,
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
    border: `1px solid ${colors.border}`,
  },

  cardTitle: {
    marginTop: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
  },

  formGroup: { 
    marginBottom: '24px' },
  
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  },
  
  select: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },

  row: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  col: { flex: 1, minWidth: '300px' },

  // --- GRID & ITEMS ---
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  
  itemCard: {
    background: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px',
  },

  // --- BUTTONS ---
  btnConnectLarge: {
    background: '#fff',
    color: colors.primary,
    border: 'none',
    padding: '16px 40px',
    borderRadius: '50px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s',
  },

  btnPrimary: {
    background: colors.primary,
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    width: '100%',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'background 0.2s',
  },
  
  btnSecondary: {
    background: colors.primary,
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    width: '100%',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
  },
  
  btnSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: colors.success,
    padding: '10px',
    border: `1px solid ${colors.success}`,
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1,
    fontWeight: '600',
  },
  
  btnDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: colors.danger,
    padding: '10px',
    border: `1px solid ${colors.danger}`,
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1,
    fontWeight: '600',
  },

  // --- TABLE & LOADING ---
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginTop: '16px',
    fontSize: '14px',
  },
  
  loadingOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    color: colors.primary,
    fontWeight: '600',
    fontSize: '18px',
  },
  
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #E5E7EB',
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    marginBottom: '16px',
  },

  adminPanel: {
    background: '#F9FAFB',      // Nền xám rất nhạt sang trọng
    padding: '24px',            // Khoảng cách lề trong
    borderRadius: '12px',       // Bo tròn góc
    border: '1px solid #E5E7EB',// Viền mỏng
    height: '100%',             // Để 2 khung cao bằng nhau
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Đẩy nút xuống dưới cùng
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)', // Bóng đổ nhẹ vào trong
    boxSizing: 'border-box',
  }

};

// CSS Injection cho các hiệu ứng hover và animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  body { margin: 0; background-color: ${colors.bg}; }
  
  /* Table Styles */
  table th {
    background-color: #F9FAFB;
    color: #6B7280;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid ${colors.border};
  }
  table th:first-child { border-top-left-radius: 8px; }
  table th:last-child { border-top-right-radius: 8px; }
  
  table td {
    padding: 16px;
    border-bottom: 1px solid ${colors.border};
    color: #374151;
  }
  table tr:last-child td { border-bottom: none; }
  table tr:hover td { background-color: #F9FAFB; }

  /* Interactive Elements */
  input:focus, select:focus {
    border-color: ${colors.primary} !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
  }
  button:hover { filter: brightness(95%); }
  button:active { transform: scale(0.98); }
  
  /* Animations */
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }
  
  a { text-decoration: none; color: ${colors.primary}; font-weight: 500; }
  a:hover { text-decoration: underline; }
`;
document.head.appendChild(styleSheet);