// Demand test: record the visit, the click on the priced button, and waitlist signups.
// Every event is one row in a Google Form sheet. No payment is taken anywhere on this site.
(function () {
  var CONFIG = window.LAB_CONFIG || {};
  var variant = document.body.getAttribute('data-variant') || 'lab/home';
  var qs = new URLSearchParams(location.search);
  var source = [qs.get('utm_source'), qs.get('utm_campaign'), qs.get('utm_term')]
    .filter(Boolean).join(' / ') || (document.referrer ? new URL(document.referrer).hostname : 'direct');

  // One view and one pay_intent per visit to a page, so a reload or a second
  // click on the button does not inflate the counts the stop rule reads.
  function once(name) {
    var key = 'lab:' + variant + ':' + name;
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, '1');
    } catch (e) {}
    return true;
  }

  function log(event, detail, email) {
    if (!CONFIG.formAction || !CONFIG.fields) return;
    var body = new URLSearchParams();
    body.set(CONFIG.fields.event, event);
    body.set(CONFIG.fields.variant, variant + (detail ? ' : ' + detail : ''));
    body.set(CONFIG.fields.email, email || '');
    body.set(CONFIG.fields.source, source);
    try {
      fetch(CONFIG.formAction, { method: 'POST', mode: 'no-cors', body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  // Count a visit only when a person keeps the page open for 3 seconds.
  if (!/bot|crawl|spider|headless|preview/i.test(navigator.userAgent)) {
    setTimeout(function () {
      if (document.visibilityState === 'visible' && once('view')) log('view');
    }, 3000);
  }

  var dlg = document.getElementById('waitlist');
  var form = document.getElementById('waitlist-form');
  var done = document.getElementById('waitlist-done');
  var lastCta = '';

  document.querySelectorAll('[data-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastCta = btn.getAttribute('data-cta');
      if (once('pay_intent')) log('pay_intent', lastCta);
      if (dlg && dlg.showModal) dlg.showModal();
    });
  });

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { dlg.close(); });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.company && form.elements.company.value) return; // bot trap
      var email = form.elements.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { form.elements.email.focus(); return; }
      log('waitlist_signup', lastCta, email);
      form.hidden = true;
      done.hidden = false;
    });
  }
})();
