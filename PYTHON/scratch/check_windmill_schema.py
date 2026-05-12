import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def check_schema():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='masters'
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("DESCRIBE master_windmill")
            columns = cursor.fetchall()
            for col in columns:
                print(col)
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
