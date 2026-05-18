(async () => {
  await syncProductsWithDataset();

  let allProducts = getProducts();
  let filtered = [...allProducts];
  let currentPage = 1;
  const perPage = 6;
  let deleteId = null;

  const rowsEl = document.getElementById('productRows');
  const searchEl = document.getElementById('searchInput');
  const catEl = document.getElementById('categoryFilter');
  const brandEl = document.getElementById('brandFilter');
  const paginationEl = document.getElementById('pagination');
  const productModal = new bootstrap.Modal(document.getElementById('productModal'));
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  function fillFilters() {
    catEl.innerHTML = '<option value="">Semua Kategori</option>' + [...new Set(allProducts.map((p) => p.category))].map((v) => `<option value="${v}">${v}</option>`).join('');
    brandEl.innerHTML = '<option value="">Semua Brand</option>' + [...new Set(allProducts.map((p) => p.brand))].map((v) => `<option value="${v}">${v}</option>`).join('');
  }

  function render() {
    const start = (currentPage - 1) * perPage;
    const pageData = filtered.slice(start, start + perPage);
    rowsEl.innerHTML = pageData.map((p, i) => `
    <tr>
      <td>${start + i + 1}</td><td>${p.name}</td><td>${p.brand}</td><td>${p.category}</td><td>${p.skinType}</td><td>${p.rating}</td><td>${rupiah(p.price)}</td><td>${Number(p.dss).toFixed(2)}</td>
      <td>
        <a href="edit.html?id=${p.id}" class="btn btn-sm btn-soft">Edit</a>
        <button class="btn btn-sm btn-outline-danger" onclick="askDelete(${p.id})">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="9" class="text-center py-4">Data tidak ditemukan.</td></tr>';

    const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
    paginationEl.innerHTML = buildPagination(pageCount);
  }

  function buildPagination(pageCount) {
    if (pageCount <= 1) return '';

    const parts = [];
    const windowSize = 5;
    let start = currentPage - Math.floor(windowSize / 2);
    let end = currentPage + Math.floor(windowSize / 2);

    if (start < 1) {
      start = 1;
      end = Math.min(windowSize, pageCount);
    }
    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, pageCount - windowSize + 1);
    }

    parts.push(`<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">&lt;</button>`);
    for (let i = start; i <= end; i += 1) {
      parts.push(`<button class="pagination-btn ${currentPage === i ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`);
    }
    parts.push(`<button class="pagination-btn" ${currentPage === pageCount ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">&gt;</button>`);

    return parts.join('');
  }

  function applyFilter() {
    const q = searchEl.value.toLowerCase();
    filtered = allProducts.filter((p) => p.name.toLowerCase().includes(q) && (!catEl.value || p.category === catEl.value) && (!brandEl.value || p.brand === brandEl.value));
    currentPage = 1;
    render();
  }

  window.goPage = (n) => { currentPage = n; render(); };
  window.askDelete = (id) => { deleteId = id; deleteModal.show(); };

  document.getElementById('confirmDelete').addEventListener('click', () => {
    allProducts = allProducts.filter((p) => p.id !== deleteId);
    saveProducts(allProducts);
    applyFilter();
    fillFilters();
    deleteModal.hide();
  });

  document.getElementById('openAddModal').addEventListener('click', () => productModal.show());
  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    const item = {
      id: Date.now(),
      name: data.name,
      brand: data.brand,
      category: data.category,
      skinType: data.skinType,
      price: Number(String(data.price).replace(/[^0-9.]/g, '')) || 0,
      rating: Number(String(data.rating).replace(/[^0-9.]/g, '')) || 0,
      ingredient: data.ingredient,
      dss: Number(String(data.dss).replace(/[^0-9.]/g, '')) || 0
    };
    allProducts.unshift(item);
    saveProducts(allProducts);
    e.target.reset();
    productModal.hide();
    fillFilters();
    applyFilter();
  });

  [searchEl, catEl, brandEl].forEach((el) => el.addEventListener('input', applyFilter));
  fillFilters();
  applyFilter();
})();

