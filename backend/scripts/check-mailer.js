import { verifyMailer } from "../utils/mailer.js";

try {
  await verifyMailer();
  console.log("Mailer check OK. SMTP login and connection are working.");
} catch (error) {
  console.error("Mailer check failed.");
  console.error(error?.code || "NO_CODE");
  console.error(error?.responseCode || "NO_RESPONSE_CODE");
  console.error(error?.message || error);
  process.exit(1);
}
