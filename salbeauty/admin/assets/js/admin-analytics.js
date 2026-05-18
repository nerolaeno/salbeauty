(async () => {
  const products = await syncProductsWithDataset();

  const toNum = (v) => Number(v || 0);
  const toTitle = (v) => String(v || '-').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const avg = (arr, key) => arr.length ? arr.reduce((s, x) => s + toNum(x[key]), 0) / arr.length : 0;
  const countBy = (arr, key) => arr.reduce((acc, item) => {
    const k = item[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const normalized = products.map((item) => ({
    ...item,
    ratingValue: toNum(item.rating),
    dssValue: toNum(item.dss),
    reviewCount: 0,
    beautyMatch: Math.round(toNum(item.dss) * 100)
  }));

  const categoryCount = countBy(normalized, 'category');
  const brandCount = countBy(normalized, 'brand');
  const topBrand = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const kpi = [
    { label: 'Total Produk', value: normalized.length, icon: 'bi-box-seam' },
    { label: 'Total Kategori', value: Object.keys(categoryCount).length, icon: 'bi-grid-3x3-gap' },
    { label: 'Most Loved Brand', value: toTitle(topBrand), icon: 'bi-heart-fill' },
    { label: 'User Favorite Rating', value: avg(normalized, 'ratingValue').toFixed(1), icon: 'bi-star-fill' }
  ];

  document.getElementById('analyticsKpi').innerHTML = kpi.map((item) => `
    <div class="col-sm-6 col-xl-3">
      <div class="stat-card">
        <div class="stat-head"><span>${item.label}</span><span class="stat-icon"><i class="bi ${item.icon}"></i></span></div>
        <div class="stat-value stat-value-text">${item.value}</div>
      </div>
    </div>`).join('');

  const commonPlugins = {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.98)',
      titleColor: '#2b2b2b',
      bodyColor: '#5f5f5f',
      borderColor: '#f3cddd',
      borderWidth: 1,
      padding: 10
    }
  };

  const topBeauty = [...normalized]
    .sort((a, b) => b.dssValue - a.dssValue || b.ratingValue - a.ratingValue)
    .slice(0, 12);

  new Chart(document.getElementById('topBeautyChart'), {
    type: 'bar',
    data: {
      labels: topBeauty.map((x) => x.name),
      datasets: [{ data: topBeauty.map((x) => x.beautyMatch), backgroundColor: '#f48fb1', borderRadius: 10, maxBarThickness: 26 }]
    },
    options: {
      indexAxis: 'y',
      plugins: commonPlugins,
      scales: {
        x: { grid: { color: 'rgba(240,98,146,0.09)' }, ticks: { color: '#825c6f', callback: (v) => `${v}%` } },
        y: { grid: { display: false }, ticks: { color: '#825c6f' } }
      }
    }
  });

  const brandMap = {};
  normalized.forEach((item) => {
    const key = item.brand || 'Unknown';
    if (!brandMap[key]) brandMap[key] = { brand: key, count: 0, ratingTotal: 0, dssTotal: 0 };
    brandMap[key].count += 1;
    brandMap[key].ratingTotal += item.ratingValue;
    brandMap[key].dssTotal += item.dssValue;
  });

  const mostLovedBrands = Object.values(brandMap)
    .map((item) => {
      const avgRating = item.ratingTotal / item.count;
      const avgDss = item.dssTotal / item.count;
      const popularityScore = avgRating * 0.45 + avgDss * 5 * 0.35 + Math.log10(item.count + 1) * 0.2;
      return { ...item, popularityScore: Number(popularityScore.toFixed(2)) };
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 10);

  new Chart(document.getElementById('brandChart'), {
    type: 'bar',
    data: {
      labels: mostLovedBrands.map((x) => toTitle(x.brand)),
      datasets: [{ data: mostLovedBrands.map((x) => x.popularityScore), backgroundColor: '#f9bdd1', borderRadius: 10, maxBarThickness: 26 }]
    },
    options: {
      indexAxis: 'y',
      plugins: commonPlugins,
      scales: {
        x: { grid: { color: 'rgba(240,98,146,0.09)' }, ticks: { color: '#825c6f' } },
        y: { grid: { display: false }, ticks: { color: '#825c6f' } }
      }
    }
  });

  const skinOrder = ['oily', 'dry', 'sensitive', 'combination'];
  const skinLabels = { oily: 'Oily Skin', dry: 'Dry Skin', sensitive: 'Sensitive Skin', combination: 'Combination Skin' };
  const skinBest = skinOrder.map((skin) => {
    const best = normalized.filter((x) => x.skinType === skin).sort((a, b) => b.dssValue - a.dssValue)[0];
    return { label: skinLabels[skin], score: best ? Math.round(best.dssValue * 100) : 0 };
  });

  new Chart(document.getElementById('skinTypeChart'), {
    type: 'bar',
    data: { labels: skinBest.map((x) => x.label), datasets: [{ data: skinBest.map((x) => x.score), backgroundColor: '#ffd6e4', borderRadius: 10 }] },
    options: {
      plugins: commonPlugins,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#825c6f' } },
        y: { grid: { color: 'rgba(240,98,146,0.09)' }, ticks: { color: '#825c6f', callback: (v) => `${v}%` } }
      }
    }
  });

  const minPrice = Math.min(...normalized.map((x) => x.price));
  const maxPrice = Math.max(...normalized.map((x) => x.price));
  const bestValue = [...normalized]
    .map((x) => {
      const priceNorm = 1 - ((x.price - minPrice) / (maxPrice - minPrice || 1));
      const valueScore = x.dssValue * 0.45 + (x.ratingValue / 5) * 0.3 + priceNorm * 0.25;
      return { ...x, valueScore: Number(valueScore.toFixed(3)) };
    })
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 6);

  document.getElementById('bestValueList').innerHTML = bestValue.map((p) => `
    <li>
      <div>
        <strong>${toTitle(p.name)}</strong>
        <small>${toTitle(p.brand)} | Rating ${p.ratingValue.toFixed(1)}</small>
      </div>
      <div class="top-metric">
        <span>Value ${(p.valueScore * 100).toFixed(0)}</span>
        <small>${rupiah(p.price)}</small>
      </div>
    </li>
  `).join('');

  const scatterPoints = normalized.slice(0, 250).map((x) => ({ x: x.price, y: x.ratingValue, match: x.beautyMatch, name: x.name, brand: x.brand }));
  new Chart(document.getElementById('priceQualityChart'), {
    type: 'scatter',
    data: { datasets: [{ data: scatterPoints, backgroundColor: 'rgba(240,98,146,0.45)', pointRadius: 4, pointHoverRadius: 7 }] },
    options: {
      plugins: {
        ...commonPlugins,
        tooltip: {
          ...commonPlugins.tooltip,
          callbacks: {
            label(ctx) {
              const item = ctx.raw;
              return [`${toTitle(item.name)}`, `Brand: ${toTitle(item.brand)}`, `Price: ${rupiah(item.x)}`, `Rating: ${item.y.toFixed(1)}`, `Beauty Match: ${item.match}%`];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(240,98,146,0.09)' }, ticks: { color: '#825c6f', callback: (v) => rupiah(v) } },
        y: { grid: { color: 'rgba(240,98,146,0.09)' }, ticks: { color: '#825c6f' }, min: 0, max: 5 }
      }
    }
  });

  const topDss = [...normalized].sort((a, b) => b.dssValue - a.dssValue).slice(0, 5);
  document.getElementById('topDssList').innerHTML = topDss.map((p) => `
    <li>
      <div>
        <strong>${toTitle(p.name)}</strong>
        <small>${toTitle(p.brand)} | ${toTitle(p.category)} | Rating ${p.ratingValue.toFixed(1)}</small>
      </div>
      <div class="top-metric">
        <span>DSS ${p.dssValue.toFixed(2)}</span>
        <small>${rupiah(p.price)}</small>
      </div>
    </li>
  `).join('');
})();
