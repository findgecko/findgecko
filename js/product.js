// ========== 詳細頁：從 URL 讀 id，撈 geckos.json，渲染詳細資訊 ==========

const STATUS_MAP = {
  available: { label: '可預訂', className: 'status-available' },
  reserved:  { label: '預訂中', className: 'status-reserved' },
  sold:      { label: '已售出', className: 'status-sold' }
};

const IG_URL = 'https://www.instagram.com/findgecko_3/';

function loadGeckos() {
  if (!window.GECKOS_DATA || !Array.isArray(window.GECKOS_DATA.geckos)) {
    console.error('找不到 GECKOS_DATA，請確認 data/geckos.js 有正確載入');
    return null;
  }
  return window.GECKOS_DATA.geckos;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
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

function renderProduct(gecko) {
  const container = document.getElementById('product-content');

  if (!gecko) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">?</div>
        <p>找不到這隻守宮的資料。</p>
      </div>`;
    document.title = '找不到 ｜ 尋守宮';
    return;
  }

  document.title = `${gecko.morph} ${gecko.id}｜尋守宮 FindGecko`;

  const status = STATUS_MAP[gecko.status] || STATUS_MAP.available;
  const photos = (gecko.photos && gecko.photos.length > 0)
    ? gecko.photos.map(p => `images/${gecko.id}/${p}`)
    : [];

  // 構建規格表，只顯示有值的欄位
  const specRows = [];
  specRows.push(['編號', gecko.id]);
  specRows.push(['品系', gecko.morph]);
  if (gecko.sex)    specRows.push(['性別', gecko.sex]);
  if (gecko.birth)  specRows.push(['生日', gecko.birth]);
  if (gecko.weight) specRows.push(['體重', gecko.weight]);
  specRows.push(['狀態', `<span class="status-badge ${status.className}" style="position:static; display:inline-block;">${status.label}</span>`]);

  const specHtml = specRows.map(([k, v]) => `
    <tr>
      <th>${escapeHtml(k)}</th>
      <td>${v && String(v).includes('<span') ? v : escapeHtml(v || '')}</td>
    </tr>
  `).join('');

  // 備註區（有寫才顯示）
  const noteHtml = gecko.note && gecko.note.trim()
    ? `<div class="note-box">
         <div class="note-title">備 註</div>
         <div class="note-content">${escapeHtml(gecko.note)}</div>
       </div>`
    : '';

  // CTA 按鈕（賣出的話 disable）
  const isSold = gecko.status === 'sold';
  const ctaHtml = isSold
    ? `<a class="cta-button disabled">已售出</a>`
    : `<a href="${IG_URL}" target="_blank" rel="noopener" class="cta-button">私訊 IG 詢問 / 預訂</a>`;

  // 主圖 + thumbnails
  const mainPhotoHtml = photos.length > 0
    ? `<img id="main-photo-img" src="${photos[0]}" alt="${escapeHtml(gecko.morph)} ${escapeHtml(gecko.id)}">`
    : `<span class="placeholder-icon">?</span>`;

  const thumbsHtml = photos.length > 1
    ? `<div class="thumbnails">
         ${photos.map((p, i) => `
           <div class="thumbnail ${i === 0 ? 'active' : ''}" data-src="${p}">
             <img src="${p}" alt="thumbnail ${i + 1}">
           </div>
         `).join('')}
       </div>`
    : '';

  container.innerHTML = `
    <div class="product-detail">
      <div class="gallery">
        <div class="main-photo">${mainPhotoHtml}</div>
        ${thumbsHtml}
      </div>

      <div class="info-panel">
        <div class="info-header">
          <div class="info-id">編號 ${escapeHtml(gecko.id)}</div>
          <div class="info-morph">${escapeHtml(gecko.morph)}</div>
          ${formatPrice(gecko.price) ? `<div class="info-price">${escapeHtml(formatPrice(gecko.price))}</div>` : ''}
        </div>

        <table class="spec-table">
          <tbody>${specHtml}</tbody>
        </table>

        ${noteHtml}

        ${ctaHtml}
      </div>
    </div>
  `;

  // thumbnail 點擊切換主圖
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = document.getElementById('main-photo-img');
      if (mainImg) mainImg.src = thumb.dataset.src;
    });
  });
}

(() => {
  const id = getIdFromUrl();
  if (!id) {
    renderProduct(null);
    return;
  }
  const geckos = loadGeckos();
  if (!geckos) {
    renderProduct(null);
    return;
  }
  const gecko = geckos.find(g => g.id === id);
  renderProduct(gecko);
})();
