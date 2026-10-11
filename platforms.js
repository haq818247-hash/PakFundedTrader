/**
 * PAK FUNDED TRADER - TRADING PLATFORMS CONFIGURATION
 * Platform metadata and integration status (frontend configuration only).
 * No API keys, credentials, or live integrations are stored here.
 */

const PLATFORM_STORAGE_KEY = "pak_funded_platforms_v1";

/** @typedef {'not_connected'|'pending_verification'|'connected'} IntegrationStatus */

const DEFAULT_TRADING_PLATFORMS = [
  { id: "quotex", name: "Quotex", integrationStatus: "not_connected", customerSelectable: true },
  { id: "tradeowix", name: "Tradeowix", integrationStatus: "not_connected", customerSelectable: true },
  { id: "iqoption", name: "IQ Option", integrationStatus: "not_connected", customerSelectable: true },
  { id: "pocketoption", name: "Pocket Option", integrationStatus: "not_connected", customerSelectable: true },
  { id: "olymptrade", name: "Olymp Trade", integrationStatus: "not_connected", customerSelectable: true }
];

function getPlatformStatusLabel(status) {
  const map = {
    not_connected: "Not Connected",
    pending_verification: "Pending Verification",
    connected: "Connected"
  };
  return map[status] || "Not Connected";
}

function getStoredPlatforms() {
  try {
    const raw = localStorage.getItem(PLATFORM_STORAGE_KEY);
    let platforms = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(platforms) || !platforms.length) {
      platforms = DEFAULT_TRADING_PLATFORMS;
      localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(platforms));
    }
    return platforms;
  } catch (err) {
    console.warn("Platform config read error:", err);
    return DEFAULT_TRADING_PLATFORMS;
  }
}

function savePlatformConfig(platforms) {
  localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(platforms));
  return platforms;
}

function getPlatformById(id) {
  return getStoredPlatforms().find(p => p.id === id) || null;
}

/** Platforms that may be shown to customers (not connected — selection is for order intent only). */
function getCustomerSelectablePlatforms() {
  return getStoredPlatforms().filter(p => p.customerSelectable !== false);
}

function getPlatformsForPackage(packagePlatformIds) {
  if (!Array.isArray(packagePlatformIds) || !packagePlatformIds.length) {
    return getCustomerSelectablePlatforms();
  }
  const all = getStoredPlatforms();
  return packagePlatformIds
    .map(id => all.find(p => p.id === id))
    .filter(p => p && p.customerSelectable !== false);
}
