/**
 * Samurai - Gmail Add-on for Phishing Reporting
 * Main add-on logic for forwarding suspicious emails to security team
 */

/**
 * Entry point - builds the Gmail add-on UI
 */
function buildAddOn(e) {
  try {
    const card = CardService.newCardBuilder()
      .setName("samurai-phishing-reporter")
      .setHeader(
        CardService.newCardHeader()
          .setTitle("Samurai - Phishing Reporter")
          .setImageUrl(CONFIG.LOGO_URL),
      )
      .addSection(createMainSection())
      .build();

    return [card];
  } catch (error) {
    console.error("Error building add-on:", error);
    return [createErrorCard("Failed to load add-on. Please try again.")];
  }
}

/**
 * Creates the main UI section with action buttons
 */
function createMainSection() {
  return CardService.newCardSection()
    .addWidget(
      CardService.newImage()
        .setImageUrl(CONFIG.BANNER_URL)
        .setAltText("Report suspicious emails to security team"),
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        "Report suspicious emails to the security team. Choose 'Report Phishing' to alert us, or 'Request Investigation' if you need a response.",
      ),
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Report Phishing")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#d93025")
            .setOnClickAction(
              CardService.newAction().setFunctionName("reportPhishing"),
            ),
        )
        .addButton(
          CardService.newTextButton()
            .setText("Request Investigation")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#fbbc04")
            .setOnClickAction(
              CardService.newAction().setFunctionName("requestInvestigation"),
            ),
        ),
    );
}

/**
 * Handles phishing report action - for security team awareness
 */
function reportPhishing(e) {
  return forwardEmail(e, CONFIG.PHISHING_PREFIX, "phishing");
}

/**
 * Handles investigation request - user expects a response
 */
function requestInvestigation(e) {
  return forwardEmail(e, CONFIG.INVESTIGATION_PREFIX, "investigation");
}

/**
 * Forwards email as .eml attachment to security team
 */
function forwardEmail(e, subjectPrefix, reportType) {
  try {
    const messageId = e.gmail.messageId;
    if (!messageId) {
      return createErrorCard("Please select an email first.");
    }

    // Get email content and metadata
    const emailData = getEmailData(messageId);

    // Create .eml attachment
    const emlBlob = Utilities.newBlob(
      emailData.raw,
      "message/rfc822",
      generateEmlFilename(emailData.subject, emailData.date),
    );

    // Send report to security team
    const reportSubject = `${subjectPrefix} ${emailData.subject}`;
    const { plainBody, htmlBody } = createReportBody(emailData, reportType);

    GmailApp.sendEmail(CONFIG.SECURITY_EMAIL, reportSubject, plainBody, {
      attachments: [emlBlob],
      htmlBody: htmlBody,
    });

    return createSuccessCard(reportType);
  } catch (error) {
    console.error(`Error processing ${reportType} report:`, error);
    return createErrorCard(getErrorMessage(error));
  }
}

/**
 * Retrieves email data using Gmail API
 */
function getEmailData(messageId) {
  try {
    // Get raw email content from Gmail API
    const message = Gmail.Users.Messages.get("me", messageId, {
      format: "raw",
    });

    // Decode the raw content
    const rawBytes = Utilities.base64DecodeWebSafe(message.raw);
    const rawContent = Utilities.newBlob(rawBytes).getDataAsString();

    // Parse email headers
    const headers = parseEmailHeaders(rawContent);

    return {
      raw: rawContent,
      subject: cleanSubject(headers.subject || "No Subject"),
      from: cleanEmailAddress(headers.from || "Unknown Sender"),
      to: cleanEmailAddress(headers.to || "Unknown Recipient"),
      replyTo: headers.replyTo ? cleanEmailAddress(headers.replyTo) : null,
      date: headers.date ? new Date(headers.date) : new Date(),
      messageId: headers.messageId || null,
      userAgent: headers.userAgent || null,
      attachments: parseAttachments(rawContent),
    };
  } catch (error) {
    // Fallback to GmailApp if API fails
    console.error("Gmail API failed, using GmailApp:", error);
    const message = GmailApp.getMessageById(messageId);

    return {
      raw: message.getRawContent(),
      subject: cleanSubject(message.getSubject()),
      from: cleanEmailAddress(message.getFrom()),
      to: cleanEmailAddress(message.getTo()),
      replyTo: null, // GmailApp doesn't easily expose Reply-To
      date: message.getDate(),
      messageId: null, // Would need raw content parsing
      userAgent: null, // Would need raw content parsing
      attachments: message.getAttachments().map((att) => ({
        name: att.getName(),
        type: att.getContentType(),
        size: att.getSize(),
      })),
    };
  }
}

