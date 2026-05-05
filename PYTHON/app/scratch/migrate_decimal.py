import pymysql
from app.database import get_connection

def run_migration():
    conn = get_connection(db_name="masters")
    cursor = conn.cursor()
    try:
        print("Altering table master_consumption_chargers...")
        cursor.execute("ALTER TABLE master_consumption_chargers MODIFY COLUMN cost DECIMAL(18,4);")
        cursor.execute("ALTER TABLE master_consumption_chargers MODIFY COLUMN discount_charges DECIMAL(18,4);")
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
