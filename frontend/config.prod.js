/**
 * Lambda — Frontend Environment Config (PRODUCTION TEMPLATE)
 *
 * On the EC2 instance, run this command ONCE after deployment:
 *
 *   cp frontend/config.prod.js frontend/config.js
 *
 * Then edit the copy and replace REPLACE_WITH_EC2_PUBLIC_IP
 * with the actual public IP Elastic IP of the EC2 instance,
 * for example:  http://13.233.45.67
 *
 * Do NOT edit this template file itself — keep it as a
 * reference so the team always knows what production needs.
 */
window.APP_CONFIG = {
  /** ← Replace this with the real EC2 public IP before deploying */
  API_BASE_URL: 'http://REPLACE_WITH_EC2_PUBLIC_IP',

  /** Always false in production — the real backend is live */
  MOCK_MODE: false,
};