/**
 * Parses email headers from raw content
 */
function parseEmailHeaders(rawContent) {
  const headers = {};
  const headerSection = rawContent.split(/\r?\n\r?\n/)[0];

  const headerPatterns = {
    subject: /^Subject:\s*(.*)$/im,
    from: /^From:\s*(.*)$/im,
    to: /^To:\s*(.*)$/im,
    replyTo: /^Reply-To:\s*(.*)$/im,
    date: /^Date:\s*(.*)$/im,
    messageId: /^Message-ID:\s*(.*)$/im,
    userAgent: /^(User-Agent|X-Mailer):\s*(.*)$/im,
  };

  for (const [key, pattern] of Object.entries(headerPatterns)) {
    const match = headerSection.match(pattern);
    if (match) {
      // For User-Agent/X-Mailer, use the second capture group
      headers[key] =
        key === "userAgent" ? (match[2] || match[1]).trim() : match[1].trim();
    }
  }

  return headers;
}

/**
 * Parses attachment information from raw email
 */
function parseAttachments(rawContent) {
  const attachments = [];
  const attachmentRegex =
    /Content-Disposition:\s*(attachment|inline)[^;]*;\s*filename[*]?=([^;\r\n]+)/gi;

  let match;
  while ((match = attachmentRegex.exec(rawContent))) {
    let filename = match[2].trim().replace(/["']/g, "");

    // Handle encoded filenames
    if (filename.includes("UTF-8''")) {
      filename = decodeURIComponent(filename.split("UTF-8''")[1]);
    }

    attachments.push({
      name: filename,
      type: "application/octet-stream", // Simplified - actual type parsing not critical
    });
  }

  return attachments;
}

/**
 * Generates filename for .eml attachment
 */
function generateEmlFilename(subject, date) {
  const timestamp = Utilities.formatDate(date, "UTC", "yyyy-MM-dd_HH-mm-ss");
  const cleanedSubject = subject
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .substring(0, 30)
    .trim()
    .replace(/\s+/g, "_");

  return `phishing_report_${timestamp}_${cleanedSubject}.eml`;
}

/**
 * Creates report body for email
 */
function createReportBody(emailData, reportType) {
  const reporter = Session.getActiveUser().getEmail();

  // Validate reporter email format
  if (!reporter || !reporter.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Invalid user email format");
  }
  const reportTime =
    new Date().toISOString().replace("T", " ").split(".")[0] + " UTC";
  const emailDate =
    emailData.date.toISOString().replace("T", " ").split(".")[0] + " UTC";

  const attachmentInfo =
    emailData.attachments.length > 0
      ? emailData.attachments.map((a) => a.name).join(", ")
      : "None";

  const attachmentInfoHtml =
    emailData.attachments.length > 0
      ? emailData.attachments.map((a) => escapeHtml(a.name)).join(", ")
      : "None";

  const actionRequired =
    reportType === "investigation"
      ? "\n\n⚠️ ACTION REQUIRED: User has requested investigation and expects a response.\n"
      : "";

  // Plain text body
  const plainBody = `${reportType === "phishing" ? "PHISHING REPORT" : "INVESTIGATION REQUEST"}
Reported: ${reportTime}
Reporter: ${reporter}

SUSPICIOUS EMAIL DETAILS:
• From: ${emailData.from}
• To: ${emailData.to}${emailData.replyTo ? `\n• Reply-To: ${emailData.replyTo}` : ""}
• Subject: ${emailData.subject}
• Date: ${emailDate}${emailData.messageId ? `\n• Message-ID: ${emailData.messageId}` : ""}${emailData.userAgent ? `\n• User-Agent: ${emailData.userAgent}` : ""}
• Attachments: ${attachmentInfo}

Original email attached as .eml file with full headers preserved.${actionRequired}`;

  const investigationAlert =
    reportType === "investigation"
      ? `<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; margin: 20px 0; border-left: 4px solid #fbbc04;">
        <strong>⚠️ ACTION REQUIRED:</strong> User has requested investigation and expects a response.
      </div>`
      : "";

  // HTML body
  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: ${reportType === "phishing" ? "#d93025" : "#fbbc04"};">
    ${reportType === "phishing" ? "PHISHING REPORT" : "INVESTIGATION REQUEST"}
  </h2>

  <div style="background: #f5f5f5; padding: 10px; margin: 10px 0;">
    <strong>Reported:</strong> ${escapeHtml(reportTime)}<br>
    <strong>Reporter:</strong> ${escapeHtml(reporter)}
  </div>

  ${investigationAlert}

  <h3>Suspicious Email Details</h3>
  <table style="border-collapse: collapse; width: 100%;">
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>From:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(emailData.from)}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>To:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(emailData.to)}</td>
    </tr>
    ${
      emailData.replyTo
        ? `<tr style="background: #f5f5f5;">
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Reply-To:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd; color: #d93025;"><strong>${escapeHtml(emailData.replyTo)}</strong></td>
    </tr>`
        : ""
    }
    <tr${emailData.replyTo ? "" : ' style="background: #f5f5f5;"'}>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(emailData.subject)}</td>
    </tr>
    <tr${emailData.replyTo ? ' style="background: #f5f5f5;"' : ""}>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(emailDate)}</td>
    </tr>
    ${
      emailData.messageId
        ? `<tr${emailData.replyTo ? "" : ' style="background: #f5f5f5;"'}>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message-ID:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 12px;">${escapeHtml(emailData.messageId)}</td>
    </tr>`
        : ""
    }
    ${
      emailData.userAgent
        ? `<tr style="background: #f5f5f5;">
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>User-Agent:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(emailData.userAgent)}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Attachments:</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${attachmentInfoHtml}</td>
    </tr>
  </table>

  <p style="margin-top: 20px; padding: 10px; background: #e8f5e9; border-left: 4px solid #34a853;">
    <strong>Attachment:</strong> Original email (.eml) with full headers preserved.
  </p>
</div>
`;

  return { plainBody, htmlBody };
}

