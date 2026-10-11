document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  document.getElementById("clear-cart-btn")?.addEventListener("click", () => {
    if (confirm("Remove all items from your cart?")) {
      clearCart();
      renderCartPage();
    }
  });
});

function renderCartPage() {
  const container = document.getElementById("cart-items-container");
  const summaryEl = document.getElementById("cart-summary");
  const emptyEl = document.getElementById("cart-empty-state");
  if (!container) return;

  const { lines, subtotal, currency, warnings } = getValidatedCart();

  if (warnings.length) {
    const warnBox = document.getElementById("cart-warnings");
    if (warnBox) {
      warnBox.hidden = false;
      warnBox.innerHTML = `<p>${warnings.join(" ")}</p>`;
    }
  }

  if (!lines.length) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    if (summaryEl) summaryEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (summaryEl) summaryEl.hidden = false;

  container.innerHTML = lines
    .map(line => {
      const pkg = line.pkg;
      return `
        <article class="card cart-line-card" data-id="${pkg.id}">
          <div class="cart-line-main">
            <h3>${pkg.name}</h3>
            <p class="text-muted">${pkg.balance} · ${pkg.accountType}</p>
            <p class="sample-price-tag">${pkg.priceNote || ""}</p>
          </div>
          <div class="cart-line-meta">
            <div class="qty-control" aria-label="Quantity">
              <button type="button" class="btn-icon qty-btn" data-action="dec" data-id="${pkg.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${line.qty}</span>
              <button type="button" class="btn-icon qty-btn" data-action="inc" data-id="${pkg.id}" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-line-price">
              <span class="unit">${formatMoney(line.unitPrice, line.currency)} each</span>
              <strong>${formatMoney(line.lineTotal, line.currency)}</strong>
            </div>
            <button type="button" class="btn btn-outline btn-sm remove-line-btn" data-id="${pkg.id}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  const subtotalEl = document.getElementById("cart-subtotal");
  const currencyEl = document.getElementById("cart-currency");
  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal, currency);
  if (currencyEl) currencyEl.textContent = currency;

  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const line = getValidatedCart().lines.find(l => l.packageId === id);
      if (!line) return;
      const delta = btn.getAttribute("data-action") === "inc" ? 1 : -1;
      setCartQuantity(id, line.qty + delta);
      renderCartPage();
    });
  });

  container.querySelectorAll(".remove-line-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.getAttribute("data-id"));
      renderCartPage();
    });
  });
}
