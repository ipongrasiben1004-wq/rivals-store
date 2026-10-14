// ==========================================
// ROBLOX RIVALS 商城 - 核心設定檔
// ==========================================
const CONFIG = {
  // 後端 API 伺服器基礎網址 (Discord Bot API)
  API_BASE_URL: 'https://scrguard0308-robuxsellersystem.hf.space',
  
  // 備用/本地 API 網址 (若於本機開發測試可切換)
  LOCAL_API_URL: 'http://localhost:3000',
  
  // 業主 Discord 帳號 (擁有後台面板權限)
  OWNER_DISCORD_USERNAME: 'wenio0509',
  
  // 後台管理員 API 金鑰
  ADMIN_SECRET_KEY: 'wenio_store_admin_secret_2026',
  
  // 幣別符號與代碼
  CURRENCY_SYMBOL: 'R$',
  CURRENCY_NAME: 'Robux',

  // Discord OAuth2 設定 (填入您的 Application ID)
  DISCORD_CLIENT_ID: '1559930197200081089',
  
  // 預設/備援商品清單 (確保任何網路狀況或伺服器重啟時，首頁皆能秒開且不破版)
  DEFAULT_PRODUCTS: [
    {
      id: "rivals-key-10",
      name: "武器造型箱鑰匙 x10",
      category: "鑰匙與箱子",
      price: 150,
      originalPrice: 200,
      rarity: "mythic",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "HOT 熱銷",
      description: "可用於開啟 Rivals 專屬武器箱，有極高機率開出神話/傳奇武器外觀！"
    },
    {
      id: "rivals-vip-pass",
      name: "RIVALS 尊爵 VIP 通行證",
      category: "通行證與特權",
      price: 450,
      originalPrice: 599,
      rarity: "legendary",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "特惠 75折",
      description: "解鎖專屬 VIP 聊天銘牌、每場對戰獲得 1.5 倍金幣與專屬黃金大廳資格。"
    },
    {
      id: "rivals-cyber-blade",
      name: "霓虹電漿近戰軍刀 (Neon Blade)",
      category: "限定武器造型",
      price: 800,
      originalPrice: 1000,
      rarity: "mythic",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "絕版限量",
      description: "揮砍帶有自訂光軌與擊殺特效，全伺服器極少數釋出的限量款冷兵器。"
    },
    {
      id: "rivals-sniper-gold",
      name: "黑金重裝狙擊槍 (Black Gold AWP)",
      category: "限定武器造型",
      price: 650,
      originalPrice: 750,
      rarity: "legendary",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "玩家首選",
      description: "槍身流動黑金消光質感，開鏡具備特製準心與獨立清脆槍聲。"
    },
    {
      id: "rivals-key-50",
      name: "大容量武器鑰匙包 x50",
      category: "鑰匙與箱子",
      price: 650,
      originalPrice: 900,
      rarity: "mythic",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "超值 72折",
      description: "一次抽到爽！適合大批量抽取全套神話造型與近戰特效箱。"
    },
    {
      id: "rivals-death-effect",
      name: "虛空碎裂．終結擊殺特效",
      category: "自訂特效",
      price: 320,
      originalPrice: 400,
      rarity: "epic",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "人氣單品",
      description: "擊敗敵人時產生黑色黑洞粒子並將其吸入虛空，全場焦點震撼全屏。"
    }
  ]
};

// 確保掛載至全域
window.CONFIG = CONFIG;
