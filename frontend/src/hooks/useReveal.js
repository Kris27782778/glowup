import { useEffect } from 'react';

/**
 * 使頁面上所有 .g-reveal / .g-reveal-l / .g-reveal-r 元素
 * 在進入 viewport 時自動加上 .visible class，觸發 CSS transition。
 */
export function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.g-reveal:not(.visible), .g-reveal-l:not(.visible), .g-reveal-r:not(.visible)'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}
