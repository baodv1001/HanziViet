# HanziViet – Tra từ vựng HSK 2 & thứ tự nét chữ

Bản clone (React + Vite) lấy cảm hứng từ trang từ vựng của xiehanzi.com.

- Tìm chữ Hán bằng **pinyin không dấu** (`shenti`, `shen ti`, `shen1ti3`), chữ Hán hoặc nghĩa Việt. Pinyin luôn hiển thị **màu đỏ**.
- Trang từ: pinyin đỏ, chữ Hán lớn, nghĩa Việt, âm Hán Việt, số nét, thanh điệu, nút nghe (Web Speech API).
- **Thứ tự viết nét tự chạy** khi mở trang, viết lần lượt từng chữ rồi lặp lại; có chế độ Luyện tập (tự viết bằng chuột/cảm ứng).
- Dữ liệu nét chữ được tải sẵn vào `public/strokes/` nên site tĩnh hoàn toàn, không phụ thuộc CDN khi chạy.

## Cấu trúc

```
hanzi-clone/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json            # SPA rewrite cho Vercel
├── public/
│   ├── _redirects         # SPA rewrite cho Netlify
│   └── strokes/           # dữ liệu nét chữ (<codepoint hex>.json), sinh bởi scripts/fetch-strokes.mjs
├── scripts/
│   └── fetch-strokes.mjs  # tải dữ liệu nét cho mọi chữ trong bộ từ vựng
└── src/
    ├── main.jsx           # entry, BrowserRouter
    ├── App.jsx            # routes: /  và  /tu-vung/:hanzi
    ├── data/hsk2.js       # từ vựng HSK 2 (hanzi, pinyin, pos, vi, hv, ex)
    ├── lib/
    │   ├── pinyin.js      # bỏ dấu, tách âm tiết, thanh điệu
    │   ├── strokes.js     # nạp dữ liệu nét (cache) + charDataLoader cho HanziWriter
    │   ├── speech.js      # phát âm zh-CN
    │   └── routes.js      # helper đường dẫn
    ├── hooks/
    │   ├── useSearch.js   # chỉ mục + hàm tìm kiếm
    │   └── useCharData.js
    ├── components/
    │   ├── Header.jsx, Footer.jsx
    │   ├── SearchBar.jsx  # ô tìm + gợi ý, điều hướng bằng phím
    │   ├── WordList.jsx   # lưới kết quả
    │   ├── WordHero.jsx   # thẻ đầu trang từ
    │   ├── StrokeOrder.jsx# animation nét tự chạy + luyện tập
    │   ├── CharInfo.jsx   # từng chữ trong từ
    │   └── Examples.jsx   # câu ví dụ
    ├── pages/
    │   ├── HomePage.jsx
    │   └── WordPage.jsx
    └── styles/global.css
```

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Thêm từ vựng

1. Thêm mục vào `src/data/hsk2.js` (hoặc tạo `hsk3.js` cùng cấu trúc và gộp lại trong `useSearch.js`).
2. Chạy `npm run fetch-strokes` để tải dữ liệu nét cho các chữ mới.

## Deploy

```bash
npm run build      # kết quả trong dist/
```

- **Vercel**: `vercel --prod` hoặc import repo, framework "Vite" – `vercel.json` đã cấu hình rewrite.
- **Netlify**: build `npm run build`, publish `dist` – `public/_redirects` đã cấu hình.
- **GitHub Pages**: đặt `base: '/<ten-repo>/'` trong `vite.config.js` rồi deploy thư mục `dist` (nên dùng HashRouter hoặc thêm 404.html copy từ index.html).
