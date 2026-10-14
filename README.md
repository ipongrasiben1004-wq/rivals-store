# ⚔️ ROBLOX RIVALS 商城網站 (Tactical Esports Storefront)

專為 **Roblox Rivals** 玩家與業主 `wenio0509` 量身打造的純前端靜態電競商城，零 AI 模板感，完美串接 Discord 機器人後端 API。

---

## 🌟 核心特色

1. **極致電競戰術美學 (Anti-AI Cliche)**：
   - 採用 **Roblox Rivals** 軍武俐落切角、消光炭黑、黃金高亮與稀有度光輝（Mythic 神話紅、Legendary 傳奇金、Epic 史詩紫、Rare 稀有藍）。
   - 內建 **Web Audio 電競戰術微音效**（點擊、加車、完成下單和弦音效，支援靜音切換）。
   - 支援手機／平板／電腦全響應式版面與骨架掃描載入動畫。

2. **Discord 顧客流動整合**：
   - **自動偵測來源**：顧客從 Discord 點擊連結進入網站時，自動彈出友善登入詢問框。
   - **一鍵登入**：支援真實 Discord 帳號授權，亦提供快速測試輸入。
   - **自動登出保障隱私**：顧客送出訂單後，網站**自動清除 Token 登出 Discord**！

3. **業主專屬後台面板 (wenio0509)**：
   - 登入身分為 `wenio0509`（或點擊快速業主登入）時，頂部導覽列自動解鎖 **👑 業主後台 (wenio0509)**。
   - 隨時**即時新增商品、刪除商品、修改售價、修改特價、上架/下架商品**。
   - 點擊「💾 儲存並同步至 Discord Bot」後，自動帶入 `x-admin-key: wenio_store_admin_secret_2026` 發送 `POST /api/products`。

4. **購物車與結帳**：
   - 支援填寫顧客的 **Roblox 使用者名稱**（便於業主核銷出貨）。
   - 送出訂單後發送 `POST /api/order` 到機器人。
   - 彈出精美成功提示：
     > 🎉 **【訂單已成功成立！】**  
     > 訂單編號：`#RV-xxxx`  
     > 應付金額：`xxx R$ (Robux)`  
     > 🤖 機器人已在 Discord 為您建立了**專屬私人交易頻道**！  
     > 請回到 Discord 頻道內，傳送您的 **Roblox 禮品卡序號 (PIN碼)** 或截圖，業主核銷入帳後將立即為您出貨！

---

## 🚀 如何發佈到 GitHub Pages（完全免費、免伺服器）

1. 在 GitHub 上建立一個新的公開儲存庫（Repository），例如命名為：`rivals-store`。
2. 將本資料夾（`商城購物網站`）內的所有檔案推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of roblox rivals store"
   git branch -M main
   git remote add origin https://github.com/你的帳號/rivals-store.git
   git push -u origin main
   ```
3. 進入 GitHub 儲存庫頁面，點擊 **Settings (設定)** ➔ 左側選單 **Pages**。
4. 在 **Branch** 選擇 `main`，資料夾選擇 `/ (root)`，點擊 **Save**。
5. 等待約 30 秒至 1 分鐘，GitHub 會給予你專屬網址：  
   `https://你的帳號.github.io/rivals-store/`
6. 將這個網址發布至 Discord 群組，顧客點進去就能立刻選購！

---

## ⚙️ 系統設定檔說明 (`js/config.js`)

| 設定變數 | 說明 | 目前設定值 |
| :--- | :--- | :--- |
| `API_BASE_URL` | 後端 Discord Bot API 基礎網址 | `https://scrguard0308-robuxsellersystem.hf.space` |
| `OWNER_DISCORD_USERNAME` | 業主 Discord 名稱 | `wenio0509` |
| `ADMIN_SECRET_KEY` | 業主後台金鑰 | `wenio_store_admin_secret_2026` |
| `CURRENCY_SYMBOL` | 計價貨幣符號 | `R$` (Robux) |

---

## 🛠️ 本地快速預覽測試

只要在 `商城購物網站` 目錄下執行：
```bash
python -m http.server 8088
```
然後在瀏覽器打開：`http://localhost:8088/index.html` 即可立即預覽！
