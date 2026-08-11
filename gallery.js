/*
 * TASK 2 - Quỳnh: Gallery / Portfolio / Lightbox
 * Mục tiêu:
 * - Chuyển portfolio sang dạng gallery đẹp, có filter category và modal xem ảnh lớn.
 * - Giữ tone ấm, rõ ràng, premium.
 *
 * NOTE HƯỚNG DẪN:
 * 1. Chỉ làm phần portfolio và lightbox, không đụng vào menu, pricing hay form.
 * 2. Bộ lọc: Tất cả / Cưới / Chân dung / Sự kiện / Sản phẩm.
 * 3. Mỗi card phải có data-category và ảnh có data-lightbox.
 * 4. Lightbox cần close, prev, next, Escape, click ngoài.
 * 5. Không dùng kiểu gallery quá tối hoặc quá flash.
 */

const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.portfolio-card');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');
const prevBtn = document.getElementById('prevImage');
const nextBtn = document.getElementById('nextImage');
const galleryImages = [...document.querySelectorAll('[data-lightbox]')];

let activeIndex = 0;

const openLightbox = (index) => {
  if (!lightbox || !lightboxImage || !galleryImages.length) return;
  activeIndex = index;
  const currentImage = galleryImages[activeIndex];
  if (!currentImage) return;

  lightboxImage.src = currentImage.dataset.lightbox || currentImage.src;
  lightboxImage.alt = currentImage.alt;
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
};

if (filterButtons.length && cards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter || 'all';
      cards.forEach((card) => {
        const category = card.dataset.category || 'all';
        const match = filter === 'all' || filter === category;
        card.style.display = match ? 'block' : 'none';
      });
    });
  });
}

if (galleryImages.length) {
  galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => openLightbox(index));
  });
}

if (closeLightbox) {
  closeLightbox.addEventListener('click', closeModal);
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeModal();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    const newIndex = activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1;
    openLightbox(newIndex);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    const newIndex = activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1;
    openLightbox(newIndex);
  });
}

document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.classList.contains('hidden')) return;

  if (event.key === 'Escape') closeModal();
  if (event.key === 'ArrowRight') {
    const nextIndex = activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1;
    openLightbox(nextIndex);
  }
  if (event.key === 'ArrowLeft') {
    const prevIndex = activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1;
    openLightbox(prevIndex);
  }
});

// TODO: Người 2 viết lại phần portfolio card styling và lightbox animation nếu cần.
