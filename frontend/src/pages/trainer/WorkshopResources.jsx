import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrainerWorkshops,
  fetchWorkshopResources,
  uploadWorkshopResource,
  deleteWorkshopResource,
  setSelectedWorkshop,
  selectTrainerWorkshops,
  selectWorkshopResources,
  selectSelectedWorkshopId,
} from '../../features/Trainer/trainerWorkshopSlice';
import { S, Pill, Spinner, Empty, PageHeader, KPICard, fmtDateTime, WorkshopSelector } from './workshopShared';

const CSS = `@keyframes spin{to{transform:rotate(360deg)}} .ws-row:hover{background:#f9fafb!important} .ws-btn:hover{opacity:.85}`;

const TYPE_ICONS = { PDF: 'file-type-pdf', PPT: 'presentation', ZIP: 'file-zip', MP4: 'video', GitHub: 'brand-github', Drive: 'brand-google-drive', Link: 'link', Other: 'file' };
const TYPE_COLORS = { PDF: '#dc2626', PPT: '#d97706', ZIP: '#7c3aed', MP4: '#0891b2', GitHub: '#111827', Drive: '#16a34a', Link: '#6366f1', Other: '#6b7280' };

export default function WorkshopResources() {
  const dispatch   = useDispatch();
  const workshops  = useSelector(selectTrainerWorkshops);
  const selectedId = useSelector(selectSelectedWorkshopId);
  const selected   = workshops.find(w => w._id === selectedId) || workshops[0] || null;
  const resources  = useSelector(selectWorkshopResources(selected?._id));

  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', type: 'PDF', url: '' });
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const fileRef = useRef();

  useEffect(() => { dispatch(fetchTrainerWorkshops()); }, [dispatch]);

  useEffect(() => {
    if (selected?._id) {
      dispatch(fetchWorkshopResources(selected._id));
      if (!selectedId) dispatch(setSelectedWorkshop(selected._id));
    }
  }, [selected?._id, dispatch]);

  const handleSelect = (id) => {
    dispatch(setSelectedWorkshop(id));
    dispatch(fetchWorkshopResources(id));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selected || !form.title.trim()) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('type',  form.type);
      if (file) {
        fd.append('file', file);
      } else if (form.url.trim()) {
        fd.append('url', form.url.trim());
      } else {
        setUploadErr('Provide a file or a URL.');
        setUploading(false);
        return;
      }
      await dispatch(uploadWorkshopResource({ workshopId: selected._id, formData: fd })).unwrap();
      setForm({ title: '', type: 'PDF', url: '' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
    } catch (err) {
      setUploadErr(String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!selected || !window.confirm('Delete this resource?')) return;
    setDeleting(resourceId);
    try {
      await dispatch(deleteWorkshopResource({ workshopId: selected._id, resourceId })).unwrap();
    } finally {
      setDeleting(null);
    }
  };

  const byType = (type) => resources.filter(r => r.type === type).length;

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <PageHeader title="Workshop Resources" subtitle="Upload and manage materials for your workshop participants.">
        <WorkshopSelector workshops={workshops} selectedId={selected?._id} onSelect={handleSelect} />
        <button style={S.btnPri} onClick={() => setShowForm(v => !v)}>
          <i className="ti ti-upload" style={{ fontSize: 14 }} /> Upload Resource
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14, marginBottom: 24 }}>
        <KPICard title="Total"   value={resources.length} icon="books"            accent="#6366f1" />
        <KPICard title="PDFs"    value={byType('PDF')}    icon="file-type-pdf"    accent="#dc2626" />
        <KPICard title="Slides"  value={byType('PPT')}    icon="presentation"     accent="#d97706" />
        <KPICard title="Videos"  value={byType('MP4')}    icon="video"            accent="#0891b2" />
        <KPICard title="GitHub"  value={byType('GitHub')} icon="brand-github"     accent="#111827" />
        <KPICard title="Links"   value={byType('Link')}   icon="link"             accent="#16a34a" />
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Upload New Resource</h3>
          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title *</label>
                <input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Session Slides" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                <select style={S.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['PDF','PPT','ZIP','MP4','GitHub','Drive','Link','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upload File</label>
              <input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx,.zip,.mp4,.png,.jpg" onChange={e => setFile(e.target.files[0] || null)} style={{ fontSize: '0.84rem' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Or Paste URL</label>
              <input style={S.input} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://github.com/... or https://drive.google.com/..." />
            </div>
            {uploadErr && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#b91c1c', marginBottom: 12 }}>⚠️ {uploadErr}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={S.btnPri} disabled={uploading}>
                <i className="ti ti-upload" style={{ fontSize: 13 }} /> {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button type="button" style={S.btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!selected ? <Empty icon="📚" msg="Select a workshop to manage resources." /> : (
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Title','Type','Uploaded By','Date','Downloads','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No resources uploaded yet.</td></tr>
                ) : resources.map((r, i) => (
                  <tr key={r._id} className="ws-row" style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${TYPE_COLORS[r.type] || '#6b7280'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className={`ti ti-${TYPE_ICONS[r.type] || 'file'}`} style={{ fontSize: 14, color: TYPE_COLORS[r.type] || '#6b7280' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{r.title}</div>
                          {r.fileSize && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{r.fileSize}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <Pill bg={`${TYPE_COLORS[r.type] || '#6b7280'}18`} color={TYPE_COLORS[r.type] || '#6b7280'}>{r.type}</Pill>
                    </td>
                    <td style={S.td}>{r.uploadedBy?.name || '—'}</td>
                    <td style={S.td}>{fmtDateTime(r.createdAt)}</td>
                    <td style={S.td}>{r.downloads || 0}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <a href={r.url} target="_blank" rel="noreferrer" title="View"
                          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f8fafc', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <i className="ti ti-eye" style={{ fontSize: 12 }} />
                        </a>
                        <button title="Delete" className="ws-btn"
                          disabled={deleting === r._id}
                          onClick={() => handleDelete(r._id)}
                          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`ti ti-${deleting === r._id ? 'loader' : 'trash'}`} style={{ fontSize: 12 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#9ca3af' }}>
            {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
