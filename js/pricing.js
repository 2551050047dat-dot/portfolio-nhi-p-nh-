/*
 * TASK 3 - Quynh: Pricing / Calculator / Form logic
 * Mục tiêu:
 * - Cho user tính tiền gói chụp dựa trên addon và base package.
 * - Giữ layout rõ, premium nhưng dễ hiểu.
 *
 * NOTE HƯỚNG DẪN:
 * 1. Chỉ làm phần pricing + form logic.
 * 2. pricingForm phải có data-base-price và checkbox name="addon".
 * 3. Tổng tiền format VND bằng Intl.NumberFormat.
 * 4. Không làm nhầm với gallery hoặc nav.
 * 5. Bảng giá gói phải hiển thị rõ ưu điểm của từng gói.
 * 6. Đạt chỉ giữ vai trò leader, không gánh phần tính toán và logic chính.
 */

const pricingForm = document.getElementById('pricingForm');
const pricingOptions = {
  album: 2500000,
  drone: 3500000,
  bridal: 4200000,
  print: 1800000
};

if (pricingForm) {
  const totalElement = document.getElementById('totalPrice');
  const basePrice = Number(pricingForm.dataset.basePrice || 12000000);

  const updatePricing = () => {
    let total = basePrice;

    pricingForm.querySelectorAll('input[name="addon"]').forEach((checkbox) => {
      if (checkbox.checked) {
        total += Number(pricingOptions[checkbox.value] || 0);
      }
    });

    if (totalElement) {
      totalElement.textContent = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(total);
    }
  };

  pricingForm.addEventListener('change', updatePricing);
  updatePricing();
}

// TODO: Người 3 viết tiếp phần toggle comparison table hoặc animation nếu cần.
