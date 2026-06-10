import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()
server_port = os.getenv('SERVER_PORT')
email_user = os.getenv('EMAIL_USER')
app_password = os.getenv('APP_PASSWORD')


def send_email(subject: str, body: str, receiver: str):

    message = MIMEMultipart()
    message["From"] = email_user
    message["To"] = receiver
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))
    
    try:
        email_server = smtplib.SMTP("smtp.gmail.com", server_port)
        email_server.starttls()
        email_server.login(email_user, app_password)
        email_server.sendmail(email_user, receiver, message.as_string())
    except smtplib.SMTPException as e:
        print(f"Error SMTP: {e}")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")