document.addEventListener("DOMContentLoaded", () => {
  renderPackageRulesTable();
});

function renderPackageRulesTable() {
  const container = document.getElementById("package-rules-container");
  if (!container || typeof getStoredAccounts !== "function") return;

  const accounts = getStoredAccounts(true);
  if (!accounts.length) {
    container.innerHTML = `<div class="empty-state"><h3>No active packages</h3><p>Account rules will appear when active packages are configured in the admin dashboard.</p></div>`;
    return;
  }

  container.innerHTML = accounts
    .map(
      acc => `
    <article class="card rule-package-card">
      <div class="rule-badge">${acc.name}</div>
      <h3>${acc.balance} · ${acc.price} <span class="sample-price-tag">${acc.priceNote || ""}</span></h3>
      <ul class="challenge-specs">
        <li><span>Profit Split</span><strong>${acc.profitSplit}</strong></li>
        <li><span>Daily Loss Limit</span><strong>${acc.dailyLossLimit}</strong></li>
        <li><span>Maximum Drawdown</span><strong>${acc.maxDrawdown}</strong></li>
        <li><span>Payout Terms</span><strong>${acc.payoutTerms || "Pending client approval"}</strong></li>
        <li><span>Account Type</span><strong>${acc.accountType}</strong></li>
      </ul>
      <p class="text-muted" style="font-size: 0.88rem;">${acc.rulesNote || "SAMPLE RULES — PENDING CLIENT APPROVAL"}</p>
    </article>`
    )
    .join("");
}