/**
 * Creates success notification
 */
function createSuccessCard(reportType) {
  const isInvestigation = reportType === "investigation";
  const title = isInvestigation
    ? "Investigation Requested"
    : "Phishing Reported";
  const subtitle = isInvestigation
    ? "Your request has been sent. The security team will contact you soon."
    : "Thank you for reporting. The security team has been notified.";

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle(title).setSubtitle(subtitle),
    )
    .build();

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .setNotification(
      CardService.newNotification()
        .setType(CardService.NotificationType.INFO)
        .setText("Report sent successfully!"),
    )
    .build();
}

/**
 * Creates error notification
 */
function createErrorCard(message) {
  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Error")
        .setSubtitle("Unable to send report"),
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText(message))
        .addWidget(
          CardService.newButtonSet().addButton(
            CardService.newTextButton()
              .setText("Try Again")
              .setOnClickAction(
                CardService.newAction().setFunctionName("buildAddOn"),
              ),
          ),
        ),
    )
    .build();

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

/**
 * Maps errors to user-friendly messages
 */
function getErrorMessage(error) {
  const errorMap = {
    quota: "Daily email limit reached. Try again tomorrow.",
    permission: "Permission denied. Contact your administrator.",
    invalid: "Invalid configuration. Contact support.",
  };

  const errorStr = error.toString().toLowerCase();
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorStr.includes(key)) return message;
  }

  return "Unable to send report. Please try again.";
}

/**
 * Utility functions
 */

/**
 * Escapes HTML entities to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return text;

  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return String(text).replace(/[&<>"'\/]/g, function (match) {
    return htmlEntities[match];
  });
}

function cleanSubject(subject) {
  if (!subject) return "No Subject";

  // Remove MIME encoded sequences
  return (
    subject
      .replace(/=\?[^?]+\?[BbQq]\?[^?]*\?=/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "No Subject"
  );
}

function cleanEmailAddress(sender) {
  if (!sender) return "Unknown Sender";

  // Extract email from "Name <email@domain.com>" format
  const match = sender.match(/<([^>]+@[^>]+)>/);
  return match ? match[1] : sender.trim();
}
