// ========== 認養詳細頁：從 URL 讀 id，撈 adopts，渲染詳細資訊 ==========

const ADOPT_STATUS_MAP = {
  adoptable: { label: '可認養', className: 'status-available' },
  adopted:   { label: '已認養', className: 'status-sold' }
};

const IG_URL = 'https://www.instagram.com/findgecko_3/';

function loadAdopts() {
  if (!window.ADOPTS_DATA || !Array.isArray(window.ADOPTS_DATA.adopts)) {
    console.error('找不到 ADOPTS_DATA，請確認 data/adopts.js 有正確載入');
    return null;
  }
  return window.ADOPTS_DATA.adopts;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
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

function renderAdopt(gecko) {
  const container = document.getElementById('adopt-detail-content');

  if (!gecko) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">?</div>
        <p>找不到這隻守宮的資料。</p>
      </div>`;
    document.title = '找不到 ｜ 尋守宮';
    return;
  }

  document.title = `${gecko.morph} ${gecko.id}｜認養專區｜尋守宮 FindGecko`;

  const status = ADOPT_STATUS_MAP[gecko.status] || ADOPT_STATUS_MAP.adoptable;
  const photos = (gecko.photos && gecko.photos.length > 0)
    ? gecko.photos.map(p => `images/${gecko.id}/${p}`)
    : [];

  const specRows = [];
  specRows.push(['編號', gecko.id]);
  specRows.push(['品系', gecko.morph]);
  if (gecko.sex)   specRows.push(['性別', gecko.sex]);
  if (gecko.birth) specRows.push(['生日', gecko.birth]);
  if (gecko.weight) specRows.push(['體重', gecko.weight]);
  specRows.push(['狀態', `<span class="status-badge ${status.className}" style="position:static; display:inline-block;">${status.label}</span>`]);

  const specHtml = specRows.map(([k, v]) => `
    <tr>
      <th>${escapeHtml(k)}</th>
      <td>${v && String(v).includes('<span') ? v : escapeHtml(v || '')}</td>
    </tr>
  `).join('');

  const noteHtml = gecko.note && gecko.note.trim()
    ? `<div class="note-box">
         <div class="note-title">備 註</div>
         <div class="note-content">${escapeHtml(gecko.note)}</div>
       </div>`
    : '';

  const isAdopted = gecko.status === 'adopted';
  const ctaHtml = isAdopted
    ? `<a class="cta-button disabled">已認養</a>`
    : `<a href="${IG_URL}" target="_blank" rel="noopener" class="cta-button">私訊 IG 詢問認養</a>`;

  const mainPhotoHtml = photos.length > 0
    ? `<img id="main-photo-img" src="${photos[0]}" alt="${escapeHtml(gecko.morph)} ${escapeHtml(gecko.id)}" decoding="async">`
    : `<span class="placeholder-icon">?</span>`;

  const thumbsHtml = photos.length > 1
    ? `<div class="thumbnails">
         ${photos.map((p, i) => `
           <div class="thumbnail ${i === 0 ? 'active' : ''}" data-src="${p}">
             <img src="${p}" alt="thumbnail ${i + 1}" loading="lazy" decoding="async">
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
        </div>

        <table class="spec-table">
          <tbody>${specHtml}</tbody>
        </table>

        ${noteHtml}

        ${ctaHtml}
      </div>
    </div>
  `;

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
    renderAdopt(null);
    return;
  }
  const adopts = loadAdopts();
  if (!adopts) {
    renderAdopt(null);
    return;
  }
  const gecko = adopts.find(g => g.id === id);
  renderAdopt(gecko);
})();
