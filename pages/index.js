// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [ornaments, setOrnaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchOrnaments();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrnaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ornaments');
      const data = await res.json();
      if (data.success) setOrnaments(data.data);
    } catch { showToast('Failed to load data', 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/ornaments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrnaments(prev => prev.filter(o => o._id !== id));
        showToast('Item deleted successfully');
      }
    } catch { showToast('Delete failed', 'error'); }
    setDeleteConfirm(null);
  };

  return (
    <>
      <Head>
        <title>SHREE GOLD – Jewellery Inventory</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Delete Item?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-btns">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {(showForm || editItem) && (
        <OrnamentForm
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={(item) => {
            if (editItem) {
              setOrnaments(prev => prev.map(o => o._id === item._id ? item : o));
              showToast('Item updated!');
            } else {
              setOrnaments(prev => [item, ...prev]);
              showToast('Item saved!');
            }
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}

      {printItem && (
        <LabelPrint item={printItem} baseUrl={baseUrl} onClose={() => setPrintItem(null)} />
      )}

      {viewItem && (
        <ViewModal item={viewItem} onClose={() => setViewItem(null)} />
      )}

      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="brand">
              <span className="brand-icon">🪙</span>
              <div>
                <div className="brand-name">SHREE GOLD</div>
                <div className="brand-sub">Jewellery Inventory System</div>
              </div>
            </div>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              + Add Item
            </button>
          </div>
        </header>

        <main className="main">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num">{ornaments.length}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{ornaments.reduce((s, o) => s + o.netWeight, 0).toFixed(2)}g</div>
              <div className="stat-label">Total Net Weight</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{[...new Set(ornaments.map(o => o.karigarName))].length}</div>
              <div className="stat-label">Karigars</div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading inventory...</div>
          ) : ornaments.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💍</div>
              <p>No items yet. Add your first ornament!</p>
            </div>
          ) : (
            <div className="grid">
              {ornaments.map(item => (
                <div key={item._id} className="card" onClick={() => setViewItem(item)}>
                  <div className="card-img-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.ornamentName} className="card-img" />
                    ) : (
                      <div className="card-img-placeholder">💍</div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-code">{item.itemCode}</div>
                    <div className="card-name">{item.ornamentName}</div>
                    <div className="card-weight">
                      <span className="wt-label">Net:</span>
                      <span className="wt-val">{item.netWeight}g</span>
                    </div>
                    <div className="card-gross">Gross: {item.grossWeight}g</div>
                  </div>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className="act-btn print" onClick={() => setPrintItem(item)} title="Print Label">🏷️</button>
                    <button className="act-btn edit" onClick={() => setEditItem(item)} title="Edit">✏️</button>
                    <button className="act-btn del" onClick={() => setDeleteConfirm(item._id)} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── FORM COMPONENT ──────────────────────────────────────────────────────────
function OrnamentForm({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    ornamentName: item?.ornamentName || '',
    karigarName: item?.karigarName || '',
    grossWeight: item?.grossWeight || '',
    stoneWeight: item?.stoneWeight || 0,
    colorWeight: item?.colorWeight || 0,
    lessWeight: item?.lessWeight || 0,
    imageUrl: item?.imageUrl || '',
  });
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const gross = parseFloat(form.grossWeight) || 0;
  const stone = parseFloat(form.stoneWeight) || 0;
  const color = parseFloat(form.colorWeight) || 0;
  const less = parseFloat(form.lessWeight) || 0;
  const net = parseFloat((gross - stone - color - less).toFixed(3));

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target.result;
      setImagePreview(b64);
      setUploading(true);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: b64 }),
        });
        const data = await res.json();
        if (data.success) setForm(f => ({ ...f, imageUrl: data.url }));
      } catch { alert('Image upload failed. Check Cloudinary config.'); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.ornamentName || !form.karigarName || !form.grossWeight) {
      alert('Please fill Name, Karigar, and Gross Weight');
      return;
    }
    setSaving(true);
    try {
      const url = item ? `/api/ornaments/${item._id}` : '/api/ornaments';
      const method = item ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onSaved(data.data);
      else alert(data.error);
    } catch { alert('Save failed'); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add New Ornament'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>Ornament Name *</label>
            <input value={form.ornamentName} onChange={e => setForm(f => ({ ...f, ornamentName: e.target.value }))} placeholder="e.g. Gold Necklace" />
          </div>
          <div className="form-row">
            <label>Karigar Name *</label>
            <input value={form.karigarName} onChange={e => setForm(f => ({ ...f, karigarName: e.target.value }))} placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Gross Weight (g) *</label>
              <input type="number" step="0.001" value={form.grossWeight} onChange={e => setForm(f => ({ ...f, grossWeight: e.target.value }))} placeholder="0.000" />
            </div>
            <div className="form-row">
              <label>Stone Weight (g)</label>
              <input type="number" step="0.001" value={form.stoneWeight} onChange={e => setForm(f => ({ ...f, stoneWeight: e.target.value }))} placeholder="0.000" />
            </div>
            <div className="form-row">
              <label>Colour Weight (g)</label>
              <input type="number" step="0.001" value={form.colorWeight} onChange={e => setForm(f => ({ ...f, colorWeight: e.target.value }))} placeholder="0.000" />
            </div>
            <div className="form-row">
              <label>Less Weight (g)</label>
              <input type="number" step="0.001" value={form.lessWeight} onChange={e => setForm(f => ({ ...f, lessWeight: e.target.value }))} placeholder="0.000" />
            </div>
          </div>
          <div className="net-weight-display">
            <span className="net-label-form">NET WEIGHT</span>
            <span className="net-val-form">{net > 0 ? net : '—'} g</span>
          </div>
          <div className="form-row">
            <label>Ornament Image</label>
            <div className="img-upload-area" onClick={() => fileRef.current.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="img-preview" />
              ) : (
                <div className="img-placeholder">
                  <span>📷</span>
                  <span>Click to upload image</span>
                </div>
              )}
              {uploading && <div className="uploading-overlay">Uploading...</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : item ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VIEW MODAL ───────────────────────────────────────────────────────────────
function ViewModal({ item, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal view-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.ornamentName}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {item.imageUrl && <img src={item.imageUrl} alt={item.ornamentName} className="view-img" />}
          <div className="view-grid">
            {[
              ['Item Code', item.itemCode],
              ['Karigar', item.karigarName],
              ['Gross Weight', `${item.grossWeight} g`],
              ['Stone Weight', `${item.stoneWeight} g`],
              ['Colour Weight', `${item.colorWeight} g`],
              ['Less Weight', `${item.lessWeight} g`],
            ].map(([l, v]) => (
              <div key={l} className="view-row">
                <span className="view-label">{l}</span>
                <span className="view-value">{v}</span>
              </div>
            ))}
          </div>
          <div className="net-weight-display big">
            <span className="net-label-form">NET WEIGHT</span>
            <span className="net-val-form big">{item.netWeight} g</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LABEL PRINT ───────────────────────────────────────────────────────────
function LabelPrint({ item, baseUrl, onClose }) {
  const barcodeRef = useRef();  // linear barcode canvas
  const qrRef = useRef();       // QR code canvas
  const [copies, setCopies] = useState(1);
  const scanUrl = `${baseUrl}/scan/${item.itemCode}`;

  useEffect(() => {
    // Generate linear barcode for preview
    import('jsbarcode').then(({ default: JsBarcode }) => {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, item.itemCode, {
          format: 'CODE128', width: 2, height: 36,
          displayValue: true, fontSize: 9, margin: 3,
          background: '#ffffff', lineColor: '#000000',
        });
      }
    });
    // Generate QR code for preview
    import('qrcode').then(({ default: QR }) => {
      if (qrRef.current) {
        QR.toCanvas(qrRef.current, scanUrl, { width: 64, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
      }
    });
  }, []);

  const handlePrint = async () => {
    // Generate QR as data URL for print window
    const QR = (await import('qrcode')).default;
    const qrDataUrl = await QR.toDataURL(scanUrl, { width: 120, margin: 1 });

    // Generate barcode as data URL for print window
    const JsBarcode = (await import('jsbarcode')).default;
    const tmpCanvas = document.createElement('canvas');
    JsBarcode(tmpCanvas, item.itemCode, {
      format: 'CODE128', width: 2, height: 30,
      displayValue: true, fontSize: 8, margin: 2,
      background: '#ffffff', lineColor: '#000000',
    });
    const barcodeDataUrl = tmpCanvas.toDataURL('image/png');

    const labelHtml = `
      <div class="label">
        <div class="label-left">
          <div class="label-brand">SHREE GOLD</div>
          <div class="label-name">${item.ornamentName}</div>
          <div class="label-wt-row"><span class="wt-item">Gross: <b>${item.grossWeight}g</b></span><span class="wt-item">Net: <b>${item.netWeight}g</b></span></div>
          <div class="label-wt-row"><span class="wt-item">Stone: ${item.stoneWeight}g</span><span class="wt-item">Less: ${item.lessWeight}g</span></div>
          <img src="${barcodeDataUrl}" class="label-barcode" />
          <div class="label-code">${item.itemCode}</div>
        </div>
        <div class="label-right">
          <img src="${qrDataUrl}" class="label-qr" />
          <div class="label-scan-txt">SCAN</div>
        </div>
      </div>
    `;

    const allLabels = Array(copies).fill(labelHtml).join('');
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>SHREE GOLD Label – ${item.itemCode}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 57mm 30mm; margin: 0; }
        body { width: 57mm; font-family: Arial, sans-serif; background: white; }
        .label {
          width: 57mm; height: 30mm;
          border: 0.3pt solid #ccc;
          display: flex; flex-direction: row;
          page-break-after: always; overflow: hidden;
        }
        .label-left {
          flex: 1; display: flex; flex-direction: column;
          align-items: flex-start; justify-content: center;
          padding: 1.5mm 1mm 1.5mm 2mm; overflow: hidden;
        }
        .label-right {
          width: 10mm; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border-left: 0.3pt solid #eee; padding: 1mm;
          background: #fafafa;
        }
        .label-brand { font-size: 7.5pt; font-weight: 900; letter-spacing: 1pt; color: #8B6914; }
        .label-name { font-size: 6pt; font-weight: 700; color: #111; margin: 0.4mm 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 42mm; }
        .label-wt-row { display: flex; gap: 3pt; margin-bottom: 0.3mm; }
        .wt-item { font-size: 5pt; color: #333; }
        .label-barcode { max-width: 42mm; height: 7mm; object-fit: contain; margin-top: 0.5mm; }
        .label-code { font-size: 4.5pt; color: #666; letter-spacing: 0.3pt; margin-top: 0.2mm; }
        .label-qr { width: 8mm; height: 8mm; display: block; }
        .label-scan-txt { font-size: 4pt; color: #999; letter-spacing: 0.5pt; margin-top: 1mm; text-transform: uppercase; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${allLabels}<script>window.onload=()=>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal print-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Print Label</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Label Preview */}
          <div className="label-preview">
            <div className="preview-inner">
              <div className="preview-left">
                <div className="preview-brand">SHREE GOLD</div>
                <div className="preview-name">{item.ornamentName}</div>
                <div className="preview-weights">
                  <span>Gross: <strong>{item.grossWeight}g</strong></span>
                  <span>Net: <strong>{item.netWeight}g</strong></span>
                </div>
                <div className="preview-weights">
                  <span>Stone: {item.stoneWeight}g</span>
                  <span>Less: {item.lessWeight}g</span>
                </div>
                <canvas ref={barcodeRef} className="preview-barcode" />
                <div className="preview-code">{item.itemCode}</div>
              </div>
              <div className="preview-right">
                <canvas ref={qrRef} className="preview-qr" />
                <div className="preview-scan-txt">SCAN</div>
              </div>
            </div>
          </div>

          <div className="scan-url-box">
            <div className="scan-url-label">📱 Scan URL</div>
            <div className="scan-url">{scanUrl}</div>
          </div>

          <div className="form-row copies-row">
            <label>Number of copies</label>
            <div className="copies-ctrl">
              <button onClick={() => setCopies(c => Math.max(1, c - 1))}>−</button>
              <span>{copies}</span>
              <button onClick={() => setCopies(c => c + 1)}>+</button>
            </div>
          </div>

          <div className="print-info">
            ℹ️ Label size: <strong>57mm × 30mm</strong> — set paper size to 57×30mm before printing. QR code on right links to full details.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handlePrint}>🖨️ Print {copies > 1 ? `${copies} Labels` : 'Label'}</button>
        </div>
      </div>
    </div>
  );
}

