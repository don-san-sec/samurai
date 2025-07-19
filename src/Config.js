/**
 * Samurai Configuration
 * Update these values before deployment
 */
const CONFIG = {
  // Email address where phishing reports will be sent
  SECURITY_EMAIL: "security@example.com",

  // Email subject prefixes
  PHISHING_PREFIX: "[PHISHING]", // For awareness only, no response needed
  INVESTIGATION_PREFIX: "[INVESTIGATION]", // User expects response from security team

  // Add-on branding
  LOGO_URL:
    "https://raw.githubusercontent.com/don-san-sec/samurai/e3270f77f661b5eb0480241a20b655767e530ca7/assets/logo.png",
  BANNER_URL:
    "https://raw.githubusercontent.com/don-san-sec/samurai/e3270f77f661b5eb0480241a20b655767e530ca7/assets/banner.png",
};

/**
 * Validates configuration on startup
 */
function validateConfig() {
  if (!CONFIG.SECURITY_EMAIL || !CONFIG.SECURITY_EMAIL.includes("@")) {
    throw new Error("Invalid SECURITY_EMAIL in Config.js");
  }

  console.log("✓ Configuration validated");
  return true;
}
