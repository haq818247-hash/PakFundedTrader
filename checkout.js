document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutReview();
  const form = document.getElementById("checkout-form");
  form?.addEventListener("submit", handleCheckoutSubmit);
});

function buildCheckoutLinesFromSession() {
  const sessionLines = resolveCheckoutLines();
  const lines = [];
  let currency = "USD";
  sessionLines.forEach(entry => {
    const pkg = getAccountById(entry.packageId);
    if (!pkg || pkg.active === false) return;
    const qty = Math.max(1, parseInt(entry.qty, 10) || 1);
    const unitPrice = parsePriceToNumber(pkg.price);
    currency = getCurrencyFromPackage(pkg);
    lines.push({ packageId: pkg.id, qty, pkg, unitPrice, lineTotal: unitPrice * qty, currency });
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { lines, subtotal, currency };
}

function renderCheckoutReview() {
  const listEl = document.getElementById("checkout-lines");
  const emptyEl = document.getElementById("checkout-empty");
  const panelEl = document.getElementById("checkout-panel");
  const platformSelect = document.getElementById("checkout-platform");
  if (!listEl) return;

  const { lines, subtotal, currency } = buildCheckoutLinesFromSession();

  if (!lines.length) {
    if (emptyEl) emptyEl.hidden = false;
    if (panelEl) panelEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (panelEl) panelEl.hidden = false;

  listEl.innerHTML = lines
    .map(
      l => `
    <tr>
      <td>${l.pkg.name}<br><small class="text-muted">${l.pkg.balance}</small></td>
      <td>${l.qty}</td>
      <td>${formatMoney(l.unitPrice, l.currency)}</td>
      <td><strong>${formatMoney(l.lineTotal, l.currency)}</strong></td>
    </tr>`
    )
    .join("");

  const subtotalEl = document.getElementById("checkout-subtotal");
  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal, currency);

  if (platformSelect && typeof getPlatformsForPackage === "function") {
    const first = lines[0].pkg;
    const platforms = getPlatformsForPackage(first.platformsSupported);
    platformSelect.innerHTML =
      `<option value="">Select platform (order preference)</option>` +
      platforms
        .map(p => `<option value="${p.id}">${p.name} — ${getPlatformStatusLabel(p.integrationStatus)}</option>`)
        .join("");
  }

  const refEl = document.getElementById("order-reference");
  if (refEl && !refEl.value) {
    refEl.value = "PFT-" + Date.now().toString(36).toUpperCase();
  }
  const refDisplay = document.getElementById("order-reference-display");
  if (refDisplay && refEl) refDisplay.textContent = refEl.value;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const resultBox = document.getElementById("checkout-result");
  const terms = document.getElementById("checkout-terms");
  const { lines } = buildCheckoutLinesFromSession();

  if (!lines.length) {
    showCheckoutResult(resultBox, "Your checkout session has no valid packages. Return to Instant Funding.", "error");
    return;
  }
  if (terms && !terms.checked) {
    showCheckoutResult(resultBox, "Please acknowledge the terms and risk disclosure before continuing.", "error");
    return;
  }

  showCheckoutResult(
    resultBox,
    "Order review recorded locally for demonstration only. No payment was processed. A production checkout requires a secure backend, verified payment instructions, and manual or automated payment verification before any account provisioning.",
    "info"
  );

  const submitBtn = document.getElementById("checkout-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Pending Backend Integration";
  }
}

function showCheckoutResult(el, message, type) {
  if (!el) return;
  el.hidden = false;
  el.className = `checkout-result checkout-result-${type}`;
  el.textContent = message;
}
