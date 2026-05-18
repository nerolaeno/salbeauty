(async () => {
  const products = await syncProductsWithDataset();

  const toTitleCase = (text) => String(text || '-').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const stats = [
    { label: 'Total Produk', value: products.length, icon: 'bi-box-seam' },
    { label: 'Total Brand', value: uniqueCount(products, 'brand'), icon: 'bi-tags' },
    { label: 'Total Kategori', value: uniqueCount(products, 'category'), icon: 'bi-grid-3x3-gap' },
    { label: 'Average DSS Score', value: averageDss(products).toFixed(2), icon: 'bi-graph-up-arrow' }
  ];

  const statsCards = document.getElementById('statsCards');
  statsCards.innerHTML = stats.map((s) => `
  <div class="col-sm-6 col-xl-3">
    <div class="stat-card">
      <div class="stat-head"><span>${s.label}</span><span class="stat-icon"><i class="bi ${s.icon}"></i></span></div>
      <div class="stat-value">${s.value}</div>
    </div>
  </div>`).join('');

  const recent = [...products].sort((a, b) => b.dss - a.dss).slice(0, 5);
  document.getElementById('recentActivity').innerHTML = recent
    .map((p) => `<li><strong>${toTitleCase(p.name)}</strong><br><small>${toTitleCase(p.brand)} | ${toTitleCase(p.category)} | DSS ${Number(p.dss).toFixed(2)}</small></li>`)
    .join('');
})();
