// Presentation only: no requests, timers, or changes to the values being displayed.
export function observeAdminMotion(root: Document = document) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let observer: IntersectionObserver | undefined;
  const elements = Array.from(root.querySelectorAll<HTMLElement>(".admin-glass [data-admin-reveal]"));
  function sync() {
    observer?.disconnect();
    elements.forEach(element => element.classList.remove("admin-motion-pending"));
    if (preference.matches || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("admin-motion-pending");
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach(element => {
      element.classList.add("admin-motion-pending");
      observer!.observe(element);
    });
  }
  sync();
  preference.addEventListener("change", sync);
  return () => {
    observer?.disconnect();
    preference.removeEventListener("change", sync);
    elements.forEach(element => element.classList.remove("admin-motion-pending"));
  };
}
