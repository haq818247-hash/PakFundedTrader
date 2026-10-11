/**
 * PAK FUNDED TRADER - SHOPPING CART (localStorage demonstration only)
 * Prices and package validity are always resolved from accounts.js at read time.
 */

const CART_STORAGE_KEY = "pak_funded_cart_v1";
const CHECKOUT_SESSION_KEY = "pak_checkout_session_v1";

function getCartRaw() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartRaw(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  if (typeof updateCartBadge === "function") updateCartBadge();
}

function getCartItemCount() {
  return getCartRaw().reduce((sum, line) => sum + (line.qty || 1), 0);
}

function addToCart(packageId, qty = 1) {
  const pkg = typeof getAccountById === "function" ? getAccountById(packageId) : null;
  if (!pkg || pkg.active === false) {
    return { ok: false, message: "This package is unavailable or inactive." };
  }
  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  const cart = getCartRaw();
  const existing = cart.find(line => line.packageId === packageId);
  if (existing) {
    existing.qty = (existing.qty || 1) + quantity;
  } else {
    cart.push({ packageId, qty: quantity });
  }
  saveCartRaw(cart);
  return { ok: true, message: "Added to cart." };
}

function setCartQuantity(packageId, qty) {
  const quantity = parseInt(qty, 10);
  if (quantity < 1) return removeFromCart(packageId);
  const cart = getCartRaw();
  const line = cart.find(l => l.packageId === packageId);
  if (line) {
    line.qty = quantity;
    saveCartRaw(cart);
  }
  return { ok: true };
}

function removeFromCart(packageId) {
  saveCartRaw(getCartRaw().filter(l => l.packageId !== packageId));
  return { ok: true };
}

function clearCart() {
  saveCartRaw([]);
}

function parsePriceToNumber(priceStr) {
  if (typeof priceStr !== "string") return 0;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

function getCurrencyFromPackage(pkg) {
  return (pkg && pkg.currency) ? pkg.currency : "USD";
}

/**
 * Validates cart lines against current account data.
 * @returns {{ lines: Array, subtotal: number, currency: string, removed: Array, warnings: Array }}
 */
function getValidatedCart() {
  const raw = getCartRaw();
  const lines = [];
  const removed = [];
  const warnings = [];
  let currency = "USD";

  raw.forEach(line => {
    const pkg = typeof getAccountById === "function" ? getAccountById(line.packageId) : null;
    if (!pkg || pkg.active === false) {
      removed.push(line.packageId);
      warnings.push(`Removed unavailable package: ${line.packageId}`);
      return;
    }
    currency = getCurrencyFromPackage(pkg);
    const unitPrice = parsePriceToNumber(pkg.price);
    const qty = Math.max(1, parseInt(line.qty, 10) || 1);
    lines.push({
      packageId: pkg.id,
      qty,
      pkg,
      unitPrice,
      lineTotal: unitPrice * qty,
      currency: getCurrencyFromPackage(pkg)
    });
  });

  if (removed.length) {
    saveCartRaw(raw.filter(l => !removed.includes(l.packageId)));
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { lines, subtotal, currency, removed, warnings };
}

function buyNow(packageId) {
  const pkg = typeof getAccountById === "function" ? getAccountById(packageId) : null;
  if (!pkg || pkg.active === false) {
    return { ok: false, message: "This package is unavailable or inactive." };
  }
  try {
    sessionStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({ mode: "buynow", lines: [{ packageId, qty: 1 }] })
    );
  } catch (err) {
    return { ok: false, message: "Could not start checkout session." };
  }
  window.location.href = "checkout.html";
  return { ok: true };
}

function getCheckoutSession() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCheckoutSession() {
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
}

function resolveCheckoutLines() {
  const session = getCheckoutSession();
  if (session && session.mode === "buynow" && Array.isArray(session.lines)) {
    return session.lines;
  }
  return getCartRaw();
}

function formatMoney(amount, currency = "USD") {
  const symbol = currency === "PKR" ? "Rs " : "$";
  return `${symbol}${amount.toFixed(2)}`;
}
