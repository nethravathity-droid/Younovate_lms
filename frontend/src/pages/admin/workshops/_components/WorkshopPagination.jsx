import React from 'react';

export default function WorkshopPagination({
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  rowsPerPageOptions = [6, 8, 10, 20],
}) {
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  const pgBtn = (disabled) => ({
    background: '#fff',
    color: disabled ? '#b6c0cf' : '#41506a',
    border: '1px solid #dbe3ed',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  });

  const pgNum = (active) => ({
    background: active ? '#2f6f9b' : '#fff',
    color: active ? '#fff' : '#41506a',
    border: `1px solid ${active ? '#2f6f9b' : '#dbe3ed'}`,
    padding: '6px 11px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 900,
    cursor: 'pointer',
    minWidth: 36,
    fontFamily: 'inherit',
  });

  const pgEllipsis = { color: '#9aa6b6', padding: '0 2px', fontWeight: 900 };

  const pageList = (cur, total_) => {
    if (total_ <= 7) return Array.from({ length: total_ }, (_, i) => i + 1);
    const set = new Set([1, 2, total_ - 1, total_, cur - 1, cur, cur + 1]);
    const nums = [...set].filter((n) => n >= 1 && n <= total_).sort((a, b) => a - b);
    const out = [];
    let prev = 0;
    for (const n of nums) {
      if (prev && n - prev > 1) out.push('…');
      out.push(n);
      prev = n;
    }
    return out;
  };

  if (totalPages <= 1 && total === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 14,
        padding: '12px 16px',
        background: '#fafafa',
        borderTop: '1px solid #dbe3ed',
      }}
    >
      <div style={{ fontSize: 12.5, color: '#657691', fontWeight: 700 }}>
        Showing {startIdx}–{endIdx} of {total}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={pgBtn(page <= 1)} disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          ‹ Prev
        </button>

        {pageList(page, totalPages).map((n, idx, arr) =>
          n === '…' ? (
            <span key={`e${idx}`} style={pgEllipsis}>
              …
            </span>
          ) : (
            <React.Fragment key={n}>
              <button style={pgNum(n === page)} onClick={() => onPageChange(n)}>
                {n}
              </button>
            </React.Fragment>
          )
        )}

        <button
          style={pgBtn(page >= totalPages)}
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next ›
        </button>
      </div>

      <label style={{ fontSize: 12.5, color: '#657691', fontWeight: 700 }}>
        Per page{' '}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            width: 'auto',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #dbe3ed',
            background: '#fff',
            fontFamily: 'inherit',
          }}
        >
          {rowsPerPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

