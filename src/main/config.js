// Configuration for GitHub cache and app settings
require('dotenv').config();

const DEBUG = process.env.DEBUG === 'true' || false;

const GITHUB_CONFIG = {
  OWNER: "carpete-americana",
  REPO: "bci-frontend",
  BRANCH: DEBUG ? "testing" : "main",
  STORAGE_PREFIX: "cache:",
  DEFAULT_TTL: 24 * 60 * 60 * 1000,
  PAGE_TTL: 1 * 60 * 60 * 1000,
  ASSET_TTL: 12 * 60 * 60 * 1000,
  CONFIG_TTL: 30 * 60 * 1000,
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000,
};

const routes = {
  dashboard: { title: "Dashboard", path: "dashboard", icon: "fa-chart-bar" },
  withdraw: { title: "Levantamento", path: "withdraw", icon: "fa-money-bill-wave" },
  rules: { title: "Regras", path: "rules", icon: "fa-scroll" },
  casinoaccounts: { title: "Contas Casinos", path: "casinoaccounts", icon: "fa-dice" }
};

module.exports = {
  GITHUB_CONFIG,
  DEBUG,
  routes
};
