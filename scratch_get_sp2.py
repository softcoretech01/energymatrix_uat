import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="d:/DOWNLOADS/energymatrix_uat/PYTHON/.env")

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "root"),
    database="masters"
)
cursor = conn.cursor()
cursor.execute("SHOW CREATE PROCEDURE sp_get_active_posted_windmills")
row = cursor.fetchone()
print("sp_get_active_posted_windmills:", row[2])
