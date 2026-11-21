// Layout v2: show the sticky buy bar on phones once the hero button has scrolled out of view.
// Event logging stays in site.js (the bar's button carries data-cta="sticky").
(function () {
  var bar = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.v2-hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    bar.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0 }).observe(hero);
})();
