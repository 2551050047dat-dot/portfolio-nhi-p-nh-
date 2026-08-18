/* ==========================================================================
   Tessa Morgan — Wedding Photographer
   blog.js : render blog từ data/blog.json
   - blog.html        : live-search theo từ khóa, lọc chủ đề & phân trang
   - blog-detail.html : render nội dung bài viết từ ?post=...
   Yêu cầu js/main.js được nạp trước (dùng window.TM).
   ========================================================================== */

(function () {
  "use strict";

  var TM = window.TM;
  var PAGE_SIZE = 6; /* số bài mỗi trang */

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("post-grid")) initBlogListPage();
    if (document.getElementById("article")) initBlogDetailPage();
  });

  /* Card bài viết dùng chung cho danh sách & mục liên quan */
  function postCard(post) {
    return (
      '<article class="card">' +
        '<a href="blog-detail.html?post=' + encodeURIComponent(post.id) + '"' +
          ' aria-label="Đọc bài: ' + TM.escape(post.title) + '">' +
          '<div class="img-frame" style="aspect-ratio: 3 / 2;">' +
            '<img src="' + TM.base + TM.escape(post.cover) + '" alt="' + TM.escape(post.title) + '"' +
              ' width="' + post.coverWidth + '" height="' + post.coverHeight + '" loading="lazy" decoding="async">' +
          "</div>" +
        "</a>" +
        '<div class="card-body">' +
          '<span class="card-meta">' + TM.escape(post.category) + " · " + TM.formatDate(post.date) + "</span>" +
          '<h3><a href="blog-detail.html?post=' + encodeURIComponent(post.id) + '">' + TM.escape(post.title) + "</a></h3>" +
          "<p>" + TM.escape(post.excerpt) + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  /* ==========================================================
     PHẦN 1 — DANH SÁCH BLOG (search + filter + pagination)
     ========================================================== */
  function initBlogListPage() {
    var grid = document.getElementById("post-grid");
    var emptyState = document.getElementById("blog-empty");
    var filterBar = document.getElementById("blog-filter");
    var searchInput = document.getElementById("blog-search");
    var paginationEl = document.getElementById("blog-pagination");

    var posts = [];
    var state = { category: "all", query: "", page: 1 };

    TM.fetchJSON("data/blog.json")
      .then(function (data) {
        posts = data.posts || [];
        renderFilterButtons(data.categories || []);
        render();
      })
      .catch(function (err) {
        grid.innerHTML = "<p class='empty-state'>Không tải được dữ liệu blog. " + TM.escape(err.message) + "</p>";
      });

    /* --- Nút lọc chủ đề (render động từ JSON) --- */
    function renderFilterButtons(categories) {
      var buttons = ['<button type="button" class="filter-btn is-active" data-category="all" aria-pressed="true">Tất cả</button>'];
      categories.forEach(function (cat) {
        buttons.push(
          '<button type="button" class="filter-btn" data-category="' + TM.escape(cat) + '" aria-pressed="false">' +
            TM.escape(cat) +
          "</button>"
        );
      });
      filterBar.innerHTML = buttons.join("");

      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        state.category = btn.dataset.category;
        state.page = 1;
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        render();
      });
    }

    /* --- Live search: lọc ngay khi gõ (debounce nhẹ) --- */
    var searchTimer = null;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.query = searchInput.value.trim().toLowerCase();
        state.page = 1;
        render();
      }, 200);
    });

    /* --- Áp bộ lọc: chủ đề + từ khóa (tiêu đề, mô tả, keywords) --- */
    function filteredPosts() {
      return posts.filter(function (post) {
        if (state.category !== "all" && post.category !== state.category) return false;
        if (!state.query) return true;
        var haystack = (
          post.title + " " + post.excerpt + " " + post.category + " " + (post.keywords || []).join(" ")
        ).toLowerCase();
        return haystack.indexOf(state.query) !== -1;
      });
    }

    function render() {
      var list = filteredPosts();
      var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;

      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = list.slice(start, start + PAGE_SIZE);

      emptyState.hidden = list.length > 0;
      grid.innerHTML = pageItems.map(postCard).join("");
      renderPagination(list.length, totalPages);
    }

    /* --- Phân trang: Trước / số trang / Sau --- */
    function renderPagination(totalItems, totalPages) {
      if (totalItems <= PAGE_SIZE) {
        paginationEl.innerHTML = "";
        return;
      }

      var html = [
        '<button type="button" class="page-btn" data-page="prev" aria-label="Trang trước"' +
          (state.page === 1 ? " disabled" : "") + ">&laquo;</button>",
      ];
      for (var i = 1; i <= totalPages; i++) {
        html.push(
          '<button type="button" class="page-btn' + (i === state.page ? " is-active" : "") + '"' +
            ' data-page="' + i + '"' +
            (i === state.page ? ' aria-current="page"' : "") + ">" + i + "</button>"
        );
      }
      html.push(
        '<button type="button" class="page-btn" data-page="next" aria-label="Trang sau"' +
          (state.page === totalPages ? " disabled" : "") + ">&raquo;</button>"
      );
      paginationEl.innerHTML = html.join("");
    }

    paginationEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".page-btn");
      if (!btn || btn.disabled) return;
      var value = btn.dataset.page;
      if (value === "prev") state.page -= 1;
      else if (value === "next") state.page += 1;
      else state.page = Number(value);
      render();
      /* Cuộn về đầu danh sách sau khi đổi trang */
      grid.scrollIntoView({ behavior: TM.reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  /* ==========================================================
     PHẦN 2 — CHI TIẾT BÀI VIẾT (?post=...)
     ========================================================== */
  function initBlogDetailPage() {
    var article = document.getElementById("article");
    var notFound = document.getElementById("post-notfound");

    TM.fetchJSON("data/blog.json")
      .then(function (data) {
        var id = new URLSearchParams(window.location.search).get("post");
        var posts = data.posts || [];
        var post = posts.filter(function (p) { return p.id === id; })[0] || null;

        if (!post) {
          article.hidden = true;
          notFound.hidden = false;
          return;
        }
        renderPost(post);
        renderRelated(posts, post);
      })
      .catch(function (err) {
        article.innerHTML = "<p class='empty-state'>Không tải được bài viết. " + TM.escape(err.message) + "</p>";
      });

    function renderPost(post) {
      document.title = post.title + " | Tessa Morgan";
      document.getElementById("article-meta").innerHTML =
        "<span>" + TM.escape(post.category) + "</span>" +
        "<span>" + TM.formatDate(post.date) + "</span>" +
        "<span>" + TM.escape(post.author) + "</span>" +
        "<span>" + post.readTime + " phút đọc</span>";
      document.getElementById("article-title").textContent = post.title;

      /* Ảnh cover: đặt aspect-ratio + width/height trước khi tải → CLS = 0 */
      var frame = document.getElementById("article-cover-frame");
      var cover = document.getElementById("article-cover");
      frame.style.aspectRatio = post.coverWidth + " / " + post.coverHeight;
      cover.src = TM.base + post.cover;
      cover.alt = post.title;
      cover.width = post.coverWidth;
      cover.height = post.coverHeight;
      frame.hidden = false;

      document.getElementById("article-body").innerHTML = post.content
        .map(function (paragraph) { return "<p>" + TM.escape(paragraph) + "</p>"; })
        .join("");

      document.getElementById("article-keywords").innerHTML = (post.keywords || [])
        .map(function (kw) { return "<span>#" + TM.escape(kw) + "</span>"; })
        .join("");
    }

    /* Ưu tiên bài cùng chủ đề, thiếu thì bù bài mới nhất */
    function renderRelated(posts, current) {
      var related = posts
        .filter(function (p) { return p.id !== current.id && p.category === current.category; })
        .slice(0, 3);
      if (related.length < 3) {
        posts.forEach(function (p) {
          if (related.length >= 3) return;
          if (p.id !== current.id && related.indexOf(p) === -1) related.push(p);
        });
      }
      if (!related.length) return;
      document.getElementById("related-grid").innerHTML = related.map(postCard).join("");
      document.getElementById("related-section").hidden = false;
    }
  }
})();
