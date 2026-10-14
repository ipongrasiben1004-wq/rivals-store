// ==========================================
// ROBLOX RIVALS 商城 - 業主專屬後台面板 (wenio0509)
// ==========================================
const AdminService = (function () {
  let workingProducts = [];
  let editingProductId = null;

  function init() {
    // 監聽鍵盤快捷鍵 (Shift + A 快速開啟業主控制台)
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        if (AuthService.isAdmin()) {
          openAdminModal();
        }
      }
    });
  }

  // 開啟業主後台
  function openAdminModal() {
    if (!AuthService.isAdmin()) {
      alert('權限不足！只有業主 (wenio0509) 才能存取此控制面板。');
      return;
    }
    // 複製目前全域商品清單
    workingProducts = JSON.parse(JSON.stringify(window.App.getAllProducts()));
    renderAdminProductList();
    renderApiSettings();
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.add('active');
  }

  function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
  }

  // 渲染商品管理列表
  function renderAdminProductList() {
    const tbody = document.getElementById('admin-products-tbody');
    const countEl = document.getElementById('admin-product-count');
    if (!tbody) return;

    if (countEl) countEl.textContent = workingProducts.length;

    tbody.innerHTML = workingProducts.map((p, idx) => `
      <tr class="admin-table-row ${!p.inStock ? 'is-out-of-stock' : ''}">
        <td>
          <div class="admin-prod-cell">
            <img class="admin-prod-thumb rarity-border-${p.rarity || 'common'}" src="${p.image}" alt="">
            <div>
              <div class="admin-prod-title">${p.name}</div>
              <span class="admin-rarity-pill rarity-${p.rarity || 'common'}">${p.rarity || '一般'}</span>
              <span class="admin-cat-pill">${p.category}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="admin-price-box">
            <span class="currency-symbol">${CONFIG.CURRENCY_SYMBOL}</span>
            <input type="number" class="admin-input-price" value="${p.price}" 
                   onchange="AdminService.quickUpdatePrice('${p.id}', this.value)" min="0" step="5">
          </div>
        </td>
        <td>
          <div class="admin-price-box">
            <span class="currency-symbol">${CONFIG.CURRENCY_SYMBOL}</span>
            <input type="number" class="admin-input-orig-price" value="${p.originalPrice || p.price}" 
                   onchange="AdminService.quickUpdateOrigPrice('${p.id}', this.value)" min="0" step="5">
          </div>
        </td>
        <td>
          <button class="btn-toggle-stock ${p.inStock ? 'in-stock' : 'out-stock'}" 
                  onclick="AdminService.toggleStock('${p.id}')">
            ${p.inStock ? '● 販售中' : '○ 已下架'}
          </button>
        </td>
        <td>
          <div class="admin-actions">
            <button class="btn-admin-action btn-edit" onclick="AdminService.openEditForm('${p.id}')" title="詳細編輯">✏️ 編輯</button>
            <button class="btn-admin-action btn-delete" onclick="AdminService.deleteProduct('${p.id}')" title="刪除商品">🗑️ 刪除</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 快速修改售價
  function quickUpdatePrice(id, newPrice) {
    const p = workingProducts.find(item => item.id === id);
    if (p) {
      p.price = Math.max(0, parseInt(newPrice, 10) || 0);
    }
  }

  // 快速修改原價
  function quickUpdateOrigPrice(id, newOrigPrice) {
    const p = workingProducts.find(item => item.id === id);
    if (p) {
      p.originalPrice = Math.max(0, parseInt(newOrigPrice, 10) || 0);
    }
  }

  // 切換庫存狀態
  function toggleStock(id) {
    const p = workingProducts.find(item => item.id === id);
    if (p) {
      p.inStock = !p.inStock;
      renderAdminProductList();
    }
  }

  // 刪除商品
  function deleteProduct(id) {
    const p = workingProducts.find(item => item.id === id);
    if (!p) return;
    if (confirm(`確定要刪除商品「${p.name}」嗎？`)) {
      workingProducts = workingProducts.filter(item => item.id !== id);
      renderAdminProductList();
    }
  }

  // 開啟詳細編輯 / 新增表單
  function openEditForm(id = null) {
    editingProductId = id;
    const formModal = document.getElementById('product-edit-modal');
    const titleEl = document.getElementById('product-edit-modal-title');

    if (!formModal) return;

    if (id) {
      const p = workingProducts.find(item => item.id === id);
      if (!p) return;
      if (titleEl) titleEl.textContent = '✏️ 編輯商品：' + p.name;
      document.getElementById('edit-prod-id').value = p.id;
      document.getElementById('edit-prod-name').value = p.name;
      document.getElementById('edit-prod-category').value = p.category;
      document.getElementById('edit-prod-price').value = p.price;
      document.getElementById('edit-prod-origprice').value = p.originalPrice || p.price;
      document.getElementById('edit-prod-rarity').value = p.rarity || 'common';
      document.getElementById('edit-prod-image').value = p.image;
      document.getElementById('edit-prod-badge').value = p.badge || '';
      document.getElementById('edit-prod-desc').value = p.description || '';
      document.getElementById('edit-prod-stock').checked = p.inStock !== false;
    } else {
      if (titleEl) titleEl.textContent = '➕ 新增 Roblox Rivals 道具商品';
      document.getElementById('edit-prod-id').value = 'rivals-' + Date.now();
      document.getElementById('edit-prod-name').value = '';
      document.getElementById('edit-prod-category').value = '限定武器造型';
      document.getElementById('edit-prod-price').value = '100';
      document.getElementById('edit-prod-origprice').value = '150';
      document.getElementById('edit-prod-rarity').value = 'legendary';
      document.getElementById('edit-prod-image').value = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80';
      document.getElementById('edit-prod-badge').value = '新品';
      document.getElementById('edit-prod-desc').value = '';
      document.getElementById('edit-prod-stock').checked = true;
    }

    formModal.classList.add('active');
  }

  function closeEditForm() {
    const formModal = document.getElementById('product-edit-modal');
    if (formModal) formModal.classList.remove('active');
  }

  // 儲存表單編輯
  function saveEditForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('edit-prod-id').value.trim();
    const name = document.getElementById('edit-prod-name').value.trim();
    const category = document.getElementById('edit-prod-category').value;
    const price = parseInt(document.getElementById('edit-prod-price').value, 10) || 0;
    const originalPrice = parseInt(document.getElementById('edit-prod-origprice').value, 10) || price;
    const rarity = document.getElementById('edit-prod-rarity').value;
    const image = document.getElementById('edit-prod-image').value.trim();
    const badge = document.getElementById('edit-prod-badge').value.trim();
    const description = document.getElementById('edit-prod-desc').value.trim();
    const inStock = document.getElementById('edit-prod-stock').checked;

    if (!name) {
      alert('請填寫商品名稱！');
      return;
    }

    const payload = {
      id,
      name,
      category,
      price,
      originalPrice,
      rarity,
      image,
      badge,
      description,
      inStock
    };

    const existingIdx = workingProducts.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      workingProducts[existingIdx] = payload;
    } else {
      workingProducts.unshift(payload);
    }

    closeEditForm();
    renderAdminProductList();
  }

  // 儲存並同步至後端 API
  async function syncToServer() {
    const saveBtn = document.getElementById('btn-admin-sync-save');
    const origHtml = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="spinner-ring"></span> 同步至後端 API 中...`;
    }

    try {
      const res = await ApiService.updateProducts(workingProducts);
      if (res.success) {
        alert(res.fallback ? '已儲存於本機狀態！(機器人伺服器目前離線或休眠)' : '✅ 成功同步更新至 Discord Bot 後端伺服器！');
        // 更新主頁面展示
        window.App.setProducts(workingProducts);
        closeAdminModal();
      } else {
        alert('同步失敗：' + (res.error || '未知錯誤'));
      }
    } catch (err) {
      alert('儲存發生錯誤：' + err.message);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origHtml;
      }
    }
  }

  // 還原為預設商品
  function resetToDefaults() {
    if (confirm('確定要還原成預設商品清單嗎？未儲存的自訂內容將被重置。')) {
      workingProducts = JSON.parse(JSON.stringify(CONFIG.DEFAULT_PRODUCTS));
      renderAdminProductList();
    }
  }

  // 匯出/下載最新的 products.json 檔案 (跨裝置永久同步)
  function exportProductsJson() {
    const jsonStr = JSON.stringify(workingProducts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('已下載「products.json」！\n只需將此檔案放入 data/ 資料夾並推送到 GitHub，所有手機與顧客裝置就會立刻同步最新價格！');
  }

  // 渲染伺服器設定狀態
  function renderApiSettings() {
    const inputUrl = document.getElementById('admin-api-url-input');
    if (inputUrl) {
      inputUrl.value = ApiService.getBaseUrl();
    }
  }

  function saveApiUrl() {
    const inputUrl = document.getElementById('admin-api-url-input');
    if (inputUrl) {
      ApiService.setBaseUrl(inputUrl.value);
      alert('已更新 API 伺服器網址為：' + ApiService.getBaseUrl());
    }
  }

  return {
    init,
    openAdminModal,
    closeAdminModal,
    quickUpdatePrice,
    quickUpdateOrigPrice,
    toggleStock,
    deleteProduct,
    openEditForm,
    closeEditForm,
    saveEditForm,
    syncToServer,
    resetToDefaults,
    exportProductsJson,
    saveApiUrl
  };
})();

window.AdminService = AdminService;
