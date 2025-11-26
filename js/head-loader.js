fetch('/components/head-links.html')
  .then(res => res.text())
  .then(html => document.head.insertAdjacentHTML('beforeend', html))
  .catch(err => console.error('Gagal memuat head-links:', err));
