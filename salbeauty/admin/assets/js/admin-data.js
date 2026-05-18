const STORAGE_KEY = 'salbeauty_admin_products';
const DATASET_SYNC_KEY = 'salbeauty_admin_dataset_synced_v2';
const DATASET_URL = '../data/kosmetik_clean.csv';
const USD_TO_IDR = 16000;

function getProducts() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveProducts(products) { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function rupiah(num) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num); }
function averageDss(products) { if (!products.length) return 0; return products.reduce((a, b) => a + Number(b.dss || 0), 0) / products.length; }
function uniqueCount(products, key) { return new Set(products.map((x) => x[key])).size; }

function mapDatasetRow(item, idx) {
  return {
    id: idx + 1,
    name: item.product_name || `Produk ${idx + 1}`,
    brand: item.brand || '-',
    category: item.category || '-',
    skinType: item.skin_type || '-',
    rating: Number(item.rating || 0),
    price: Number(item.price_usd || 0) * USD_TO_IDR,
    ingredient: item.main_ingredient || '-',
    dss: Number(item.dss_score || 0)
  };
}

function loadDatasetProducts() {
  return new Promise((resolve) => {
    if (!window.Papa) {
      resolve([]);
      return;
    }
    Papa.parse(DATASET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        const raw = Array.isArray(results.data) ? results.data : [];
        const clean = raw.filter((item) => item.product_name && item.brand && item.category);
        resolve(clean.map(mapDatasetRow));
      },
      error() {
        resolve([]);
      }
    });
  });
}

async function syncProductsWithDataset() {
  const alreadySynced = localStorage.getItem(DATASET_SYNC_KEY) === '1';
  const current = getProducts();
  const oldSeedDetected = current.length === 5 && current.some((x) => x.name === 'Hydra Glow Serum');
  if (alreadySynced && !oldSeedDetected && current.length) return current;

  const datasetProducts = await loadDatasetProducts();
  if (datasetProducts.length) {
    saveProducts(datasetProducts);
    localStorage.setItem(DATASET_SYNC_KEY, '1');
    return datasetProducts;
  }
  return current;
}

function requireAuth() {
  if (window.location.pathname.includes('/admin/') && !window.location.pathname.endsWith('/login.html')) {
    if (localStorage.getItem('salbeauty_admin_auth') !== '1') window.location.href = 'login.html';
  }
}
requireAuth();
