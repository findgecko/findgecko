// ========== 認養專區：載入 adopts 資料並渲染 grid 列表 ==========

const ADOPT_STATUS_MAP = {
  adoptable: { label: '可認養', className: 'status-available' },
  adopted:   { label: '已認養', className: 'status-sold' }
};

function loadAdopts() {
  if (!window.ADOPTS_DATA || !Array.isArray(window.ADOPTS_DATA.adopts)) {
    console.error('找不到 ADOPTS_DATA，請確認 data/adopts.js 有正確載入');
    return null;
  }
  return window.ADOPTS_DATA.adopts;
}

function renderAdoptGrid(list) {
  const grid = document.getElementById('adopt-grid');

  if (!list) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">!</div>
        <p>資料載入失敗，請稍後再試。</p>
      </div>`;
    return;
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">~</div>
        <p>目前沒有待認養的守宮，請追蹤 IG 等候公告。</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(g => {
    const status = ADOPT_STATUS_MAP[g.status] || ADOPT_STATUS_MAP.adoptable;
    const mainPhoto = g.photos && g.photos[0]
      ? `images/${g.id}/${g.photos[0]}`
      : '';
    const isAdopted = g.status === 'adopted';

    return `
      <a href="adopt-detail.html?id=${encodeURIComponent(g.id)}" class="gecko-card ${isAdopted ? 'sold' : ''}">
        <div class="card-image">
          <span class="status-badge ${status.className}">${status.label}</span>
          ${mainPhoto
            ? `<img src="${mainPhoto}" alt="${escapeHtml(g.morph)} ${escapeHtml(g.id)}" loading="lazy" decoding="async">`
            : `<span class="placeholder-icon">?</span>`}
        </div>
        <div class="card-body">
          <div class="card-id">編號 ${escapeHtml(g.id)}</div>
          <div class="card-morph">${escapeHtml(g.morph)}</div>
        </div>
      </a>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

renderAdoptGrid(loadAdopts());
