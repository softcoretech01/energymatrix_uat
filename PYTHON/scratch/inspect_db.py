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

    # Inspect number_format table
    try:
        cursor.execute("DESCRIBE number_format")
        print("\n--- NUMBER_FORMAT COLUMNS ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error describing number_format:", e)

    # Inspect master_windmill table
    try:
        cursor.execute("DESCRIBE master_windmill")
        print("\n--- MASTER_WINDMILL COLUMNS ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error describing master_windmill:", e)

    # Fetch configuration data
    try:
        cursor.execute("SELECT * FROM configuration")
        print("\n--- CONFIGURATION DATA ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error fetching configuration data:", e)

    # Fetch number_format data
    try:
        cursor.execute("SELECT * FROM number_format")
        print("\n--- NUMBER_FORMAT DATA ---")
        for r in cursor.fetchall():
            print(r)
    except Exception as e:
        print("Error fetching number_format data:", e)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    test()
