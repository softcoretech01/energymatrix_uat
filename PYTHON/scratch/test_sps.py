import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

DB_HOST = os.getenv("DB_HOST", "187.127.131.38")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Ener9y#8154")
DB_NAME = os.getenv("DB_NAME", "masters")

def test():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Test 1: Fetch formats
        print("\n--- TEST 1: sp_get_number_formats ---")
        cursor.execute("CALL sp_get_number_formats()")
        formats = cursor.fetchall()
        for f in formats:
            print(f)

        # Test 2: Get current configuration
        print("\n--- TEST 2: Current configuration format ID ---")
        cursor.execute("CALL sp_get_total_shares_by_id(%s)", (1,))
        config = cursor.fetchone()
        print("Original config:", config)
        orig_format_id = config.get("number_format_id")

        # Test 3: Update format ID to 2 (Germany)
        print("\n--- TEST 3: Update configuration format ID to 2 (Germany) ---")
        cursor.execute("CALL sp_update_number_format_id(%s, %s)", (1, 2))
        conn.commit()

        # Check configuration
        cursor.execute("CALL sp_get_total_shares_by_id(%s)", (1,))
        updated_config = cursor.fetchone()
        print("Updated config (Germany):", updated_config)
        assert updated_config.get("number_format_id") == 2, "Failed to update to Germany"

        # Test 4: Reset format ID to original value
        print(f"\n--- TEST 4: Resetting configuration format ID to {orig_format_id} ---")
        cursor.execute("CALL sp_update_number_format_id(%s, %s)", (1, orig_format_id))
        conn.commit()

        # Check configuration
        cursor.execute("CALL sp_get_total_shares_by_id(%s)", (1,))
        reset_config = cursor.fetchone()
        print("Reset config:", reset_config)
        assert reset_config.get("number_format_id") == orig_format_id, "Failed to reset"

        print("\nAll stored procedure tests completed successfully!")

    except Exception as e:
        conn.rollback()
        print("Error during test execution:", e)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    test()
