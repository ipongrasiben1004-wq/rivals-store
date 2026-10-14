// ==========================================
// ROBLOX RIVALS 商城 - Discord 身份驗證模組
// ==========================================
const AuthService = (function () {
  const STORAGE_KEY = 'rivals_discord_user';
  let currentUser = null;

  // 初始化：嘗試載入既有登入紀錄或解析 URL 回傳的 Token
  function init() {
    // 1. 檢查是否有 Discord OAuth2 回傳的 Token
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        fetchDiscordUser(token);
        // 清理網址列 hash
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        return;
      }
    }

    // 2. 從本機儲存讀取
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {
        currentUser = null;
      }
    }
  }

  // 透過 Discord OAuth2 Token 讀取真實使用者資料
  async function fetchDiscordUser(token) {
    try {
      const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.avatar
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
          : `https://cdn.discordapp.com/embed/avatars/${(data.discriminator || 0) % 5}.png`;

        setUser({
          id: data.id,
          username: data.username,
          discriminator: data.discriminator || '0',
          avatar: avatarUrl,
          loginType: 'oauth'
        });
      }
    } catch (e) {
      console.warn('Discord OAuth fetch error:', e);
    }
  }

  // 設定並保存登入使用者
  function setUser(userObj) {
    currentUser = userObj;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    // 派發登入變更事件
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: currentUser } }));
  }

  // 登出 (清除所有登入憑證)
  function logout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: null } }));
  }

  // 是否為業主 (wenio0509)
  function isAdmin() {
    if (!currentUser) return false;
    const target = (CONFIG.OWNER_DISCORD_USERNAME || 'wenio0509').toLowerCase();
    const current = (currentUser.username || '').toLowerCase();
    return current === target || currentUser.isAdminOverride === true;
  }

  // 發起真正的 Discord 官方 OAuth2 授權跳轉
  function triggerDiscordOAuth() {
    let clientId = (CONFIG.DISCORD_CLIENT_ID || '').trim();
    if (!clientId) {
      clientId = localStorage.getItem('rivals_custom_client_id');
    }

    if (!clientId) {
      // 提示使用者設定其 Discord Bot 的 Client ID
      const input = prompt(
        '【連結 Discord 官方授權設定】\n\n' +
        '請輸入您的 Discord Bot 應用程式「Client ID」（可在 Discord Developer Portal 取得）：\n' +
        '輸入後將立即為您跳轉至 Discord 官方登入授權頁面！'
      );
      if (input && input.trim()) {
        clientId = input.trim();
        localStorage.setItem('rivals_custom_client_id', clientId);
      } else {
        return false;
      }
    }

    // 計算當前重新導向網址 (當前頁面 URL 去除 hash 與 query)
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent('identify');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    // 直接導向 Discord 官方登入授權頁面！
    window.location.href = authUrl;
    return true;
  }

  // 產生隨機預設 Discord 頭像
  function getRandomAvatar(name) {
    const seed = encodeURIComponent(name || 'RivalsPlayer');
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=0f1117,1c202a`;
  }

  return {
    init,
    getUser: () => currentUser,
    isLoggedIn: () => !!currentUser,
    isAdmin,
    setUser,
    logout,
    triggerDiscordOAuth,
    getRandomAvatar
  };
})();

window.AuthService = AuthService;
