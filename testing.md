# Testing - Lighthouse report

Nguồn báo cáo: `d:\ie213\localhost_2026-04-27_18-15-31.json` (Lighthouse 13.0.2)  
URL test: `http://localhost:5173/`  
Thời gian chạy: `2026-04-27T11:15:31.028Z`

## 1) Kết quả tổng quan

| Hạng mục | Score |
|---|---:|
| Performance | 0.62 |
| Accessibility | 0.92 |
| Best Practices | 1.00 |
| SEO | 0.83 |

### Metrics chính (Performance)

- FCP: 2.5s
- LCP: 4.9s
- Speed Index: 2.6s
- TBT: 0ms
- CLS: 0

## 2) Vấn đề chính được Lighthouse chỉ ra

### 2.1 LCP image không “discoverable” từ HTML ban đầu

- Insight: `lcp-discovery-insight` (score 0)
- LCP element:
  - Selector: `section.hero-container > div.slideshow > picture > img.slide`
  - Image: `/images/S680-img3-1600.avif`
- Checklist từ report:
  - `fetchpriority=high should be applied`: false
  - `Request is discoverable in initial document`: false
  - `lazy load not applied`: true

### 2.2 SEO thiếu meta description và robots.txt

- Audit: `meta-description` = 0
- Audit: `robots-txt` = 0

## 3) Tối ưu đã thực hiện (trong code)

### 3.1 Preload + ưu tiên tải LCP image

- Thêm `<link rel="preload" as="image" ... fetchpriority="high">` cho ảnh slideshow đầu tiên:
  - [index.html](file:///d:/ie213/frontend/car-sales-web/index.html)
- Thêm `fetchPriority="high"` cho `<img>` slide đầu tiên:
  - [SlideShow.jsx](file:///d:/ie213/frontend/car-sales-web/src/pages/Home/SlideShow/SlideShow.jsx)

### 3.2 Cải thiện SEO cơ bản

- Thêm `<meta name="description" ...>` + cập nhật `<title>`:
  - [index.html](file:///d:/ie213/frontend/car-sales-web/index.html)
- Thêm `robots.txt`:
  - [robots.txt](file:///d:/ie213/frontend/car-sales-web/public/robots.txt)

## 4) Cách chạy lại Lighthouse để đối chiếu

Khuyến nghị chạy Lighthouse trên bản build production:

1) `cd frontend/car-sales-web`
2) `npm run build`
3) `npm run preview` (thường mở ở `http://localhost:4173/`)
4) Chạy Lighthouse lại trên URL preview.

