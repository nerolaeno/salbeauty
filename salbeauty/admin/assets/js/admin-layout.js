const path = window.location.pathname.split('/').pop();
const sidebar = document.getElementById('adminSidebar');
if (sidebar) {
  sidebar.innerHTML = `
    <a href="dashboard.html" class="sidebar-brand">Salbeauty Admin</a>
    <a class="sidebar-link ${path === 'dashboard.html' ? 'active' : ''}" href="dashboard.html"><i class="bi bi-grid"></i>Dashboard</a>
    <a class="sidebar-link ${path === 'products.html' || path === 'edit.html' ? 'active' : ''}" href="products.html"><i class="bi bi-box-seam"></i>Kelola Produk</a>
    <a class="sidebar-link ${path === 'analytics.html' ? 'active' : ''}" href="analytics.html"><i class="bi bi-bar-chart"></i>Analytics</a>
    <a class="sidebar-link" href="#" id="exportLink"><i class="bi bi-filetype-csv"></i>Export Data</a>
    <a class="sidebar-link" href="#" id="logoutLink"><i class="bi bi-box-arrow-right"></i>Logout</a>
  `;
}
document.getElementById('toggleSidebar')?.addEventListener('click', () => sidebar?.classList.toggle('show'));
document.getElementById('logoutLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('salbeauty_admin_auth');
  window.location.href = '../index.html';
});
function exportProductsCsv() {
  const products = getProducts();
  const header = ['Nama Produk','Brand','Kategori','Skin Type','Rating','Harga','Ingredient','DSS Score'];
  const rows = products.map((p) => [p.name,p.brand,p.category,p.skinType,p.rating,p.price,p.ingredient,p.dss]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'salbeauty-products.csv';
  a.click();
}
document.getElementById('exportLink')?.addEventListener('click', (e) => { e.preventDefault(); exportProductsCsv(); });
document.getElementById('exportCsvBtn')?.addEventListener('click', exportProductsCsv);
