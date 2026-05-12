import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def check_data():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='masters'
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT DISTINCT status FROM master_customers")
            statuses = cursor.fetchall()
            print("Customer Statuses:", statuses)
            
            cursor.execute("SELECT DISTINCT status FROM customer_service")
            svc_statuses = cursor.fetchall()
            print("Service Statuses:", svc_statuses)
    finally:
        conn.close()

if __name__ == "__main__":
    check_data()
