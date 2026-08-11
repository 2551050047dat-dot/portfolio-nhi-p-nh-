/*
 * TASK 1 - Ngân: Homepage / Header / Mobile nav
 * Mục tiêu:
 * - Giữ nguyên theme warm premium của studio ảnh.
 * - Duy trì menu sticky, mobile toggle, active state và footer year.
 *
 * NOTE HƯỚNG DẪN:
 * 1. Chỉ làm phần homepage và navigation.
 * 2. Không chạm into gallery, pricing, booking form.
 * 3. Bố cục: hero trái text - phải ảnh, button màu vàng nâu, section ấm.
 * 4. Nav active dùng pathname để highlight đúng trang hiện tại.
 * 5. Menu mobile phải có aria-expanded và toggle open/close.
 */

const toggleButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (toggleButton && nav) {
  toggleButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggleButton.setAttribute('aria-expanded', 'false');
      toggleButton.setAttribute('aria-label', 'Mở menu');
    });
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.site-nav a');
navLinks.forEach((link) => {
  const linkPage = link.getAttribute('href') || '';
  if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
    link.classList.add('active');
  }
});

// TODO: Người 1 viết tiếp phần interactivity của homepage nếu cần làm form CTA, hover, stats, animation.

