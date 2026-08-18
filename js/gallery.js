/* ==========================================================================
   Tessa Morgan — Wedding Photographer
   gallery.js : render Masonry từ data/gallery.json
   - portfolio.html   : filter Category + lưu trạng thái trên URL (?category=)
   - album-detail.html: lightbox (focus trap, bàn phím), slideshow toàn màn
                        hình & nút sao chép link album (Clipboard API)
   Yêu cầu js/main.js được nạp trước (dùng window.TM).
   ========================================================================== */

(function () {
  "use strict";

  var TM = window.TM;
  var VALID_CATEGORIES = ["Wedding", "Engagement", "Portrait"];

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("album-grid")) initPortfolioPage();
    if (document.getElementById("photo-grid")) initAlbumDetailPage();
  });

  /* Tạo 1 thẻ ảnh giữ chỗ đúng tỉ lệ (chống CLS): aspect-ratio inline */
  function frameStyle(width, height) {
    return "aspect-ratio: " + width + " / " + height + ";";
  }

  /* ==========================================================
     PHẦN 1 — TRANG PORTFOLIO (lưới album + filter + URL state)
     ========================================================== */
  function initPortfolioPage() {
    var grid = document.getElementById("album-grid");
    var emptyState = document.getElementById("album-empty");
    var filterBar = document.getElementById("category-filter");
    var albums = [];

    TM.fetchJSON("data/gallery.json")
      .then(function (data) {
        albums = data.albums || [];
        /* Đọc trạng thái lọc từ URL (?category=Wedding) → F5 không mất */
        var param = new URLSearchParams(window.location.search).get("category");
        var initial = VALID_CATEGORIES.indexOf(param) !== -1 ? param : "all";
        setActiveButton(initial);
        render(initial);
      })
      .catch(function (err) {
        grid.innerHTML = "<p class='empty-state'>Không tải được dữ liệu album. " + TM.escape(err.message) + "</p>";
      });

    /* Bấm nút lọc → render lại + cập nhật URL (history.replaceState) */
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var category = btn.dataset.category;
      setActiveButton(category);
      render(category);
      updateURL(category);
    });

    function setActiveButton(category) {
      filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
        var active = btn.dataset.category === category;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    function updateURL(category) {
      var url = new URL(window.location.href);
      if (category === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", category);
      window.history.replaceState(null, "", url);
    }

    function render(category) {
      var list = category === "all"
        ? albums
        : albums.filter(function (a) { return a.category === category; });

      emptyState.hidden = list.length > 0;

      grid.innerHTML = list
        .map(function (album) {
          return (
            '<div class="masonry-item">' +
              '<a class="album-card img-frame" style="' + frameStyle(album.coverWidth, album.coverHeight) + '"' +
                ' href="album-detail.html?album=' + encodeURIComponent(album.id) + '"' +
                ' aria-label="Xem album ' + TM.escape(album.title) + '">' +
                '<img src="' + TM.base + TM.escape(album.cover) + '" alt="' + TM.escape(album.title) + '"' +
                  ' width="' + album.coverWidth + '" height="' + album.coverHeight + '" loading="lazy" decoding="async">' +
                '<span class="album-info">' +
                  "<span>" + TM.escape(album.category) + " · " + album.images.length + " ảnh</span>" +
                  "<h3>" + TM.escape(album.title) + "</h3>" +
                "</span>" +
              "</a>" +
            "</div>"
          );
        })
        .join("");
    }
  }

  /* ==========================================================
     PHẦN 2 — TRANG ALBUM DETAIL
     ========================================================== */
  function initAlbumDetailPage() {
    var grid = document.getElementById("photo-grid");
    var notFound = document.getElementById("album-notfound");

    TM.fetchJSON("data/gallery.json")
      .then(function (data) {
        var id = new URLSearchParams(window.location.search).get("album");
        var albums = data.albums || [];
        var album =
          albums.filter(function (a) { return a.id === id; })[0] ||
          null;

        if (!album) {
          document.getElementById("album-title").textContent = "Không tìm thấy album";
          document.querySelector(".album-actions").hidden = true;
          notFound.hidden = false;
          return;
        }
        renderAlbum(album);
        initLightbox(album);
        initSlideshow(album);
        initCopyLink();
      })
      .catch(function (err) {
        grid.innerHTML = "<p class='empty-state'>Không tải được dữ liệu album. " + TM.escape(err.message) + "</p>";
      });

    function renderAlbum(album) {
      document.title = album.title + " | Tessa Morgan";
      document.getElementById("album-category").textContent = album.category;
      document.getElementById("album-title").textContent = album.title;
      document.getElementById("album-meta").textContent =
        album.location + " · " + TM.formatDate(album.date) + " · " + album.images.length + " ảnh";
      document.getElementById("album-description").textContent = album.description;

      grid.innerHTML = album.images
        .map(function (img, i) {
          return (
            '<div class="masonry-item">' +
              '<button type="button" class="tile-btn" data-index="' + i + '"' +
                ' aria-label="Phóng to: ' + TM.escape(img.alt) + '">' +
                '<span class="img-frame" style="display:block; ' + frameStyle(img.width, img.height) + '">' +
                  '<img src="' + TM.base + TM.escape(img.src) + '" alt="' + TM.escape(img.alt) + '"' +
                    ' width="' + img.width + '" height="' + img.height + '" loading="lazy" decoding="async">' +
                "</span>" +
              "</button>" +
            "</div>"
          );
        })
        .join("");
    }
  }

  /* ==========================================================
     PHẦN 3 — LIGHTBOX (modal phóng to ảnh)
     - Next/Prev bằng nút hoặc phím mũi tên, Esc để đóng
     - Focus trap trong modal, trả focus về đúng ảnh đã click
     ========================================================== */
  function initLightbox(album) {
    var modal = document.getElementById("lightbox");
    var imgEl = document.getElementById("lightbox-img");
    var counterEl = document.getElementById("lightbox-counter");
    var captionEl = document.getElementById("lightbox-caption-text");
    var btnPrev = document.getElementById("lightbox-prev");
    var btnNext = document.getElementById("lightbox-next");
    var btnClose = document.getElementById("lightbox-close");
    var grid = document.getElementById("photo-grid");

    var current = 0;
    var lastFocused = null; /* thẻ ảnh đã click — nơi trả focus khi đóng */

    grid.addEventListener("click", function (e) {
      var tile = e.target.closest(".tile-btn");
      if (!tile) return;
      lastFocused = tile;
      open(Number(tile.dataset.index));
    });

    function open(index) {
      show(index);
      modal.hidden = false;
      modal.classList.add("is-open");
      document.body.classList.add("no-scroll");
      btnClose.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function close() {
      modal.classList.remove("is-open");
      modal.hidden = true;
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKeydown);
      /* Accessibility: trả focus về đúng thẻ ảnh đã mở lightbox */
      if (lastFocused) lastFocused.focus();
    }

    function show(index) {
      var total = album.images.length;
      current = (index + total) % total; /* vòng tròn */
      var img = album.images[current];
      imgEl.src = TM.base + img.src;
      imgEl.alt = img.alt;
      imgEl.width = img.width;
      imgEl.height = img.height;
      counterEl.textContent = current + 1 + " / " + total;
      captionEl.textContent = img.alt;
    }

    function onKeydown(e) {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowLeft") return show(current - 1);
      if (e.key === "ArrowRight") return show(current + 1);
      if (e.key === "Tab") trapFocus(e);
    }

    /* Focus trap: Tab/Shift+Tab chỉ quay vòng trong 3 nút của modal */
    function trapFocus(e) {
      var focusables = [btnPrev, btnNext, btnClose];
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (focusables.indexOf(document.activeElement) === -1) {
        e.preventDefault();
        first.focus();
      }
    }

    btnPrev.addEventListener("click", function () { show(current - 1); });
    btnNext.addEventListener("click", function () { show(current + 1); });
    btnClose.addEventListener("click", close);
    /* Bấm vào nền tối bên ngoài ảnh → đóng */
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
  }

  /* ==========================================================
     PHẦN 4 — SLIDESHOW TOÀN MÀN HÌNH
     - Tự động chuyển ảnh mỗi 3.5s, hover để tạm dừng
     - Thoát bằng nút hoặc phím Esc
     ========================================================== */
  function initSlideshow(album) {
    var modal = document.getElementById("slideshow");
    var imgEl = document.getElementById("slideshow-img");
    var counterEl = document.getElementById("slideshow-counter");
    var statusEl = document.getElementById("slideshow-status");
    var btnOpen = document.getElementById("slideshow-open");
    var btnExit = document.getElementById("slideshow-exit");

    var INTERVAL = 3500;
    var current = 0;
    var timer = null;
    var paused = false;

    btnOpen.addEventListener("click", open);
    btnExit.addEventListener("click", close);

    /* Tạm dừng khi hover chuột lên ảnh */
    imgEl.addEventListener("mouseenter", function () { setPaused(true); });
    imgEl.addEventListener("mouseleave", function () { setPaused(false); });

    function open() {
      current = 0;
      show(current);
      modal.hidden = false;
      modal.classList.add("is-open");
      document.body.classList.add("no-scroll");
      btnExit.focus();
      document.addEventListener("keydown", onKeydown);
      /* Tôn trọng prefers-reduced-motion: không tự chuyển ảnh */
      if (!TM.reducedMotion) startTimer();
      else statusEl.textContent = "Tự chuyển ảnh đã tắt (reduced motion)";
    }

    function close() {
      stopTimer();
      modal.classList.remove("is-open");
      modal.hidden = true;
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKeydown);
      btnOpen.focus();
    }

    function onKeydown(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    }

    function show(index) {
      var total = album.images.length;
      current = (index + total) % total;
      var img = album.images[current];
      imgEl.src = TM.base + img.src;
      imgEl.alt = img.alt;
      counterEl.textContent = current + 1 + " / " + total;
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        if (!paused) show(current + 1);
      }, INTERVAL);
      statusEl.textContent = "Đang phát";
    }

    function stopTimer() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function setPaused(value) {
      paused = value;
      if (timer) statusEl.textContent = paused ? "Tạm dừng" : "Đang phát";
    }
  }

  /* ==========================================================
     PHẦN 5 — SAO CHÉP LINK ALBUM (Clipboard API + Toast)
     ========================================================== */
  function initCopyLink() {
    var btn = document.getElementById("copy-link");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var link = window.location.href;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(link)
          .then(function () {
            TM.toast("Đã sao chép link album!", "success");
          })
          .catch(function () {
            fallbackCopy(link);
          });
      } else {
        fallbackCopy(link);
      }
    });

    /* Fallback cho trình duyệt cũ / môi trường không có Clipboard API */
    function fallbackCopy(text) {
      var input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        TM.toast("Đã sao chép link album!", "success");
      } catch (e) {
        TM.toast("Không sao chép được — hãy copy thủ công từ thanh địa chỉ.");
      }
      document.body.removeChild(input);
    }
  }
})();
