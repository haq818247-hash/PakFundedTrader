/**
 * ============================================================================
 * PAK FUNDED TRADER - ADMIN.JS
 * Admin Dashboard Controller & CRUD System
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  renderAdminTable();
  renderPlatformIntegrationTable();
  initSearchAndFilter();
  initFormModal();
  initDeleteModal();
  initResetButton();
  initAdminMobileMenu();
}

function initAdminMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");
  if (!hamburgerBtn || !navMenu) return;
  hamburgerBtn.addEventListener("click", () => {
    const open = !hamburgerBtn.classList.contains("active");
    hamburgerBtn.classList.toggle("active", open);
    navMenu.classList.toggle("active", open);
    hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// ==========================================
// 1. RENDER ADMIN TABLE & METRICS STATS
// ==========================================
function renderAdminTable() {
  const tableBody = document.getElementById("accounts-table-body");
  if (!tableBody) return;

  const searchQuery = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("status-filter")?.value || "all";

  // Fetch all stored accounts (both active and inactive)
  let accounts = getStoredAccounts(false);

  // Apply filters
  if (statusFilter === "active") {
    accounts = accounts.filter(acc => acc.active !== false);
  } else if (statusFilter === "inactive") {
    accounts = accounts.filter(acc => acc.active === false);
  }

  if (searchQuery) {
    accounts = accounts.filter(acc => 
      acc.name.toLowerCase().includes(searchQuery) ||
      acc.balance.toLowerCase().includes(searchQuery) ||
      acc.price.toLowerCase().includes(searchQuery) ||
      (acc.accountType && acc.accountType.toLowerCase().includes(searchQuery))
    );
  }

  // Update Stats Metrics
  updateMetricsStats();

  tableBody.innerHTML = "";

  if (!accounts.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>No Account Packages Found</h3>
            <p>No account packages match your current search query or filter. Click "Add New Account" to create one.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  accounts.forEach(acc => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: var(--text-white);">${acc.name}</div>
        <div style="font-size: 0.78rem; color: var(--text-dim);">${acc.accountType || "Binary Options"}</div>
      </td>
      <td><strong>${acc.balance}</strong></td>
      <td><span class="text-emerald" style="font-weight: 700;">${acc.price}</span></td>
      <td>${acc.profitSplit} Share</td>
      <td>
        ${acc.active !== false 
          ? `<span class="status-badge active"><span class="badge-dot"></span> Active</span>` 
          : `<span class="status-badge inactive">Inactive</span>`}
        ${acc.featured ? `<span class="badge-featured" style="margin-left: 0.4rem;">Featured</span>` : ""}
      </td>
      <td><span style="font-size: 0.85rem; color: var(--text-muted);">${acc.dailyLossLimit}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon edit" title="Preview on site" onclick="window.open('instant-funding.html#pkg-${acc.id}','_blank')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon edit" title="Edit Package" onclick="openEditModal('${acc.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon toggle" title="${acc.active !== false ? "Deactivate Package" : "Activate Package"}" onclick="handleToggleStatus('${acc.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
          <button class="btn-icon delete" title="Delete Package" onclick="openDeleteModal('${acc.id}', '${acc.name}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ==========================================
// 2. METRICS STATS CALCULATOR
// ==========================================
function updateMetricsStats() {
  const allAccounts = getStoredAccounts(false);
  const activeAccounts = allAccounts.filter(acc => acc.active !== false);
  const featuredAccounts = allAccounts.filter(acc => acc.featured === true);

  const totalEl = document.getElementById("stat-total");
  const activeEl = document.getElementById("stat-active");
  const featuredEl = document.getElementById("stat-featured");
  const splitEl = document.getElementById("stat-split");

  if (totalEl) totalEl.textContent = allAccounts.length;
  if (activeEl) activeEl.textContent = activeAccounts.length;
  if (featuredEl) featuredEl.textContent = featuredAccounts.length;

  if (splitEl) {
    if (activeAccounts.length > 0) {
      const avg = activeAccounts.reduce((acc, curr) => {
        const val = parseInt(curr.profitSplit.replace(/[^0-9]/g, ""), 10) || 80;
        return acc + val;
      }, 0) / activeAccounts.length;
      splitEl.textContent = Math.round(avg) + "% Share";
    } else {
      splitEl.textContent = "N/A";
    }
  }
}

// ==========================================
// 3. SEARCH & FILTER CONTROLLERS
// ==========================================
function initSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");

  if (searchInput) {
    searchInput.addEventListener("input", renderAdminTable);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", renderAdminTable);
  }
}

// ==========================================
// 4. ADD & EDIT FORM MODAL CONTROLLER
// ==========================================
let currentEditId = null;

function initFormModal() {
  const modal = document.getElementById("account-form-modal");
  const addBtn = document.getElementById("add-account-btn");
  const closeBtn = document.getElementById("form-modal-close");
  const cancelBtn = document.getElementById("form-modal-cancel");
  const form = document.getElementById("account-form");

  if (!modal || !form) return;

  function populatePlatformCheckboxes(selectedIds = []) {
    const wrap = document.getElementById("field-platforms-wrap");
    if (!wrap || typeof getCustomerSelectablePlatforms !== "function") return;
    const platforms = getCustomerSelectablePlatforms();
    wrap.innerHTML = platforms
      .map(
        p => `
      <label class="checkbox-group platform-check">
        <input type="checkbox" name="platform-option" value="${p.id}" ${selectedIds.includes(p.id) ? "checked" : ""}>
        <span>${p.name}</span>
      </label>`
      )
      .join("");
  }

  function openModal(isEdit = false, accData = null) {
    form.reset();
    clearFormErrors();
    currentEditId = isEdit && accData ? accData.id : null;
    const titleEl = document.getElementById("form-modal-title");

    if (isEdit && accData) {
      if (titleEl) titleEl.textContent = "Edit Account Package";
      document.getElementById("field-id").value = accData.id;
      document.getElementById("field-name").value = accData.name || "";
      document.getElementById("field-balance").value = accData.balance || "";
      document.getElementById("field-price").value = accData.price || "";
      document.getElementById("field-profit-split").value = accData.profitSplit || "";
      document.getElementById("field-daily-loss").value = accData.dailyLossLimit || "";
      document.getElementById("field-max-drawdown").value = accData.maxDrawdown || "";
      document.getElementById("field-payout-terms").value = accData.payoutTerms || "";
      document.getElementById("field-description").value = accData.description || "";
      document.getElementById("field-status").value = accData.active !== false ? "active" : "inactive";
      document.getElementById("field-featured").checked = accData.featured === true;
      document.getElementById("field-currency").value = accData.currency || "USD";
      populatePlatformCheckboxes(accData.platformsSupported || []);
    } else {
      if (titleEl) titleEl.textContent = "Add New Account Package";
      document.getElementById("field-id").value = "";
      document.getElementById("field-status").value = "active";
      document.getElementById("field-featured").checked = false;
      document.getElementById("field-currency").value = "USD";
      populatePlatformCheckboxes([]);
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    currentEditId = null;
  }

  if (addBtn) addBtn.addEventListener("click", () => openModal(false));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submission
  form.addEventListener("submit", e => {
    e.preventDefault();
    clearFormErrors();

    const accountData = {
      id: document.getElementById("field-id").value || null,
      name: document.getElementById("field-name").value.trim(),
      balance: document.getElementById("field-balance").value.trim(),
      price: document.getElementById("field-price").value.trim(),
      currency: document.getElementById("field-currency").value.trim() || "USD",
      profitSplit: document.getElementById("field-profit-split").value.trim(),
      dailyLossLimit: document.getElementById("field-daily-loss").value.trim(),
      maxDrawdown: document.getElementById("field-max-drawdown").value.trim(),
      payoutTerms: document.getElementById("field-payout-terms").value.trim(),
      description: document.getElementById("field-description").value.trim(),
      active: document.getElementById("field-status").value === "active",
      featured: document.getElementById("field-featured").checked,
      accountType: "Instant Funding Account",
      platformsSupported: Array.from(form.querySelectorAll('input[name="platform-option"]:checked')).map(
        el => el.value
      )
    };

    const errors = validateAccountForm(accountData);
    if (errors.length) {
      showFormErrors(errors);
      if (typeof showAdminToast === "function") showAdminToast(errors[0], "error");
      return;
    }

    saveAccount(accountData);
    closeModal();
    renderAdminTable();
    if (typeof showAdminToast === "function") showAdminToast("Package saved successfully.", "success");
  });
}

function validateAccountForm(data) {
  const errors = [];
  const required = [
    ["name", "Account name"],
    ["balance", "Account balance"],
    ["price", "Price"],
    ["profitSplit", "Profit split"],
    ["dailyLossLimit", "Daily loss limit"],
    ["maxDrawdown", "Maximum drawdown"]
  ];
  required.forEach(([key, label]) => {
    if (!data[key]) errors.push(`${label} is required.`);
  });
  if (data.platformsSupported && !data.platformsSupported.length) {
    errors.push("Select at least one supported platform option for customer display.");
  }
  return errors;
}

function clearFormErrors() {
  document.querySelectorAll(".form-error-banner").forEach(el => el.remove());
}

function showFormErrors(errors) {
  const form = document.getElementById("account-form");
  if (!form) return;
  const banner = document.createElement("div");
  banner.className = "form-error-banner";
  banner.innerHTML = `<strong>Please fix the following:</strong><ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul>`;
  form.prepend(banner);
}

function openEditModal(id) {
  const acc = getAccountById(id);
  if (!acc) return;
  
  const modal = document.getElementById("account-form-modal");
  const titleEl = document.getElementById("form-modal-title");

  if (titleEl) titleEl.textContent = "Edit Account Package";
  document.getElementById("field-id").value = acc.id;
  document.getElementById("field-name").value = acc.name || "";
  document.getElementById("field-balance").value = acc.balance || "";
  document.getElementById("field-price").value = acc.price || "";
  document.getElementById("field-profit-split").value = acc.profitSplit || "";
  document.getElementById("field-daily-loss").value = acc.dailyLossLimit || "";
  document.getElementById("field-max-drawdown").value = acc.maxDrawdown || "";
  document.getElementById("field-payout-terms").value = acc.payoutTerms || "";
  document.getElementById("field-description").value = acc.description || "";
  document.getElementById("field-status").value = acc.active !== false ? "active" : "inactive";
  document.getElementById("field-featured").checked = acc.featured === true;
  document.getElementById("field-currency").value = acc.currency || "USD";
  const wrap = document.getElementById("field-platforms-wrap");
  if (wrap && typeof getCustomerSelectablePlatforms === "function") {
    const platforms = getCustomerSelectablePlatforms();
    wrap.innerHTML = platforms
      .map(
        p => `
      <label class="checkbox-group platform-check">
        <input type="checkbox" name="platform-option" value="${p.id}" ${(acc.platformsSupported || []).includes(p.id) ? "checked" : ""}>
        <span>${p.name}</span>
      </label>`
      )
      .join("");
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

// ==========================================
// 5. TOGGLE ACTIVE / INACTIVE HANDLER
// ==========================================
function handleToggleStatus(id) {
  toggleAccountStatus(id);
  renderAdminTable();
}

// ==========================================
// 6. DELETE CONFIRMATION MODAL CONTROLLER
// ==========================================
let deleteTargetId = null;

function initDeleteModal() {
  const modal = document.getElementById("delete-confirm-modal");
  const closeBtn = document.getElementById("delete-modal-close");
  const cancelBtn = document.getElementById("delete-modal-cancel");
  const confirmBtn = document.getElementById("delete-modal-confirm");

  if (!modal) return;

  function closeDeleteModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    deleteTargetId = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDeleteModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeDeleteModal);

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (deleteTargetId) {
        deleteAccount(deleteTargetId);
        renderAdminTable();
      }
      closeDeleteModal();
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDeleteModal();
  });
}

function openDeleteModal(id, name) {
  deleteTargetId = id;
  const modal = document.getElementById("delete-confirm-modal");
  const nameEl = document.getElementById("delete-account-name");

  if (nameEl) nameEl.textContent = name;
  if (modal) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
}

// ==========================================
// 7. RESET DEFAULTS CONTROLLER
// ==========================================
function renderPlatformIntegrationTable() {
  const tbody = document.getElementById("platforms-table-body");
  if (!tbody || typeof getStoredPlatforms !== "function") return;
  tbody.innerHTML = getStoredPlatforms()
    .map(p => {
      const statusClass =
        p.integrationStatus === "connected"
          ? "active"
          : p.integrationStatus === "pending_verification"
            ? "pending"
            : "inactive";
      return `
      <tr>
        <td><strong>${p.name}</strong><br><span class="text-muted">${p.id}</span></td>
        <td><span class="status-badge ${statusClass}">${getPlatformStatusLabel(p.integrationStatus)}</span></td>
        <td>${p.customerSelectable !== false ? "Yes" : "No"}</td>
        <td><span class="text-muted">Configure via secure backend when authorized. No API keys in frontend.</span></td>
      </tr>`;
    })
    .join("");
}

function initResetButton() {
  const resetBtn = document.getElementById("reset-defaults-btn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all account packages to the default sample dataset? This will erase custom additions in localStorage.")) {
      resetToDefaultAccounts();
      renderAdminTable();
    }
  });
}
