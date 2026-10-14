// ==========================================
// ROBLOX RIVALS 商城 - 購物車與結帳系統
// ==========================================
const CartService = (function () {
  const STORAGE_KEY = 'rivals_cart_items';
  let items = [];

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        items = [];
      }
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderCartBadge();
    renderCartDrawer();
  }

  // 加入購物車
  function addItem(product) {
    if (!product || !product.inStock) return;
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        rarity: product.rarity,
        image: product.image,
        category: product.category,
        quantity: 1
      });
    }
    save();
    if (window.SoundSystem) SoundSystem.addToCart();
  }

  // 增加/減少數量
  function changeQuantity(id, delta) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeItem(id);
      return;
    }
    save();
    if (window.SoundSystem) SoundSystem.qty();
  }

  // 移除商品
  function removeItem(id) {
    items = items.filter(i => i.id !== id);
    save();
    if (window.SoundSystem) SoundSystem.remove();
  }

  // 清空購物車
  function clear() {
    items = [];
    save();
  }

  // 計算總計金額
  function getTotal() {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // 取得總件數
  function getCount() {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // 更新右上角購物車紅點/件數
  function renderCartBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const count = getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // 渲染購物車側邊抽屜
  function renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('btn-checkout-submit');

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-cart-icon">🛒</div>
          <div class="empty-cart-title">購物車內空空如也</div>
          <p class="empty-cart-desc">戰術背囊目前無任何 Rivals 道具裝備，快挑選一把心儀的武器或造型吧！</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '0';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    const total = getTotal();
    if (totalEl) totalEl.textContent = total.toLocaleString();

    container.innerHTML = items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-thumb rarity-border-${item.rarity || 'common'}">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-category">${item.category || '道具'}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">
            <span class="currency-symbol">${CONFIG.CURRENCY_SYMBOL}</span>
            <span class="price-val">${item.price.toLocaleString()}</span>
          </div>
        </div>
        <div class="cart-item-actions">
          <button class="btn-qty" onclick="CartService.changeQuantity('${item.id}', -1)" title="減少數量">-</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button class="btn-qty" onclick="CartService.changeQuantity('${item.id}', 1)" title="增加數量">+</button>
          <button class="btn-trash" onclick="CartService.removeItem('${item.id}')" title="移除商品">✕</button>
        </div>
      </div>
    `).join('');
  }

  // 結帳送出訂單
  async function submitOrder() {
    if (items.length === 0) {
      alert('購物車是空的，無法送出訂單！');
      return;
    }

    // 檢查 Discord 登入狀態
    const user = AuthService.getUser();
    if (!user) {
      alert('請先完成 Discord 官方授權登入，以便機器人能在群組為您建立專屬交易頻道！');
      AuthService.triggerDiscordOAuth();
      return;
    }

    const robloxUsernameInput = document.getElementById('input-roblox-username');
    const robloxUsername = (robloxUsernameInput ? robloxUsernameInput.value.trim() : '') || '未提供';

    const orderPayload = {
      buyer: {
        id: user.id || 'buyer_' + Math.floor(Date.now() / 1000),
        username: user.username,
        avatar: user.avatar || AuthService.getRandomAvatar(user.username)
      },
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount: getTotal(),
      note: `Roblox ID: ${robloxUsername}`,
      timestamp: new Date().toISOString()
    };

    // UI 切換至發送中
    const submitBtn = document.getElementById('btn-checkout-submit');
    const origText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-ring"></span> 連線 Discord 商城機器人中...`;
    }

    try {
      const result = await ApiService.submitOrder(orderPayload);
      
      // 成功播放音效
      if (window.SoundSystem) SoundSystem.success();

      // 關閉購物車抽屜
      if (window.App) window.App.toggleCartDrawer(false);

      // 清空購物車
      const finalAmount = getTotal();
      const finalOrderId = result.orderId || ('RV-' + Math.floor(1000 + Math.random() * 9000));
      clear();

      // 依據規格：自動登出 Discord
      AuthService.logout();

      // 彈出成功的專屬付款指引彈窗
      if (window.App) {
        window.App.showOrderSuccessModal({
          orderId: finalOrderId,
          totalAmount: finalAmount,
          channelId: result.channelId,
          buyerName: user.username,
          isSimulated: result.isSimulated
        });
      }

    } catch (err) {
      alert('送出訂單時發生錯誤：' + err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    }
  }

  return {
    init,
    getItems: () => items,
    addItem,
    changeQuantity,
    removeItem,
    clear,
    getTotal,
    getCount,
    renderCartBadge,
    renderCartDrawer,
    submitOrder
  };
})();

window.CartService = CartService;
