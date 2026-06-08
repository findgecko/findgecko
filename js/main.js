// ========== 首頁：載入 geckos.json 並渲染 grid 列表 ==========

const STATUS_MAP = {
  available: { label: '可預訂', className: 'status-available' },
  reserved:  { label: '預訂中', className: 'status-reserved' },
  sold:      { label: '已售出', className: 'status-sold' }
};

function loadGeckos() {
  if (!window.GECKOS_DATA || !Array.isArray(window.GECKOS_DATA.geckos)) {
    console.error('找不到 GECKOS_DATA，請確認 data/geckos.js 有正確載入');
    return null;
  }
  return window.GECKOS_DATA.geckos;
}

function renderGrid(geckos) {
  const grid = document.getElementById('gecko-grid');

  if (!geckos) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">!</div>
        <p>資料載入失敗，請稍後再試。</p>
      </div>`;
    return;
  }

  if (geckos.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">~</div>
        <p>目前沒有在線守宮，請追蹤 IG 等候上架通知。</p>
      </div>`;
    return;
  }

  // 已售出的寶寶排到清單最末（其餘維持原本順序）
  const sorted = geckos
    .map((g, i) => [g, i])
    .sort((a, b) => {
      const aSold = a[0].status === 'sold' ? 1 : 0;
      const bSold = b[0].status === 'sold' ? 1 : 0;
      return aSold - bSold || a[1] - b[1];
    })
    .map(pair => pair[0]);

  grid.innerHTML = sorted.map(g => {
    const status = STATUS_MAP[g.status] || STATUS_MAP.available;
    const mainPhoto = g.photos && g.photos[0]
      ? `images/${g.id}/${g.photos[0]}`
      : '';
    const isSold = g.status === 'sold';

    const priceText = formatPrice(g.price);
    const priceHtml = priceText
      ? `<div class="card-price">${escapeHtml(priceText)}</div>`
      : '';

    return `
      <a href="product.html?id=${encodeURIComponent(g.id)}" class="gecko-card ${isSold ? 'sold' : ''}">
        <div class="card-image">
          <span class="status-badge ${status.className}">${status.label}</span>
          ${mainPhoto
            ? `<img src="${mainPhoto}" alt="${escapeHtml(g.morph)} ${escapeHtml(g.id)}" loading="lazy" decoding="async">`
            : `<span class="placeholder-icon">?</span>`}
        </div>
        <div class="card-body">
          <div class="card-id">編號 ${escapeHtml(g.id)}</div>
          <div class="card-morph">${escapeHtml(g.morph)}</div>
          ${priceHtml}
        </div>
      </a>
    `;
  }).join('');
}

function formatPrice(price) {
  if (price === undefined || price === null || price === '') {
    return '';
  }
  if (typeof price === 'number') {
    return `NT$ ${price.toLocaleString()}`;
  }
  return String(price);
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

renderGrid(loadGeckos());
