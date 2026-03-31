// pages/scan/[code].js
import Head from 'next/head';
import { useEffect, useRef } from 'react';
import dbConnect from '../../lib/mongoose';
import Ornament from '../../lib/models/Ornament';

export async function getServerSideProps({ params }) {
  const { code } = params;
  try {
    await dbConnect();
    let ornament = await Ornament.findOne({ itemCode: code }).lean();
    if (!ornament) {
      ornament = await Ornament.findById(code).lean().catch(() => null);
    }
    if (!ornament) return { props: { ornament: null, code } };
    return {
      props: {
        ornament: JSON.parse(JSON.stringify(ornament)),
        code,
      },
    };
  } catch (err) {
    console.error('Scan page error:', err.message);
    return { props: { ornament: null, code } };
  }
}

function QRCode({ value }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    import('qrcode').then(({ default: QR }) => {
      QR.toCanvas(canvasRef.current, value, {
        width: 160,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    });
  }, [value]);

  return (
    <div style={styles.qrWrap}>
      <canvas ref={canvasRef} style={styles.qrCanvas} />
      <p style={styles.qrLabel}>Scan for details</p>
    </div>
  );
}

export default function ScanPage({ ornament, code }) {
  const scanUrl = typeof window !== 'undefined'
    ? window.location.href
    : '';

  if (!ornament) {
    return (
      <>
        <Head><title>Not Found - SHREE GOLD</title></Head>
        <div style={styles.errorPage}>
          <div style={styles.logo}>🪙 SHREE GOLD</div>
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Item Not Found</h2>
            <p style={styles.errorText}>Code: <strong style={{color:'#ccc'}}>{code}</strong></p>
            <p style={styles.errorText}>This barcode does not match any item in our inventory.</p>
          </div>
        </div>
      </>
    );
  }

  const rows = [
    { label: 'Gross Weight', value: ornament.grossWeight + ' g' },
    { label: 'Stone Weight', value: ornament.stoneWeight + ' g' },
    { label: 'Colour Weight', value: ornament.colorWeight + ' g' },
    { label: 'Less Weight',   value: ornament.lessWeight + ' g' },
  ];

  return (
    <>
      <Head>
        <title>{ornament.ornamentName} - SHREE GOLD</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logoText}>🪙 SHREE GOLD</span>
          <p style={styles.tagline}>Jewellery Inventory</p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>

          {/* Ornament Image */}
          {ornament.imageUrl ? (
            <div style={styles.imgWrap}>
              <img
                src={ornament.imageUrl}
                alt={ornament.ornamentName}
                style={styles.ornamentImg}
              />
            </div>
          ) : (
            <div style={styles.imgPlaceholder}>💍</div>
          )}

          {/* Name + Code */}
          <h2 style={styles.itemName}>{ornament.ornamentName}</h2>
          <div style={styles.badge}>{ornament.itemCode}</div>

          {/* Weight Table */}
          <div style={styles.table}>
            {rows.map(function(row) {
              return (
                <div key={row.label} style={styles.row}>
                  <span style={styles.rowLabel}>{row.label}</span>
                  <span style={styles.rowValue}>{row.value}</span>
                </div>
              );
            })}
          </div>

          {/* Net Weight Highlight */}
          <div style={styles.netBox}>
            <div style={styles.netLabel}>NET WEIGHT</div>
            <div style={styles.netValue}>
              {ornament.netWeight}
              <span style={styles.netUnit}> g</span>
            </div>
          </div>

          {/* QR Code */}
          <div style={styles.divider} />
          <QRCode value={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/scan/${ornament.itemCode}`} />

        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>SHREE GOLD · Certified Jewellery</p>
          <p style={styles.footerSmall}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </>
  );
}

var styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0a0800 0%, #1a1200 60%, #0a0800 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '24px 16px', fontFamily: 'Georgia, serif',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  logoText: { fontSize: 26, fontWeight: 700, color: '#FFD700', letterSpacing: '0.12em' },
  tagline: { color: '#b8960c', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '4px 0 0' },

  card: {
    background: 'linear-gradient(145deg, #1c1a0a, #231f00)',
    border: '1px solid #8B6914',
    borderRadius: 20, padding: '0 0 24px',
    width: '100%', maxWidth: 400,
    boxShadow: '0 24px 64px rgba(255,215,0,0.12)',
    overflow: 'hidden',
  },

  imgWrap: { width: '100%', height: 240, overflow: 'hidden', borderBottom: '1px solid #3a2d00' },
  ornamentImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgPlaceholder: {
    width: '100%', height: 180,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 56, background: '#111000', borderBottom: '1px solid #2a2000',
  },

  itemName: { color: '#FFD700', fontSize: 20, fontWeight: 700, margin: '20px 24px 6px', textAlign: 'center' },
  badge: {
    background: '#2a2400', border: '1px solid #5a4a00',
    borderRadius: 20, padding: '3px 14px',
    color: '#b8960c', fontSize: 11, letterSpacing: '0.15em',
    textAlign: 'center', margin: '0 24px 18px', display: 'block',
  },

  table: { display: 'flex', flexDirection: 'column', gap: 1, margin: '0 16px' },
  row: {
    display: 'flex', justifyContent: 'space-between',
    padding: '9px 12px', borderRadius: 8,
    background: 'rgba(255,215,0,0.04)',
  },
  rowLabel: { color: '#8a7a4a', fontSize: 13 },
  rowValue: { color: '#e8d5a0', fontSize: 13, fontWeight: 600 },

  netBox: {
    margin: '14px 16px 0',
    background: 'linear-gradient(135deg, #4a3800, #7a5c10)',
    borderRadius: 14, padding: '18px',
    textAlign: 'center',
    border: '1px solid #8B6914',
  },
  netLabel: { color: '#ffe88a', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 },
  netValue: { color: '#FFD700', fontSize: 40, fontWeight: 700, lineHeight: 1 },
  netUnit: { fontSize: 18, color: '#ffe88a', fontWeight: 400 },

  divider: { height: 1, background: '#2a2200', margin: '20px 16px 0' },

  qrWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 },
  qrCanvas: { borderRadius: 8, border: '3px solid #ffffff', display: 'block' },
  qrLabel: { color: '#5a4a20', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 6 },

  footer: { marginTop: 28, textAlign: 'center' },
  footerText: { color: '#5a4a20', fontSize: 11, letterSpacing: '0.15em', margin: 0 },
  footerSmall: { color: '#3a3010', fontSize: 10, margin: '3px 0 0' },

  errorPage: {
    minHeight: '100vh', background: '#0a0a0a',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  logo: { color: '#FFD700', fontSize: 24, fontWeight: 700, marginBottom: 32, letterSpacing: '0.1em' },
  errorBox: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 340 },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTitle: { color: '#ff6b6b', fontSize: 20, margin: '0 0 12px' },
  errorText: { color: '#888', fontSize: 14, margin: '4px 0' },
};
