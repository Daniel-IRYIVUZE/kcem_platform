"""services/email_service.py — SMTP email delivery service.

Uses the configured SMTP server to send transactional emails.
All functions return True on success, False on failure (never raise).
"""
from __future__ import annotations

import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


# ── Core send function ─────────────────────────────────────────────────────────

def send_email(*, to_email: str, subject: str, html_body: str, text_body: str = "") -> bool:
    """Send an email via SMTP.

    Returns True on success, logs the error and returns False on failure.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.EMAIL_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())

        logger.info("Email sent to %s | subject: %s", to_email, subject)
        return True

    except Exception as exc:
        logger.warning("Failed to send email to %s: %s", to_email, exc)
        return False


# ── Email templates ────────────────────────────────────────────────────────────

def send_driver_welcome_email(*, email: str, full_name: str, temp_password: str) -> bool:
    """Send a welcome email to a newly registered driver with their temp credentials."""
    subject = "Welcome to EcoTrade Rwanda – Your Driver Account"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:32px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">🌿 EcoTrade Rwanda</h1>
                <p style="color:#cffafe;margin:8px 0 0;font-size:14px;">Waste Collection Driver Portal</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#1e293b;margin:0 0 16px;font-size:20px;">Hi {full_name},</h2>
                <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
                  Your driver account has been created by your recycling company on the
                  <strong>EcoTrade Rwanda</strong> platform. You can now log in and start
                  accepting waste collection assignments.
                </p>
                <!-- Credentials box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:24px;">
                      <p style="color:#0c4a6e;font-weight:700;margin:0 0 12px;font-size:15px;">
                        🔐 Your Login Credentials
                      </p>
                      <table cellpadding="4">
                        <tr>
                          <td style="color:#64748b;font-size:14px;padding-right:12px;">Email:</td>
                          <td style="color:#0f172a;font-weight:600;font-size:14px;">{email}</td>
                        </tr>
                        <tr>
                          <td style="color:#64748b;font-size:14px;padding-right:12px;">Password:</td>
                          <td style="color:#0f172a;font-weight:700;font-size:16px;font-family:monospace;
                                     background:#e0f2fe;padding:4px 8px;border-radius:4px;">{temp_password}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- Warning -->
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="color:#c2410c;margin:0;font-size:14px;">
                        ⚠️ <strong>Important:</strong> This is a temporary password. You will be asked to
                        change it the first time you log in. Please keep your credentials secure.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="color:#475569;line-height:1.6;margin:0 0 32px;">
                  Log in at <a href="http://localhost:5173" style="color:#0891b2;">EcoTrade Rwanda</a>
                  to view your assigned collections, update your location, and manage your profile.
                </p>
                <p style="color:#94a3b8;font-size:13px;margin:0;">
                  If you have any questions, contact your recycling company manager or
                  reply to this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">
                  © 2025 EcoTrade Rwanda · Kigali, Rwanda
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    text = (
        f"Welcome to EcoTrade Rwanda, {full_name}!\n\n"
        f"Your driver account has been created.\n\n"
        f"Email: {email}\n"
        f"Temporary Password: {temp_password}\n\n"
        f"Please log in and change your password immediately.\n"
    )
    return send_email(to_email=email, subject=subject, html_body=html, text_body=text)


def send_driver_assigned_notification_email(
    *,
    email: str,
    driver_name: str,
    hotel_name: str,
    hotel_address: str,
    waste_type: str,
    volume: float,
    scheduled_date: str | None,
    collection_id: int,
) -> bool:
    """Notify a driver by email when they are assigned to a new collection."""
    subject = f"New Collection Assigned – {hotel_name}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" align="center"
             style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:28px 36px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">🚛 New Collection Assigned</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="color:#1e293b;font-size:16px;">Hi <strong>{driver_name}</strong>,</p>
            <p style="color:#475569;">You have been assigned a new waste collection:</p>
            <table width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                                        margin:16px 0;padding:20px;" cellpadding="4">
              <tr><td style="color:#64748b;width:130px;">📍 Location:</td>
                  <td style="color:#0f172a;font-weight:600;">{hotel_name}</td></tr>
              <tr><td style="color:#64748b;">🏠 Address:</td>
                  <td style="color:#0f172a;">{hotel_address}</td></tr>
              <tr><td style="color:#64748b;">♻️ Waste Type:</td>
                  <td style="color:#0f172a;">{waste_type}</td></tr>
              <tr><td style="color:#64748b;">⚖️ Volume:</td>
                  <td style="color:#0f172a;">{volume} kg</td></tr>
              <tr><td style="color:#64748b;">📅 Scheduled:</td>
                  <td style="color:#0f172a;">{scheduled_date or 'TBD'}</td></tr>
              <tr><td style="color:#64748b;"># Collection:</td>
                  <td style="color:#0f172a;font-family:monospace;">#{collection_id}</td></tr>
            </table>
            <p style="color:#475569;">Log in to your driver dashboard to view full details and update your status.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
              © 2025 EcoTrade Rwanda
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    return send_email(to_email=email, subject=subject, html_body=html)


def send_driver_reminder_email(*, email: str, full_name: str, recycler_name: str) -> bool:
    """Send a reminder email to a driver who has not yet logged in to complete their account."""
    subject = "Action Required: Sign In to Complete Your EcoTrade Rwanda Driver Account"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">🌿 EcoTrade Rwanda</h1>
                <p style="color:#fecaca;margin:8px 0 0;font-size:14px;">Driver Account – Action Required</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#1e293b;margin:0 0 16px;font-size:20px;">Hi {full_name},</h2>
                <p style="color:#475569;line-height:1.6;margin:0 0 16px;">
                  Your driver account on <strong>EcoTrade Rwanda</strong> was created by
                  <strong>{recycler_name}</strong>, but you have not signed in yet.
                </p>
                <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
                  Until you sign in, <strong>you cannot be assigned any waste collection routes</strong>.
                  Please log in as soon as possible to activate your account and start accepting assignments.
                </p>
                <!-- CTA -->
                <div style="text-align:center;margin:32px 0;">
                  <a href="https://ecotrade.rw/login"
                     style="display:inline-block;background:linear-gradient(135deg,#0891b2,#0e7490);
                            color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;
                            padding:14px 36px;border-radius:8px;">
                    Sign In Now →
                  </a>
                </div>
                <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                  If you did not expect this email or believe this was sent in error,
                  please contact <strong>{recycler_name}</strong> or reply to this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
                  © 2025 EcoTrade Rwanda
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    return send_email(to_email=email, subject=subject, html_body=html)


def send_driver_wrong_direction_email(
    *,
    email: str,
    full_name: str,
    recycler_name: str,
    message: str,
    destination: str | None = None,
    distance_km: float | None = None,
) -> bool:
    """Send an alert email when a driver appears to be heading in the wrong direction."""
    subject = "Route Alert: Please Check Your Current Direction"
    dest_block = f"""
      <tr><td style=\"color:#64748b;width:150px;\">Destination:</td>
          <td style=\"color:#0f172a;font-weight:600;\">{destination}</td></tr>
    """ if destination else ""
    dist_block = f"""
      <tr><td style=\"color:#64748b;\">Distance from destination:</td>
          <td style=\"color:#0f172a;font-weight:600;\">{distance_km:.1f} km</td></tr>
    """ if distance_km is not None else ""

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" align="center"
             style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:28px 36px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">⚠️ Route Direction Alert</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="color:#1e293b;font-size:16px;">Hi <strong>{full_name}</strong>,</p>
            <p style="color:#475569;line-height:1.6;">
              {recycler_name} noticed that you may be heading away from your assigned route.
              Please review your route and continue toward your assigned destination.
            </p>
            <table width="100%" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
                                        margin:16px 0;padding:16px;" cellpadding="4">
              {dest_block}
              {dist_block}
              <tr><td style="color:#64748b;vertical-align:top;">Message:</td>
                  <td style="color:#0f172a;">{message}</td></tr>
            </table>
            <p style="color:#475569;line-height:1.6;">
              Open your driver dashboard to see your active assignments and navigation details.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
              © 2025 EcoTrade Rwanda
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    return send_email(to_email=email, subject=subject, html_body=html)
