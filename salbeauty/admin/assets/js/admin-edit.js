(async () => {
  await syncProductsWithDataset();

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const form = document.getElementById('editForm');
  let products = getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    alert('Produk tidak ditemukan');
    window.location.href = 'products.html';
    return;
  }

  Object.keys(product).forEach((k) => {
    if (form.elements[k]) form.elements[k].value = product[k];
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    products = products.map((p) => p.id === id
      ? { ...p, ...data, price: Number(data.price), rating: Number(data.rating), dss: Number(data.dss) }
      : p);
    saveProducts(products);
    window.location.href = 'products.html';
  });
})();
