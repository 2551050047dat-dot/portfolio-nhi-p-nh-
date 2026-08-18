/* ==========================================================================
   Tessa Morgan — Wedding Photographer
   faq.js : Accordion FAQ cho trang services.html
   - Mở/đóng mượt bằng CSS grid-template-rows transition
   - Mỗi lần chỉ mở một mục để trang gọn gàng
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var list = document.getElementById("faq-list");
    if (!list) return;

    list.addEventListener("click", function (e) {
      var question = e.target.closest(".faq-question");
      if (!question) return;

      var item = question.closest(".faq-item");
      var willOpen = !item.classList.contains("is-open");

      /* Đóng các mục đang mở (accordion: một mục mở tại một thời điểm) */
      list.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        openItem.classList.remove("is-open");
        openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
