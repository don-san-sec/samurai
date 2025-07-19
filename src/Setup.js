/**
 * Samurai Setup Validator
 * Simple installation verification
 */

/**
 * Validates installation and configuration
 */
function installAddOn() {
  console.log("=== Samurai Installation Check ===");

  try {
    // Validate configuration
    validateConfig();

    // Validate required services
    validateServices();

    console.log("\n✓ Installation complete - Ready for deployment");
    console.log(`✓ Reports will be sent to: ${CONFIG.SECURITY_EMAIL}`);
    console.log("\nNext steps:");
    console.log("1. Deploy as Gmail add-on");
    console.log("2. Install in your organization");
    console.log("3. Test with a sample email");

    return true;
  } catch (error) {
    console.error("❌ Installation check failed:", error.message);
    return false;
  }
}

/**
 * Validates required services are available
 */
function validateServices() {
  // Test CardService
  try {
    CardService.newCardBuilder().build();
    console.log("✓ CardService available");
  } catch (e) {
    throw new Error("CardService not available");
  }

  // Test Gmail API
  try {
    // Just check if Gmail service is available
    if (typeof Gmail === "undefined") {
      throw new Error("Gmail API not enabled");
    }
    console.log("✓ Gmail API enabled");
  } catch (e) {
    throw new Error("Gmail API not enabled - Check Advanced Google Services");
  }

  // Test date formatting
  const testDate = new Date();
  const formatted = Utilities.formatDate(testDate, "UTC", "yyyy-MM-dd");
  if (!formatted) {
    throw new Error("Utilities not working properly");
  }
  console.log("✓ Utilities working");
}
