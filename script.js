/* PDF to Flipbook Reader - Model E Reading Focus */

const pdfInput = document.getElementById("pdfInput");
const drawerPdfInput = document.getElementById("drawerPdfInput");
const uploadPanel = document.getElementById("uploadPanel");
const loadingPanel = document.getElementById("loadingPanel");
const reader = document.getElementById("reader");
const bookElement = document.getElementById("book");
const bookScale = document.getElementById("bookScale");
const bookStage = document.getElementById("bookStage");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const currentPageEl = document.getElementById("currentPage");
const totalPagesEl = document.getElementById("totalPages");
const bookTitle = document.getElementById("bookTitle");
const toast = document.getElementById("toast");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const firstBtn = document.getElementById("firstBtn");
const lastBtn = document.getElementById("lastBtn");
const nextSideBtn = document.getElementById("nextSideBtn");
const prevSideBtn = document.getElementById("prevSideBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenDockBtn = document.getElementById("fullscreenDockBtn");
const resetBtn = document.getElementById("resetBtn");
const nightBtn = document.getElementById("nightBtn");
const zoomRange = document.getElementById("zoomRange");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");

let pageFlip = null;
let renderedPages = 0;
let totalPages = 0;
let currentZoom = 100;
let isRendering = false;

// PDF.js worker
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2800);
}

function setScreen(screenName) {
  uploadPanel.classList.toggle("hidden", screenName !== "upload");
  loadingPanel.classList.toggle("hidden", screenName !== "loading");
  reader.classList.toggle("hidden", screenName !== "reader");
}

function updateProgress(done, total, label = "Rendering pages") {
  const percent = total ? Math.round((done / total) * 100) : 0;
  progressText.textContent = `${label}: ${done}/${total}`;
  progressBar.style.width = `${percent}%`;
}

function updatePageInfo(pageIndex = 0) {
  const current = Math.min(pageIndex + 1, totalPages || 0);
  currentPageEl.textContent = current;
  totalPagesEl.textContent = totalPages;
}

function safeFileName(name) {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "My Book";
}

async function handleFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showToast("Please upload a valid PDF file.");
    return;
  }

  if (!window.pdfjsLib || !window.St) {
    showToast("Required libraries did not load. Check internet connection once.");
    return;
  }

  if (isRendering) {
    showToast("A PDF is already being prepared.");
    return;
  }

  try {
    isRendering = true;
    setScreen("loading");
    progressBar.style.width = "0%";
    progressText.textContent = "Reading PDF...";
    bookTitle.textContent = safeFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    totalPages = pdf.numPages;
    renderedPages = 0;

    if (pageFlip) {
      try { pageFlip.destroy(); } catch (error) { console.warn(error); }
      pageFlip = null;
    }

    bookElement.innerHTML = "";

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const imageUrl = await renderPdfPageToImage(page);
      const pageDiv = createBookPage(imageUrl, pageNumber);
      bookElement.appendChild(pageDiv);
      renderedPages++;
      updateProgress(renderedPages, totalPages);
      await nextFrame();
    }

    // If pages are odd, add a clean blank ending page.
    if (totalPages % 2 !== 0) {
      const blank = document.createElement("div");
      blank.className = "page";
      blank.innerHTML = '<div class="blank-page">End of Book</div>';
      bookElement.appendChild(blank);
    }

    createFlipbook();
    setScreen("reader");
    updatePageInfo(0);
    showToast("Book is ready. Tap left/right side to turn pages.");
  } catch (error) {
    console.error(error);
    setScreen("upload");
    showToast("Could not open this PDF. Try another file.");
  } finally {
    isRendering = false;
  }
}

async function renderPdfPageToImage(page) {
  const baseViewport = page.getViewport({ scale: 1 });
  const targetWidth = Math.min(1100, Math.max(760, window.innerWidth * 1.8));
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.92);
}

function createBookPage(imageUrl, pageNumber) {
  const pageDiv = document.createElement("div");
  pageDiv.className = "page";
  pageDiv.dataset.pageNumber = pageNumber;

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = `PDF page ${pageNumber}`;
  img.loading = "eager";

  pageDiv.appendChild(img);
  return pageDiv;
}

function createFlipbook() {
  const pageNodes = bookElement.querySelectorAll(".page");

  pageFlip = new St.PageFlip(bookElement, {
    width: 430,
    height: 610,
    size: "stretch",
    minWidth: 280,
    maxWidth: 960,
    minHeight: 400,
    maxHeight: 1320,
    maxShadowOpacity: 0.45,
    showCover: false,
    mobileScrollSupport: false,
    usePortrait: true,
    flippingTime: 700,
    drawShadow: true,
    startPage: 0,
    autoSize: true,
  });

  pageFlip.loadFromHTML(pageNodes);

  pageFlip.on("flip", (event) => {
    updatePageInfo(event.data);
  });
}

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

function goNext() {
  if (pageFlip) pageFlip.flipNext();
}

function goPrev() {
  if (pageFlip) pageFlip.flipPrev();
}

function goFirst() {
  if (pageFlip) pageFlip.flip(0);
}

function goLast() {
  if (pageFlip && totalPages > 0) pageFlip.flip(totalPages - 1);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function setZoom(value) {
  currentZoom = Math.min(140, Math.max(80, value));
  zoomRange.value = currentZoom;
  document.documentElement.style.setProperty("--book-zoom", currentZoom / 100);
}

pdfInput.addEventListener("change", e => handleFile(e.target.files[0]));
drawerPdfInput.addEventListener("change", e => {
  drawer.classList.remove("open");
  handleFile(e.target.files[0]);
});

nextBtn.addEventListener("click", goNext);
nextSideBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
prevSideBtn.addEventListener("click", goPrev);
firstBtn.addEventListener("click", goFirst);
lastBtn.addEventListener("click", goLast);
resetBtn.addEventListener("click", () => {
  drawer.classList.remove("open");
  goFirst();
});
fullscreenBtn.addEventListener("click", toggleFullscreen);
fullscreenDockBtn.addEventListener("click", toggleFullscreen);
nightBtn.addEventListener("click", () => document.body.classList.toggle("night"));
zoomRange.addEventListener("input", e => setZoom(Number(e.target.value)));
zoomInBtn.addEventListener("click", () => setZoom(currentZoom + 10));
zoomOutBtn.addEventListener("click", () => setZoom(currentZoom - 10));
menuBtn.addEventListener("click", () => drawer.classList.add("open"));
closeDrawer.addEventListener("click", () => drawer.classList.remove("open"));
drawer.addEventListener("click", e => {
  if (e.target === drawer) drawer.classList.remove("open");
});

// Tap zones: right side = next, left side = previous.
bookStage.addEventListener("click", e => {
  if (!pageFlip) return;
  if (e.target.closest("button") || e.target.closest("input")) return;
  const rect = bookStage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if (x > rect.width * 0.62) goNext();
  if (x < rect.width * 0.38) goPrev();
});

// Keyboard support for desktop testing.
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key.toLowerCase() === "f") toggleFullscreen();
});

// Register Service Worker for PWA install/offline shell.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(console.warn);
  });
}
