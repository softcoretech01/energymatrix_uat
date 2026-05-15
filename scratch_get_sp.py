import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="d:/DOWNLOADS/energymatrix_uat/PYTHON/.env")

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "root"),
    database="windmill"
)
cursor = conn.cursor()
cursor.execute("SHOW CREATE PROCEDURE sp_get_client_invoice_metadata")
row = cursor.fetchone()
print("sp_get_client_invoice_metadata:", row[2])

cursor.execute("SHOW CREATE PROCEDURE sp_get_client_invoice_details")
row = cursor.fetchone()
print("\nsp_get_client_invoice_details:", row[2])
