# PDF to Flipbook Reader — Model E Style

এটি একটি mobile-friendly static web app। ব্যবহারকারী মোবাইল থেকে PDF upload করবে, এরপর PDF পেজগুলো virtual book/flipbook হিসেবে দেখা যাবে।

## ফাইলগুলো

- `index.html` — মূল অ্যাপ UI
- `style.css` — Model E reading focus ডিজাইন
- `script.js` — PDF upload, PDF.js rendering, page flip logic
- `manifest.json` — মোবাইলে installable PWA setup
- `sw.js` — basic offline shell cache
- `.nojekyll` — GitHub Pages-এ static files ঠিকভাবে serve করার জন্য
- `assets/` — app icon

## GitHub Pages-এ free deploy করার নিয়ম

1. GitHub-এ login করুন।
2. New Repository বানান। নাম দিন: `pdf-flipbook-reader`
3. এই ZIP unzip করুন।
4. সব ফাইল repository-তে upload করুন। `index.html` root folder-এ থাকতে হবে।
5. Commit changes দিন।
6. Repository → Settings → Pages এ যান।
7. Source: `Deploy from a branch` সিলেক্ট করুন।
8. Branch: `main`, Folder: `/root` সিলেক্ট করুন। Save করুন।
9. কিছুক্ষণ পর live link পাবেন।

## মোবাইলে অ্যাপের মতো ব্যবহার

Chrome দিয়ে live link খুলুন → menu ⋮ → Add to Home screen / Install app।

## গুরুত্বপূর্ণ নোট

- এই অ্যাপ PDF কোনো server-এ upload করে না। সব কাজ browser-এর ভিতরে হয়।
- বড় PDF হলে load হতে সময় লাগতে পারে। 80 MB-এর নিচে PDF ভালো চলে।
- প্রথমবার internet লাগবে কারণ PDF.js এবং PageFlip CDN থেকে load হয়। একবার load হলে app shell offline কাজ করতে পারে।
