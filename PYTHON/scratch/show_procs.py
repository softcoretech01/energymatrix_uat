import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

DB_HOST = os.getenv("DB_HOST", "187.127.131.38")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Ener9y#8154")

def show_proc(proc_name):
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database="masters"
    )
    cursor = conn.cursor()
    try:
        cursor.execute(f"SHOW CREATE PROCEDURE {proc_name}")
        res = cursor.fetchone()
        if res:
            print(f"\n=====================================")
            print(f"PROCEDURE: {proc_name}")
            print(f"=====================================")
            print(res[2])
    except Exception as e:
        print(f"Error showing procedure {proc_name}: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    show_proc("sp_get_total_shares")
    show_proc("sp_get_total_shares_by_id")
    show_proc("sp_update_total_share")
    show_proc("sp_upsert_total_shares")
    show_proc("sp_check_configuration_row_exists")
