import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

DB_HOST = os.getenv("DB_HOST", "187.127.131.38")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Ener9y#8154")

def test():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database="masters"
    )
    cursor = conn.cursor()
    
    # Inspect configuration table
    try:
        cursor.execute("DESCRIBE configuration")
        print("--- CONFIGURATION COLUMNS ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error describing configuration:", e)

    # Inspect master_windmill table
    try:
        cursor.execute("DESCRIBE master_windmill")
        print("\n--- MASTER_WINDMILL COLUMNS ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error describing master_windmill:", e)

    # Fetch a row from configuration
    try:
        cursor.execute("SELECT * FROM configuration LIMIT 1")
        print("\n--- CONFIGURATION DATA ---")
        print(cursor.fetchone())
    except Exception as e:
        print("Error fetching configuration data:", e)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    test()
