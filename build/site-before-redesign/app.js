/* 高中地理电子教材 — 交互逻辑 */
(function () {
  "use strict";
  var BOOKS = window.BOOKS || [];

  // 扁平化所有章节节点，便于搜索与上下翻页
  var flat = [];
  BOOKS.forEach(function (bk) {
    bk.chapters.forEach(function (ch) {
      ch.sections.forEach(function (sec) {
        flat.push({ bk: bk, ch: ch, sec: sec });
      });
    });
  });

  var CN = ["零","一","二","三","四","五","六","七","八","九","十"];
  function cn(n) {
    if (n <= 10) return CN[n];
    if (n < 20) return "十" + CN[n - 10];
    if (n < 100) { var t = Math.floor(n/10), o = n%10; return CN[t]+"十"+(o?CN[o]:""); }
    return "" + n;
  }
  function displayTitle(ch, sec, idxInChapter) {
    if (sec.kind === "intro") return ch.num + " " + ch.title + "（本章导引）";
    if (sec.kind === "research") return sec.title.replace(/^问题研究[:：]\s*/, "问题研究　");
    if (sec.kind === "appendix") return sec.title;
    return "第" + cn(idxInChapter + 1) + "节　" + sec.name;
  }

  // ---- 侧边目录树 ----
  var treeEl = document.getElementById("tree");
  function buildTree() {
    var html = "";
    BOOKS.forEach(function (bk, bi) {
      html += '<div class="book" data-bk="' + bi + '">';
      html += '<div class="book-head"><span class="caret">▼</span>' + escapeHtml(bk.short) + "</div>";
      html += '<div class="chapters">';
      bk.chapters.forEach(function (ch, ci) {
        var chTitle = ch.num + " " + ch.title;
        html += '<div class="chapter" data-bk="' + bi + '" data-ch="' + ci + '">';
        html += '<div class="chapter-head"><span class="caret">▼</span>' + escapeHtml(chTitle) + "</div>";
        html += '<div class="sections">';
        ch.sections.forEach(function (sec, si) {
          html += '<a class="sec kind-' + (sec.kind || "section") + '" data-id="' + sec.id + '">'
                + escapeHtml(displayTitle(ch, sec, si)) + "</a>";
        });
        html += "</div></div>";
      });
      html += "</div></div>";
    });
    treeEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- 渲染文章 ----
  var contentEl = document.getElementById("content");
  function render(secId) {
    var item = flat.filter(function (x) { return x.sec.id === secId; })[0];
    if (!item) return;
    var bk = item.bk, ch = item.ch, sec = item.sec;
    var idx = ch.sections.indexOf(sec);
    var title = displayTitle(ch, sec, idx);

    // 正文：按行成段，去掉与标题重复的起始行
    var lines = sec.text.split("\n").filter(function (l) { return l.trim() !== ""; });
    if (lines[0] && /^第.+[章节]$/.test(lines[0].trim())) lines.shift();
    if (lines[0] && (lines[0].trim() === sec.name || lines[0].trim().indexOf("问题研究") === 0)) lines.shift();
    var bodyHtml = lines.map(function (l) {
      return "<p>" + escapeHtml(l) + "</p>";
    }).join("");

    var badge = "";
    if (sec.kind === "research") badge = '<span class="kind-badge research">问题研究</span>';
    else if (sec.kind === "appendix") badge = '<span class="kind-badge appendix">附录</span>';
    else if (sec.kind === "intro") badge = '<span class="kind-badge intro">导引</span>';

    var galleryHtml = "";
    if (sec.pages && sec.pages.length) {
      var figs = sec.pages.map(function (p, i) {
        var src = "assets/pages/" + p;
        var pno = p.match(/p(\d+)\.jpg$/);
        var cap = pno ? "原书页 " + pno[1] : "";
        return '<figure><img loading="lazy" src="' + src + '" alt="' + escapeHtml(title) + '" data-cap="' + cap + '"><figcaption>' + cap + "</figcaption></figure>";
      }).join("");
      galleryHtml =
        '<div class="gallery-toggle"><button id="gbtn">显示原书页面插图（' + sec.pages.length + " 页）</button>" +
        '<div class="gallery" id="gallery">' + figs + "</div></div>";
    }

    // 上下篇
    var pos = flat.indexOf(item);
    var prev = flat[pos - 1], next = flat[pos + 1];
    var pager =
      '<div class="pager">' +
      (prev ? '<a href="#' + prev.sec.id + '"><span class="lbl">← 上一篇</span><span class="ttl">' + escapeHtml(displayTitle(prev.ch, prev.sec, prev.ch.sections.indexOf(prev.sec))) + "</span></a>" : '<a class="disabled"></a>') +
      (next ? '<a href="#' + next.sec.id + '"><span class="lbl">下一篇 →</span><span class="ttl">' + escapeHtml(displayTitle(next.ch, next.sec, next.ch.sections.indexOf(next.sec))) + "</span></a>" : '<a class="disabled"></a>') +
      "</div>";

    var pageTag = sec.page ? '<span class="page-tag">教材页码 ' + sec.page + "</span>" : "";

    contentEl.innerHTML =
      '<article class="article">' +
      '<div class="crumb"><span class="b">' + escapeHtml(bk.short) + "</span> · " + escapeHtml(ch.num + " " + ch.title) + "</div>" +
      "<h1>" + escapeHtml(title) + badge + "</h1>" +
      pageTag +
      '<div class="body">' + bodyHtml + "</div>" +
      galleryHtml + pager +
      "</article>";

    // 高亮当前侧栏项
    Array.prototype.forEach.call(treeEl.querySelectorAll(".sec.active"), function (e) { e.classList.remove("active"); });
    var active = treeEl.querySelector('.sec[data-id="' + secId + '"]');
    if (active) {
      active.classList.add("active");
      // 展开所属章/册
      var chap = active.closest(".chapter"); if (chap) chap.classList.remove("collapsed");
      var book = active.closest(".book"); if (book) book.classList.remove("collapsed");
      active.scrollIntoView({ block: "nearest" });
    }
    // 画廊开关
    var gbtn = document.getElementById("gbtn");
    if (gbtn) gbtn.addEventListener("click", function () {
      var g = document.getElementById("gallery");
      g.classList.toggle("open");
      gbtn.textContent = g.classList.contains("open")
        ? "隐藏原书页面插图"
        : "显示原书页面插图（" + sec.pages.length + " 页）";
    });
    // 图片灯箱
    Array.prototype.forEach.call(contentEl.querySelectorAll(".gallery img"), function (img) {
      img.addEventListener("click", function () { openLightbox(img.src, img.getAttribute("data-cap")); });
    });
    contentEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ---- 灯箱 ----
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<img alt=""><div class="cap"></div>';
  document.body.appendChild(lb);
  function openLightbox(src, cap) {
    lb.querySelector("img").src = src;
    lb.querySelector(".cap").textContent = cap || "";
    lb.classList.add("open");
  }
  lb.addEventListener("click", function () { lb.classList.remove("open"); });

  // ---- 路由（hash） ----
  function onHash() {
    var id = location.hash.replace(/^#/, "");
    if (id && flat.some(function (x) { return x.sec.id === id; })) {
      var ph = document.getElementById("placeholder");
      if (ph) ph.style.display = "none";
      render(id);
    }
  }
  window.addEventListener("hashchange", onHash);

  // ---- 搜索 ----
  var searchEl = document.getElementById("search");
  var resultsEl = document.getElementById("searchResults");
  function doSearch(q) {
    q = q.trim();
    if (!q) { resultsEl.hidden = true; resultsEl.innerHTML = ""; return; }
    var ql = q.toLowerCase();
    var hits = [];
    flat.forEach(function (x) {
      var t = displayTitle(x.ch, x.sec, x.ch.sections.indexOf(x.sec));
      var inTitle = t.toLowerCase().indexOf(ql) >= 0;
      var inBody = x.sec.text.toLowerCase().indexOf(ql) >= 0;
      if (inTitle || inBody) {
        var snip = "";
        if (!inTitle && inBody) {
          var i = x.sec.text.toLowerCase().indexOf(ql);
          var s = Math.max(0, i - 18);
          snip = (s > 0 ? "…" : "") + x.sec.text.substr(s, 60).replace(/\n/g, " ") + "…";
        }
        hits.push({ id: x.sec.id, title: t, ch: x.ch.num + " " + x.ch.title, bk: x.bk.short, snip: snip, inTitle: inTitle });
      }
    });
    if (!hits.length) {
      resultsEl.innerHTML = '<div class="empty">未找到匹配内容</div>';
    } else {
      resultsEl.innerHTML = hits.slice(0, 30).map(function (h) {
        var title = h.inTitle ? highlight(h.title, q) : escapeHtml(h.title);
        var snip = h.snip ? '<div class="r-snippet">' + highlight(h.snip, q) + "</div>" : "";
        return '<div class="r-item" data-id="' + h.id + '">' +
          '<div class="r-title">' + title + "</div>" +
          '<div class="r-meta">' + escapeHtml(h.bk) + " · " + escapeHtml(h.ch) + "</div>" + snip + "</div>";
      }).join("");
    }
    resultsEl.hidden = false;
  }
  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, i)) + "<mark>" + escapeHtml(text.slice(i, i + q.length)) + "</mark>" + escapeHtml(text.slice(i + q.length));
  }
  searchEl.addEventListener("input", function () { doSearch(searchEl.value); });
  searchEl.addEventListener("keydown", function (e) { if (e.key === "Escape") { searchEl.value = ""; resultsEl.hidden = true; } });
  resultsEl.addEventListener("click", function (e) {
    var it = e.target.closest(".r-item");
    if (it) { location.hash = it.getAttribute("data-id"); resultsEl.hidden = true; searchEl.value = ""; }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) resultsEl.hidden = true;
  });

  // ---- 侧栏交互 ----
  treeEl.addEventListener("click", function (e) {
    var sec = e.target.closest(".sec");
    if (sec) { location.hash = sec.getAttribute("data-id"); closeSidebar(); return; }
    var bkHead = e.target.closest(".book-head");
    if (bkHead) { bkHead.parentElement.classList.toggle("collapsed"); return; }
    var chHead = e.target.closest(".chapter-head");
    if (chHead) { chHead.parentElement.classList.toggle("collapsed"); }
  });

  // ---- 移动端侧栏 ----
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  var menuBtn = document.getElementById("menuBtn");
  function openSidebar() { sidebar.classList.add("open"); scrim.classList.add("show"); }
  function closeSidebar() { sidebar.classList.remove("open"); scrim.classList.remove("show"); }
  menuBtn.addEventListener("click", openSidebar);
  scrim.addEventListener("click", closeSidebar);

  // ---- 初始化 ----
  buildTree();
  onHash();
  if (!location.hash) {
    // 默认展开第一册第一章
    var first = flat[0];
    if (first) { /* 不自动跳转，仅展示占位 */ }
  }
})();
