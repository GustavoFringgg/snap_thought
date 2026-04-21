# Snop Thought — Project Guide for Backend Agent

## 專案概述

**Snop Thought** 是一個工作週學習筆記工具，使用者每天可以記錄學到的技術筆記，並在下班後複習。

- **前端**：Vue 3 + Vite + TypeScript（已完成）
- **後端**：Python FastAPI（待開發）
- **資料庫**：MongoDB（待開發）

---

## 前端目前狀態

前端所有資料儲存在 **記憶體**（`reactive` 物件），頁面重整後資料消失。
後端接上後，前端會改成呼叫 REST API，取代現有的記憶體操作。

### 前端專案結構

```
frontend/
├── src/
│   ├── main.ts
│   ├── style.css
│   ├── App.vue              # 根元件，管理週選擇 + notes 狀態
│   ├── types/
│   │   └── index.ts         # TypeScript 型別定義
│   └── components/
│       ├── AppNavbar.vue    # 頂部導覽列（星期一～五 Tab）
│       ├── DayCard.vue      # 每日格子（textarea 輸入 + 筆記列表）
│       ├── NoteItem.vue     # 單筆筆記（截斷顯示、展開、刪除）
│       └── NoteModal.vue    # 點開展開的 Dialog（顯示完整筆記）
```

---

## TypeScript 型別定義

```typescript
// src/types/index.ts

export interface Note {
  id: string          // UUID 或 MongoDB ObjectId 字串
  content: string     // 筆記內容（可包含 code、多行文字）
  createdAt: string   // ISO 8601 格式，e.g. "2026-03-27T14:30:00.000Z"
}

export interface DayData {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri'  // 星期幾的識別鍵
  label: string       // 顯示用中文，e.g. "星期一"
  shortLabel: string  // 手機版縮寫，e.g. "一"
  colorVar: string    // CSS 變數名稱，e.g. "--color-monday"（前端專用，後端不需儲存）
  notes: Note[]       // 該天的筆記列表
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
```

---

## 資料結構說明

### 核心概念：筆記以「週 + 天」為單位

每一筆筆記屬於：
- 某一**年份**（e.g. 2026）
- 某一**週**（以 ISO 週次或該年的第幾個工作週為識別）
- 某一**天**（`mon` / `tue` / `wed` / `thu` / `fri`）

前端目前用的 key 格式：`${year}/${weekIndex}/${dayKey}`
例如：`2026/12/mon`

> 後端建議改用 ISO 週次（`isoWeek`），更標準。

---

## 建議的 MongoDB Schema

### Collection：`notes`

```json
{
  "_id": "ObjectId",
  "year": 2026,
  "isoWeek": 13,
  "dayKey": "mon",
  "content": "pd.read_csv('路徑') 是透過 pandas 讀取 CSV",
  "createdAt": "2026-03-27T14:30:00.000Z",
  "updatedAt": "2026-03-27T14:30:00.000Z"
}
```

**索引建議：**
```js
db.notes.createIndex({ year: 1, isoWeek: 1, dayKey: 1 })
```

---

## 建議的 REST API 端點

Base URL：`/api/v1`

### 取得某週的所有筆記

```
GET /api/v1/notes?year=2026&week=13
```

**Response（200）：**
```json
{
  "year": 2026,
  "week": 13,
  "days": {
    "mon": [
      {
        "id": "abc123",
        "content": "pd.read_csv('路徑') 是透過 pandas 讀取 CSV",
        "createdAt": "2026-03-27T14:30:00.000Z"
      }
    ],
    "tue": [],
    "wed": [],
    "thu": [],
    "fri": []
  }
}
```

---

### 新增筆記

```
POST /api/v1/notes
```

**Request Body：**
```json
{
  "year": 2026,
  "week": 13,
  "dayKey": "mon",
  "content": "pd.read_csv('路徑') 是透過 pandas 讀取 CSV"
}
```

**Response（201）：**
```json
{
  "id": "abc123",
  "content": "pd.read_csv('路徑') 是透過 pandas 讀取 CSV",
  "createdAt": "2026-03-27T14:30:00.000Z"
}
```

---

### 刪除筆記

```
DELETE /api/v1/notes/{note_id}
```

**Response（204）：** 無 body

---

### （選用）更新筆記內容

```
PATCH /api/v1/notes/{note_id}
```

**Request Body：**
```json
{
  "content": "更新後的筆記內容"
}
```

**Response（200）：**
```json
{
  "id": "abc123",
  "content": "更新後的筆記內容",
  "createdAt": "2026-03-27T14:30:00.000Z",
  "updatedAt": "2026-03-28T09:00:00.000Z"
}
```

---

## 前端對接時需修改的地方

當後端完成後，前端的改動集中在 `src/App.vue`：

### 1. 取代 `handleAddNote`

```typescript
// 現在（記憶體）
function handleAddNote(dayKey: DayKey, content: string) {
  const key = noteKey(selectedYear.value, selectedWeekIndex.value, dayKey)
  notesStore[key] = [...(notesStore[key] ?? []), { id: ..., content, createdAt: ... }]
}

// 改成（API）
async function handleAddNote(dayKey: DayKey, content: string) {
  const res = await fetch('/api/v1/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year: selectedYear.value, week: selectedIsoWeek.value, dayKey, content }),
  })
  const note = await res.json()
  notesStore[noteKey(selectedYear.value, selectedWeekIndex.value, dayKey)] = [
    ...(notesStore[...] ?? []),
    note,
  ]
}
```

### 2. 取代 `handleDeleteNote`

```typescript
// 改成（API）
async function handleDeleteNote(dayKey: DayKey, noteId: string) {
  await fetch(`/api/v1/notes/${noteId}`, { method: 'DELETE' })
  // 更新本地 store...
}
```

### 3. 週切換時 fetch 資料

```typescript
watch([selectedYear, selectedWeekIndex], async () => {
  const res = await fetch(`/api/v1/notes?year=${selectedYear.value}&week=${isoWeek.value}`)
  const data = await res.json()
  // 更新 notesStore...
})
```

---

## 注意事項

1. **週的計算方式**：前端目前用「該年第幾個 Monday 起算」的 index，後端建議改用 **ISO 8601 週次**（`isoWeek`），對齊標準。前端對接時會同步調整。

2. **`dayKey` 對應**：
   | dayKey | 星期 |
   |--------|------|
   | `mon`  | 星期一 |
   | `tue`  | 星期二 |
   | `wed`  | 星期三 |
   | `thu`  | 星期四 |
   | `fri`  | 星期五 |

3. **`colorVar` 欄位**：這是前端純 CSS 用的（`--color-monday` 等），**後端不需要儲存**。

4. **`id` 欄位**：後端回傳 MongoDB 的 `_id`（轉成字串），前端直接用這個值，不自己產生 ID。

5. **CORS**：FastAPI 需要開啟 CORS，允許前端 `http://localhost:5173` 存取（開發環境）。

---

## 開發環境

```bash
# 前端啟動
cd frontend
npm run dev
# → http://localhost:5173

# 後端啟動（建議）
cd backend
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

**Vite Proxy 設定（前端開發用）：**
在 `frontend/vite.config.ts` 加入：
```typescript
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```
