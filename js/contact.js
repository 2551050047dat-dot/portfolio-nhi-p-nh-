/* ==========================================================================
   Tessa Morgan — Wedding Photographer
   contact.js : auto-fill gói chụp từ ?package=... & inline validation
   Yêu cầu js/main.js được nạp trước (dùng window.TM).
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var fields = {
      name: document.getElementById("name"),
      email: document.getElementById("email"),
      package: document.getElementById("package"),
      message: document.getElementById("message"),
    };

    autofillPackage(fields.package);
    bindInlineValidation(fields);
    bindSubmit(form, fields);
  });

  /* ==========================================================
     1. Auto-fill gói chụp từ tham số URL ?package=...
     Ví dụ: contact.html?package=PHOTOGRAPHY%20PACKAGE%20399
     ========================================================== */
  function autofillPackage(select) {
    var param = new URLSearchParams(window.location.search).get("package");
    if (!param || !select) return;

    var wanted = normalize(param);
    var matched = false;

    Array.prototype.forEach.call(select.options, function (opt) {
      if (!matched && normalize(opt.value) === wanted) {
        select.value = opt.value;
        matched = true;
      }
    });

    if (matched) {
      window.TM.toast("Đã chọn sẵn gói: " + select.options[select.selectedIndex].text, "success");
      /* Nhấn nhá trực quan để người dùng thấy ô đã được điền */
      select.closest(".form-field").scrollIntoView({
        behavior: window.TM.reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }

  /* So khớp linh hoạt: bỏ khoảng trắng thừa, không phân biệt hoa thường */
  function normalize(str) {
    return String(str).replace(/\s+/g, " ").trim().toUpperCase();
  }

  /* ==========================================================
     2. Quy tắc kiểm tra từng trường
     Trả về chuỗi lỗi, hoặc "" nếu hợp lệ.
     ========================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var validators = {
    name: function (value) {
      if (!value.trim()) return "Vui lòng nhập tên của bạn.";
      if (value.trim().length < 2) return "Tên cần ít nhất 2 ký tự.";
      return "";
    },
    email: function (value) {
      if (!value.trim()) return "Vui lòng nhập địa chỉ email.";
      if (!EMAIL_RE.test(value.trim())) return "Email không đúng định dạng (ví dụ: ban@email.com).";
      return "";
    },
    package: function () {
      /* Gói chụp không bắt buộc — khách có thể cần tư vấn trước */
      return "";
    },
    message: function (value) {
      if (!value.trim()) return "Vui lòng nhập lời nhắn.";
      if (value.trim().length < 10) return "Lời nhắn cần ít nhất 10 ký tự để tôi hiểu nhu cầu của bạn.";
      return "";
    },
  };

  /* Hiển thị / xóa lỗi ngay dưới chân ô input */
  function showError(input, message) {
    var wrap = input.closest(".form-field");
    var errorEl = document.getElementById(input.id + "-error");
    wrap.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(input) {
    var check = validators[input.name] || function () { return ""; };
    var message = check(input.value);
    showError(input, message);
    return !message;
  }

  /* ==========================================================
     3. Inline validation: kiểm tra khi blur,
        và kiểm tra lại theo thời gian thực khi đang có lỗi.
     ========================================================== */
  function bindInlineValidation(fields) {
    Object.keys(fields).forEach(function (key) {
      var input = fields[key];
      if (!input) return;

      input.addEventListener("blur", function () {
        validateField(input);
      });

      input.addEventListener("input", function () {
        /* Chỉ re-validate khi trường đang báo lỗi → tránh làm phiền khi gõ */
        if (input.closest(".form-field").classList.contains("has-error")) {
          validateField(input);
        }
      });
    });
  }

  /* ==========================================================
     4. Submit: chặn gửi nếu còn lỗi, focus vào lỗi đầu tiên,
        thành công thì hiện toast & reset form.
     ========================================================== */
  function bindSubmit(form, fields) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        var input = fields[key];
        if (input && !validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        window.TM.toast("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
        return;
      }

      /* Demo tĩnh: không có backend — mô phỏng gửi thành công */
      window.TM.toast("Cảm ơn bạn! Yêu cầu đã được gửi — Tessa sẽ phản hồi trong 24 giờ.", "success");
      form.reset();
      Object.keys(fields).forEach(function (key) {
        if (fields[key]) showError(fields[key], "");
      });
    });
  }
})();
