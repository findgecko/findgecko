// ========== 限時通知列：到期自動隱藏 ==========
// 優惠至 6/10 止，6/11（台灣時間）起自動隱藏這條通知。
// 之後若有新活動，改文字後把下面日期一起更新即可。
(function () {
  var HIDE_FROM = new Date('2026-06-11T00:00:00+08:00');
  if (new Date() >= HIDE_FROM) {
    var bar = document.querySelector('.announcement-bar');
    if (bar) bar.style.display = 'none';
  }
})();
