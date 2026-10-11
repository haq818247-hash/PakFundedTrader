/**
 * PAK FUNDED TRADER - SCRIPT.JS
 * Vanilla JavaScript Interactivity & Dynamic Accounts System (Binary Options Focus)
 */

// Reads active accounts from accounts.js / localStorage
const getPublicAccounts = () => {
  if (typeof getStoredAccounts === "function") {
    return getStoredAccounts(true);
  }
  if (typeof BINARY_FUNDING_ACCOUNTS !== "undefined") {
    return BINARY_FUNDING_ACCOUNTS.filter(acc => acc.active !== false);
  }
  return [];
};

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  initFundingCards();
  initFeaturedPackages();
  initTierFilter();
  initMobileMenu();
  initFaqAccordion();
  initModalDialog();
  initActiveNavLinkScroll();
  initPackageCartActions();
});

// ==========================================
// 1. RENDER INSTANT FUNDING CARDS FROM ACCOUNTS.JS / LOCALSTORAGE
// ==========================================
function renderFundingCards(filterSize = "all", options = {}) {
  const containerId = options.containerId || "challenge-cards-container";
  const container = document.getElementById(containerId);
  if (!container) return;

  let accounts = getPublicAccounts();
  if (options.featuredOnly) {
    accounts = accounts.filter(pkg => pkg.featured === true);
  }

  const packagesToDisplay = filterSize === "all"
    ? accounts
    : accounts.filter(pkg => pkg.numericSize === parseInt(filterSize, 10));

  container.innerHTML = "";

  if (!packagesToDisplay.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; padding: 3rem 1rem;">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 style="color: var(--text-white); font-size: 1.2rem;">No Active Accounts Available</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">No account packages match your filter or all accounts are set to inactive. Manage packages in the <a href="admin.html" class="text-emerald" style="text-decoration: underline;">Admin Portal</a>.</p>
      </div>
    `;
    return;
  }

  packagesToDisplay.forEach(pkg => {
    const cardEl = document.createElement("div");
    cardEl.className = `card challenge-card ${pkg.featured ? "featured" : ""}`;
    cardEl.id = `pkg-${pkg.id}`;
    cardEl.setAttribute("data-size", pkg.numericSize);

    cardEl.innerHTML = `
      ${pkg.badgeText ? `<div class="card-badge">${pkg.badgeText}</div>` : ""}
      <div class="challenge-header">
        <h3>${pkg.name}</h3>
        <div class="account-size">${pkg.balance}</div>
        <div class="sample-price-tag">${pkg.priceNote || "SAMPLE PRICE — PENDING CLIENT APPROVAL"}</div>
      </div>
      <ul class="challenge-specs">
        <li><span>Sample Purchase Price</span><strong>${pkg.price}</strong></li>
        <li><span>Profit Split Share</span><strong>${pkg.profitSplit}</strong></li>
        <li><span>Account Type</span><strong>${pkg.accountType || "Instant Funding Account"}</strong></li>
        <li><span>Max Daily Loss</span><strong>${pkg.dailyLossLimit}</strong></li>
        <li><span>Max Overall Drawdown</span><strong>${pkg.maxDrawdown}</strong></li>
        <li><span>Payout Terms</span><strong>${pkg.payoutTerms || "Pending approval"}</strong></li>
      </ul>
      <div class="card-actions-stack">
        <button type="button" class="btn ${pkg.featured ? "btn-primary" : "btn-secondary"} btn-block js-modal-trigger" data-action="view-details" data-id="${pkg.id}">
          View Details
        </button>
        <div class="card-actions-row">
          <button type="button" class="btn btn-outline btn-block js-add-cart" data-id="${pkg.id}">Add to Cart</button>
          <button type="button" class="btn btn-primary btn-block js-buy-now" data-id="${pkg.id}">Buy Now</button>
        </div>
      </div>
    `;

    container.appendChild(cardEl);
  });
}

function initFundingCards() {
  renderFundingCards("all");
}

function initFeaturedPackages() {
  renderFundingCards("all", { containerId: "featured-packages-container", featuredOnly: true });
}

function initPackageCartActions() {
  document.addEventListener("click", e => {
    const addBtn = e.target.closest(".js-add-cart");
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.getAttribute("data-id");
      const result = typeof addToCart === "function" ? addToCart(id) : { ok: false };
      if (result.ok && typeof updateCartBadge === "function") updateCartBadge();
      addBtn.textContent = result.ok ? "Added ✓" : "Unavailable";
      setTimeout(() => {
        addBtn.textContent = "Add to Cart";
      }, 1600);
      return;
    }
    const buyBtn = e.target.closest(".js-buy-now");
    if (buyBtn && typeof buyNow === "function") {
      e.preventDefault();
      const id = buyBtn.getAttribute("data-id");
      buyNow(id);
    }
  });
}

// ==========================================
// 2. TIER FILTER SWITCHER
// ==========================================
function initTierFilter() {
  const filterBtns = document.querySelectorAll(".tier-btn");
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const size = btn.getAttribute("data-size");
      renderFundingCards(size);
    });
  });
}

// ==========================================
// 3. MOBILE HAMBURGER MENU
// ==========================================
function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!hamburgerBtn || !navMenu) return;

  function toggleMenu(isOpen) {
    const shouldOpen = isOpen !== undefined ? isOpen : !hamburgerBtn.classList.contains("active");
    hamburgerBtn.classList.toggle("active", shouldOpen);
    navMenu.classList.toggle("active", shouldOpen);
    hamburgerBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  hamburgerBtn.addEventListener("click", () => toggleMenu());

  navLinks.forEach(link => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      toggleMenu(false);
    }
  });
}

// ==========================================
// 4. FAQ ACCORDION CONTROLLER
// ==========================================
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  if (!faqQuestions.length) return;

  faqQuestions.forEach(btn => {
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const answerId = btn.getAttribute("aria-controls");
      const answerEl = document.getElementById(answerId);

      faqQuestions.forEach(otherBtn => {
        otherBtn.setAttribute("aria-expanded", "false");
        const otherAnsId = otherBtn.getAttribute("aria-controls");
        const otherAnsEl = document.getElementById(otherAnsId);
        if (otherAnsEl) otherAnsEl.hidden = true;
      });

      if (!isExpanded && answerEl) {
        btn.setAttribute("aria-expanded", "true");
        answerEl.hidden = false;
      }
    });
  });
}

// ==========================================
// 5. INTERACTIVE PREVIEW MODAL (DETAILS VIEW)
// ==========================================
function initModalDialog() {
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close-btn");
  const okBtn = document.getElementById("modal-ok-btn");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");

  if (!overlay) return;

  function openModal(title, htmlContent) {
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = htmlContent;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".js-modal-trigger");
    if (!trigger) return;

    const href = trigger.getAttribute("href");
    if (href && href !== "#" && !href.startsWith("#")) {
      return;
    }

    e.preventDefault();
    const action = trigger.getAttribute("data-action");
    const accountId = trigger.getAttribute("data-id");

    if (action === "view-details") {
      const pkg = typeof getAccountById === "function" ? getAccountById(accountId) : null;
      if (pkg) {
        const detailsHtml = `
          <div style="text-align: left; font-size: 0.92rem;">
            <div style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span class="badge" style="margin-bottom: 0.5rem;">${pkg.accountType || "Instant Binary Option Account"}</span>
              <p style="color: var(--text-muted); margin-top: 0.4rem;">${pkg.description || "Simulated binary options trading account."}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Account Balance:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right; color: var(--text-white);">${pkg.balance}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Sample Purchase Price:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right; color: var(--primary-emerald);">${pkg.price}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Profit Split Share:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right; color: var(--primary-emerald);">${pkg.profitSplit}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Daily Loss Limit:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right; color: var(--amber-warning);">${pkg.dailyLossLimit}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Maximum Drawdown:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right; color: var(--rose-danger);">${pkg.maxDrawdown}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Payout Schedule:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right;">${pkg.payoutTerms || "Bi-Weekly Distribution"}</td>
              </tr>
              <tr>
                <td style="padding: 0.4rem 0; color: var(--text-muted);">Trading Assets:</td>
                <td style="padding: 0.4rem 0; font-weight: bold; text-align: right;">Binary Options Contracts</td>
              </tr>
            </table>
            <div class="sample-notice text-center" style="margin-top: 1rem; font-size: 0.8rem;">
              ⚠️ <strong>Note:</strong> Package details, prices, and risk rules shown above are sample information pending client approval. Backend activation is disabled in this frontend build.
            </div>
          </div>
        `;
        openModal(`${pkg.name} Specs`, detailsHtml);
      }
    } else if (action === "login") {
      openModal("Trader Portal Login", "<p>Login functionality is disabled in this frontend-only demonstration. In a full production setup, this would direct to the trader dashboard login interface.</p>");
    } else if (action === "select-account" || action === "select-challenge") {
      openModal("Instant Funding Account Selected", `<p>You selected an instant funding tier.<br><br><small class="text-amber">Note: Prices and rules shown are sample placeholders for frontend design demonstration only and are pending client approval.</small></p>`);
    } else if (action === "terms") {
      openModal("Terms & Conditions", "<p>This is a placeholder preview for the Terms & Conditions policy. Final legal guidelines will be outlined in official contracts.</p>");
    } else if (action === "privacy") {
      openModal("Privacy Policy", "<p>This is a placeholder preview for the Privacy Policy document. Pak Funded Trader prioritizes data privacy and client protection.</p>");
    } else if (action === "risk") {
      openModal("Risk Disclosure", "<p>Binary options trading carries a high risk of financial loss. All accounts provided on Pak Funded Trader are simulated accounts with hypothetical capital.</p>");
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (okBtn) okBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });
}

// ==========================================
// 6. ACTIVE NAVBAR SCROLL HIGHLIGHTER
// ==========================================
function initActiveNavLinkScroll() {
  const sections = document.querySelectorAll("section[id], header");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length) return;

  window.addEventListener("scroll", () => {
    let currentSection = "top";
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = section.getAttribute("id") || "top";
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        link.classList.remove("active");
        if (href === `#${currentSection}`) {
          link.classList.add("active");
        }
      }
    });
  });
}
