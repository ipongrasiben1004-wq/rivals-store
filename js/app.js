// ==========================================
// ROBLOX RIVALS 商城 - 前端主程式控制器
// ==========================================
const App = (function () {
  let allProducts = [];
  let currentCategory = 'all';
  let searchQuery = '';

  async function init() {
    // 1. 初始化各子系統
    AuthService.init();
    CartService.init();
    AdminService.init();

    // 2. 綁定全域身分異動事件
    window.addEventListener('auth:change', handleAuthChange);
    updateUserUI(AuthService.getUser());

    // 3. 抓取商品清單
    await loadProducts();

    // 4. 綁定各類事件
    bindEvents();

    // 5. 更新購物車紅點與列表
    CartService.renderCartBadge();
    CartService.renderCartDrawer();

    // 6. 顧客來源檢測：若來自 Discord 或未登入，友好提示登入
    checkDiscordReferral();
  }

  // 載入商品
  async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-state">
          <div class="tactical-scanner"></div>
          <p>正在同步 Roblox Rivals 軍火庫資料...</p>
        </div>
      `;
    }

    const res = await ApiService.fetchProducts();
    allProducts = res.products || CONFIG.DEFAULT_PRODUCTS;
    renderProducts();
    updateServerBadge(res.source);
  }

  function setProducts(newProducts) {
    allProducts = newProducts;
    renderProducts();
  }

  function getAllProducts() {
    return allProducts;
  }

  // 更新伺服器連線狀態徽章
  function updateServerBadge(source) {
    const badge = document.getElementById('server-status-pill');
    if (!badge) return;
    if (source === 'remote') {
      badge.className = 'status-pill online';
      badge.innerHTML = `<span class="dot"></span> DC 機器人連線中`;
    } else {
      badge.className = 'status-pill standby';
      badge.innerHTML = `<span class="dot"></span> 本地安全模式`;
    }
  }

  // 渲染商品網格
  function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // 篩選分類與關鍵字
    const filtered = allProducts.filter(p => {
      const matchCat = currentCategory === 'all' || p.category === currentCategory;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-products-box">
          <div class="empty-icon">🎯</div>
          <h3>未找到相符的 Rivals 武器商品</h3>
          <p>嘗試搜尋不同關鍵字或切換「全部商品」分類</p>
          <button class="btn-tactical btn-reset-filter" onclick="App.resetFilters()">重設篩選條件</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const isOut = p.inStock === false;
      const discount = p.originalPrice && p.originalPrice > p.price
        ? Math.round((1 - p.price / p.originalPrice) * 100)
        : null;

      return `
        <article class="product-card rarity-${p.rarity || 'common'} ${isOut ? 'is-disabled' : ''}" data-id="${p.id}">
          <div class="card-glow"></div>
          <div class="card-header-bar">
            <span class="rarity-tag rarity-${p.rarity || 'common'}">${getRarityLabel(p.rarity)}</span>
            ${p.badge ? `<span class="promo-badge">${p.badge}</span>` : ''}
          </div>
          
          <div class="product-image-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy" class="product-img">
            ${isOut ? `<div class="out-of-stock-overlay"><span>暫時售罄</span></div>` : ''}
          </div>

          <div class="product-details">
            <div class="product-category">${p.category || '戰術裝備'}</div>
            <h3 class="product-name" title="${p.name}">${p.name}</h3>
            <p class="product-desc">${p.description || 'Roblox Rivals 限量稀有電競道具。'}</p>

            <div class="product-footer">
              <div class="price-container">
                <div class="current-price">
                  <span class="currency-symbol">${CONFIG.CURRENCY_SYMBOL}</span>
                  <span class="price-amount">${p.price.toLocaleString()}</span>
                  <span class="currency-label">${CONFIG.CURRENCY_NAME}</span>
                </div>
                ${discount ? `
                  <div class="original-price-wrap">
                    <span class="orig-price">${CONFIG.CURRENCY_SYMBOL} ${p.originalPrice.toLocaleString()}</span>
                    <span class="discount-tag">-${discount}%</span>
                  </div>
                ` : ''}
              </div>

              <button class="btn-add-cart ${isOut ? 'disabled' : ''}" 
                      onclick="App.addToCart('${p.id}')"
                      ${isOut ? 'disabled' : ''}>
                <span class="btn-icon">🛒</span>
                <span class="btn-text">${isOut ? '缺貨中' : '加入購物車'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function getRarityLabel(rarity) {
    const map = {
      mythic: '神話 MYTHIC',
      legendary: '傳奇 LEGENDARY',
      epic: '史詩 EPIC',
      rare: '稀有 RARE',
      common: '一般 STANDARD'
    };
    return map[rarity] || '精選 ITEM';
  }

  // 加入購物車快捷呼叫
  function addToCart(productId) {
    const p = allProducts.find(item => item.id === productId);
    if (!p) return;
    CartService.addItem(p);

    // 彈出微型浮動提示
    showToast(`已將「${p.name}」加入戰術背囊！`);
  }

  // 輕量 Toast 提示
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.innerHTML = `<span class="toast-icon">⚡</span> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // 重設篩選
  function resetFilters() {
    currentCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });
    renderProducts();
  }

  // 使用者 UI 狀態更新
  function updateUserUI(user) {
    const authBox = document.getElementById('nav-auth-section');
    const adminBtn = document.getElementById('btn-nav-admin');

    if (!authBox) return;

    if (user) {
      authBox.innerHTML = `
        <div class="user-profile-badge" onclick="App.showUserMenu()">
          <img class="user-avatar" src="${user.avatar}" alt="${user.username}">
          <div class="user-meta">
            <span class="user-name">${user.username}</span>
            <span class="user-badge">${AuthService.isAdmin() ? '👑 業主' : '🎮 顧客'}</span>
          </div>
          <button class="btn-logout-tiny" onclick="event.stopPropagation(); AuthService.logout();" title="登出 Discord">登出</button>
        </div>
      `;
    } else {
      authBox.innerHTML = `
        <button class="btn-discord-login" onclick="AuthService.triggerDiscordOAuth()">
          <svg class="dc-icon" viewBox="0 0 127.14 96.36">
            <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          <span>登入 Discord</span>
        </button>
      `;
    }

    if (adminBtn) {
      adminBtn.style.display = AuthService.isAdmin() ? 'inline-flex' : 'none';
    }
  }

  function handleAuthChange(e) {
    const user = e.detail.user;
    updateUserUI(user);
    if (user) {
      showToast(`歡迎回來，${user.username}！`);
      // 登入後確保立刻隱藏登入引導彈窗
      closeDiscordPromptModal();
      sessionStorage.setItem('rivals_prompt_dismissed', 'true');
    } else {
      showToast('已登出 Discord 身分。');
    }
  }

  // 顧客自 Discord 連結前來時的詢問彈窗
  function checkDiscordReferral() {
    // 1. 若已經登入，絕不彈出！
    if (AuthService.isLoggedIn()) {
      return;
    }

    // 2. 若網址正帶有 access_token (正在進行授權回跳)，絕不彈出！
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      return;
    }

    // 3. 若本次瀏覽已經關閉過此彈窗，絕不再打擾！
    if (sessionStorage.getItem('rivals_prompt_dismissed') === 'true') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fromDc = urlParams.get('ref') === 'discord' || document.referrer.includes('discord');
    
    // 只有在未登入且未關閉過時，延遲 1.2 秒友善提示
    setTimeout(() => {
      // 再次確認這段時間內沒有登入
      if (!AuthService.isLoggedIn() && sessionStorage.getItem('rivals_prompt_dismissed') !== 'true') {
        showDiscordPromptModal(fromDc);
      }
    }, 1200);
  }

  // 顯示 Discord 登入詢問框 (需求：自動詢問是否使用剛剛的 DC 登入)
  function showDiscordPromptModal(isFromDc = true) {
    if (AuthService.isLoggedIn()) return;
    const modal = document.getElementById('discord-prompt-modal');
    if (!modal) return;
    const promptText = document.getElementById('prompt-modal-text');
    if (promptText) {
      promptText.textContent = isFromDc 
        ? '偵測到您從 Discord 群組前來！是否直接使用您的 Discord 帳號登入進行選購？'
        : '登入 Discord 即可享受一鍵下單、機器人自動建立私人專屬交易單與即時通知！';
    }
    modal.classList.add('active');
  }

  function closeDiscordPromptModal() {
    const modal = document.getElementById('discord-prompt-modal');
    if (modal) modal.classList.remove('active');
    // 記錄已經看過/關閉，本次會話不再跳出
    sessionStorage.setItem('rivals_prompt_dismissed', 'true');
  }

  // 開啟手動/進階登入 Modal
  function showLoginModal(customNotice = '') {
    const modal = document.getElementById('login-modal');
    const noticeEl = document.getElementById('login-modal-notice');
    if (noticeEl) {
      noticeEl.textContent = customNotice || '登入 Discord 即可解鎖 Rivals 購物車送單與訂單頻道建立！';
    }
    if (modal) modal.classList.add('active');
  }

  function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.remove('active');
  }

  // 模擬/自訂 Discord 帳號登入
  function submitQuickLogin(username, isAdminOverride = false) {
    if (!username) {
      alert('請輸入 Discord 使用者名稱！');
      return;
    }
    const cleanName = username.trim();
    const isOwner = cleanName.toLowerCase() === (CONFIG.OWNER_DISCORD_USERNAME || 'wenio0509').toLowerCase() || isAdminOverride;

    AuthService.setUser({
      id: isOwner ? 'owner_wenio0509' : ('user_' + Math.floor(10000000 + Math.random() * 90000000)),
      username: cleanName,
      avatar: AuthService.getRandomAvatar(cleanName),
      isAdminOverride: isOwner,
      loginType: 'quick'
    });

    closeLoginModal();
    closeDiscordPromptModal();
    if (window.SoundSystem) SoundSystem.click();
  }

  // 購物車抽屜開關
  function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer) return;

    if (open === undefined) {
      open = !drawer.classList.contains('active');
    }

    drawer.classList.toggle('active', open);
    if (backdrop) backdrop.classList.toggle('active', open);

    if (open) {
      CartService.renderCartDrawer();
      if (window.SoundSystem) SoundSystem.click();
    }
  }

  // 下單成功專屬彈窗 (需求三)
  function showOrderSuccessModal({ orderId, totalAmount, buyerName, isSimulated }) {
    const modal = document.getElementById('order-success-modal');
    if (!modal) return;

    document.getElementById('success-order-id').textContent = '#' + orderId;
    document.getElementById('success-total-amount').textContent = `${CONFIG.CURRENCY_SYMBOL} ${totalAmount.toLocaleString()} (${CONFIG.CURRENCY_NAME})`;
    
    modal.classList.add('active');
  }

  function closeOrderSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) modal.classList.remove('active');
  }

  // 綁定各類按鈕與輸入事件
  function bindEvents() {
    // 1. 分類標籤點擊
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts();
        if (window.SoundSystem) SoundSystem.click();
      });
    });

    // 2. 搜尋輸入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProducts();
      });
    }

    // 3. 音效開關切換
    const audioToggle = document.getElementById('btn-audio-toggle');
    if (audioToggle) {
      const updateAudioIcon = () => {
        const muted = SoundSystem.isMuted();
        audioToggle.innerHTML = muted ? '🔇' : '🔊';
        audioToggle.title = muted ? '點擊開啟戰術音效' : '點擊靜音';
      };
      updateAudioIcon();
      audioToggle.addEventListener('click', () => {
        SoundSystem.toggleMute();
        updateAudioIcon();
      });
    }
  }

  return {
    init,
    loadProducts,
    setProducts,
    getAllProducts,
    addToCart,
    resetFilters,
    showLoginModal,
    closeLoginModal,
    showDiscordPromptModal,
    closeDiscordPromptModal,
    submitQuickLogin,
    toggleCartDrawer,
    showOrderSuccessModal,
    closeOrderSuccessModal,
    showToast
  };
})();

window.App = App;

// DOM 加載完成後啟動
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
