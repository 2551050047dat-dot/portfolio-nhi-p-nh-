/*
 * TASK 3 - Quynh: Booking form / Contact form / Validation
 * Mục tiêu:
 * - Validate input, lưu dữ liệu và gửi thông tin đặt lịch đúng chuẩn.
 * - Dùng chung cho form booking và contact, nhưng booking có thêm date.
 *
 * NOTE HƯỚNG DẪN:
 * 1. Không làm gallery, home, pricing.
 * 2. Dùng selector #bookingForm, #contactForm.
 * 3. Validate tên >= 2, email regex, số điện thoại regex Việt Nam.
 * 4. Nếu form là booking thì bắt buộc có date.
 * 5. Lưu vào localStorage và đổi button text thành "Đã gửi".
 */

const bookingForms = document.querySelectorAll('#bookingForm, #contactForm');

const saveBookingRecord = (payload, formName) => {
  const existing = JSON.parse(localStorage.getItem('bookingRecords') || '[]');
  const record = {
    ...payload,
    formType: formName,
    createdAt: new Date().toISOString()
  };

  existing.push(record);
  localStorage.setItem('bookingRecords', JSON.stringify(existing));
};

bookingForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!payload.name || payload.name.trim().length < 2) {
      alert('Vui lòng nhập họ tên hợp lệ.');
      return;
    }

    if (!payload.email || !emailPattern.test(payload.email)) {
      alert('Email không hợp lệ.');
      return;
    }

    if (!payload.phone || !phonePattern.test(payload.phone)) {
      alert('Số điện thoại không hợp lệ.');
      return;
    }

    if (form.id === 'bookingForm' && !payload.date) {
      alert('Vui lòng chọn ngày cưới hoặc ngày chụp.');
      return;
    }

    saveBookingRecord(payload, form.id);
    form.reset();

    const button = form.querySelector('button[type="submit"]');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Đã gửi';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }

    alert('Thông tin của bạn đã được lưu thành công.');
  });
});

// TODO: Người 3 hoàn thiện UX form nếu cần thêm success toast, message box hoặc reset form đẹp hơn.
