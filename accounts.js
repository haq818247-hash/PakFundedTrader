/**
 * ============================================================================
 * PAK FUNDED TRADER - ACCOUNTS.JS
 * Shared package data & localStorage persistence (demonstration only).
 * ============================================================================
 *
 * PRODUCTION NOTE: localStorage is not a secure database, does not sync across
 * devices, and must not be used for administrator authentication or payments.
 */

const STORAGE_KEY = "pak_funded_accounts_v1";

const DEFAULT_BINARY_ACCOUNTS = [
  {
    id: "if-5k",
    name: "Starter Instant Account",
    balance: "$5,000",
    numericSize: 5000,
    price: "$49",
    currency: "USD",
    profitSplit: "80%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$250 (5%)",
    maxDrawdown: "$500 (10%)",
    payoutTerms: "Bi-Weekly (sample — pending approval)",
    description: "Entry-level instant funding package for reviewing account terms and risk parameters. All figures are placeholders pending client approval.",
    platformsSupported: ["quotex", "iqoption", "pocketoption"],
    active: true,
    featured: false,
    badgeText: "Starter",
    priceNote: "SAMPLE PRICE — PENDING CLIENT APPROVAL",
    rulesNote: "SAMPLE RULES — PENDING CLIENT APPROVAL"
  },
  {
    id: "if-10k",
    name: "Pro Instant Account",
    balance: "$10,000",
    numericSize: 10000,
    price: "$99",
    currency: "USD",
    profitSplit: "80%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$500 (5%)",
    maxDrawdown: "$1,000 (10%)",
    payoutTerms: "Bi-Weekly (sample — pending approval)",
    description: "Mid-tier package showcasing profit split and drawdown placeholders for the public website preview.",
    platformsSupported: ["quotex", "tradeowix", "iqoption", "pocketoption", "olymptrade"],
    active: true,
    featured: true,
    badgeText: "Featured",
    priceNote: "SAMPLE PRICE — PENDING CLIENT APPROVAL",
    rulesNote: "SAMPLE RULES — PENDING CLIENT APPROVAL"
  },
  {
    id: "if-25k",
    name: "Executive Instant Account",
    balance: "$25,000",
    numericSize: 25000,
    price: "$199",
    currency: "USD",
    profitSplit: "85%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$1,250 (5%)",
    maxDrawdown: "$2,500 (10%)",
    payoutTerms: "Bi-Weekly (sample — pending approval)",
    description: "Higher balance tier with sample rules and pricing for layout demonstration only.",
    platformsSupported: ["iqoption", "pocketoption", "olymptrade"],
    active: true,
    featured: false,
    badgeText: "High Balance",
    priceNote: "SAMPLE PRICE — PENDING CLIENT APPROVAL",
    rulesNote: "SAMPLE RULES — PENDING CLIENT APPROVAL"
  }
];

function normalizeAccountRecord(acc) {
  const normalized = { ...acc };
  normalized.currency = normalized.currency || "USD";
  normalized.accountType = normalized.accountType || "Instant Funding Account";
  normalized.priceNote = normalized.priceNote || "SAMPLE PRICE — PENDING CLIENT APPROVAL";
  normalized.rulesNote = normalized.rulesNote || "SAMPLE RULES — PENDING CLIENT APPROVAL";
  if (!Array.isArray(normalized.platformsSupported)) {
    normalized.platformsSupported = ["quotex", "iqoption", "pocketoption"];
  }
  if (!normalized.numericSize && normalized.balance) {
    const num = parseInt(String(normalized.balance).replace(/[^0-9]/g, ""), 10);
    normalized.numericSize = isNaN(num) ? 5000 : num;
  }
  return normalized;
}

function getStoredAccounts(activeOnly = false) {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let accounts = rawData ? JSON.parse(rawData) : null;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      accounts = DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } else {
      accounts = accounts.map(normalizeAccountRecord);
    }

    if (activeOnly) {
      return accounts.filter(acc => acc.active !== false);
    }
    return accounts;
  } catch (err) {
    console.warn("LocalStorage access error, returning default accounts fallback:", err);
    const fallback = DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord);
    return activeOnly ? fallback.filter(acc => acc.active !== false) : fallback;
  }
}

function getAccountById(id) {
  const accounts = getStoredAccounts(false);
  return accounts.find(acc => acc.id === id) || null;
}

function saveAccount(accountData) {
  let accounts = getStoredAccounts(false);

  if (!accountData.id) {
    accountData.id = "if-" + Date.now();
  }

  accountData = normalizeAccountRecord(accountData);

  const existingIndex = accounts.findIndex(acc => acc.id === accountData.id);
  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...accountData };
  } else {
    accounts.push(accountData);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accountData;
}

function deleteAccount(id) {
  let accounts = getStoredAccounts(false);
  accounts = accounts.filter(acc => acc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accounts;
}

function toggleAccountStatus(id) {
  const accounts = getStoredAccounts(false);
  const target = accounts.find(acc => acc.id === id);
  if (target) {
    target.active = !target.active;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
  return target;
}

function resetToDefaultAccounts() {
  const defaults = DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

const BINARY_FUNDING_ACCOUNTS = getStoredAccounts(true);
