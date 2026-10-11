/**
 * Shared site chrome: cart badge, active nav, clipboard copy helpers, admin toasts.
 */

function updateCartBadge() {
  const el = document.getElementById("cart-count");
  if (!el || typeof getCartItemCount !== "function") return;
  const count = getCartItemCount();
  el.textContent = String(count);
  el.hidden = count === 0;
  el.setAttribute("aria-label", `${count} items in cart`);
}

function initLayoutNav() {
  const page = document.body.getAttribute("data-page");
  if (!page) return;
  document.querySelectorAll(".nav-link[data-nav]").forEach(link => {
    link.classList.toggle("active", link.getAttribute("data-nav") === page);
  });
}

async function copyTextToClipboard(text, feedbackEl) {
  const showFeedback = (msg, isError) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.classList.toggle("copy-error", !!isError);
    feedbackEl.hidden = false;
    setTimeout(() => {
      feedbackEl.hidden = true;
    }, 2500);
  };

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showFeedback("Copied!", false);
      return true;
    }
  } catch {
    /* fallback below */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) {
      showFeedback("Copied!", false);
      return true;
    }
  } catch {
    /* ignore */
  }

  showFeedback("Copy unavailable — please select and copy manually.", true);
  return false;
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy-target");
      const text = btn.getAttribute("data-copy") || (targetId ? document.getElementById(targetId)?.textContent : "");
      const feedbackId = btn.getAttribute("data-copy-feedback");
      const feedbackEl = feedbackId ? document.getElementById(feedbackId) : btn.querySelector(".copy-feedback");
      if (text) copyTextToClipboard(text.trim(), feedbackEl);
    });
  });
}

function showAdminToast(message, type = "success") {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "admin-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `admin-toast admin-toast-${type} visible`;
  setTimeout(() => toast.classList.remove("visible"), 3200);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initLayoutNav();
  initCopyButtons();
});
