import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import config

port = 587
smtp_server = "smtp.gmail.com"
sender_email = "chaoticsoftwares@gmail.com"
receiver_email = "svarjun1997@gmail.com"
password = config.SMTP_PASSWORD

message = MIMEMultipart()
message["Subject"] = "Arjun's birthday is today!"
message["From"] = sender_email
message["To"] = receiver_email

html = """\
<html>
  <body>
    <p>This is a birthday remider message.</p>
    <p>You received this because you set up a birthday reminder at <a href="www.hexadecimalchaos.com/toolbox/bday">HexDecChaos</a>.</p>
    <p>If you wish to stop receiving these messages, update notifications settings.</p>
  </body>
</html>
"""

mime_part = MIMEText(html, "html")

message.attach(mime_part)

context = ssl.create_default_context()
with smtplib.SMTP(smtp_server, port) as server:
    server.ehlo()
    server.starttls(context=context)
    server.ehlo()
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, message.as_string())

    