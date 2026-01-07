import smtplib
from email.message import EmailMessage
import os

def send_email(to: str, subject: str, content: str):
    """
    Send email with proper error handling.
    Raises exception if email cannot be sent.
    """
    try:
        # Check if SMTP settings are configured
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = os.getenv("SMTP_PORT")
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        smtp_from = os.getenv("SMTP_FROM")
        
        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from]):
            print("Warning: SMTP settings not fully configured. Skipping email.")
            return False
        
        msg = EmailMessage()
        msg["From"] = smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(content)

        with smtplib.SMTP(smtp_host, int(smtp_port), timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        print(f"Email sent successfully to {to}")
        return True
        
    except smtplib.SMTPException as e:
        print(f"SMTP error sending email to {to}: {e}")
        raise Exception(f"Failed to send email: {str(e)}")
    except Exception as e:
        print(f"Error sending email to {to}: {e}")
        raise Exception(f"Failed to send email: {str(e)}")