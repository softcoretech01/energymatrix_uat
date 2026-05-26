import pymysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

DB_HOST = os.getenv("DB_HOST", "187.127.131.38")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Ener9y#8154")
DB_NAME = os.getenv("DB_NAME", "masters")

def run():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor()
    try:
        # 1. sp_get_number_formats
        print("Creating sp_get_number_formats...")
        cursor.execute("DROP PROCEDURE IF EXISTS sp_get_number_formats")
        cursor.execute("""
            CREATE PROCEDURE sp_get_number_formats()
            BEGIN
                SELECT id, country, example, thousands_separator, decimal_separator FROM masters.number_format;
            END
        """)

        # 2. sp_update_number_format_id
        print("Creating sp_update_number_format_id...")
        cursor.execute("DROP PROCEDURE IF EXISTS sp_update_number_format_id")
        cursor.execute("""
            CREATE PROCEDURE sp_update_number_format_id(
                IN p_id INT,
                IN p_number_format_id INT
            )
            BEGIN
                UPDATE masters.configuration
                SET number_format_id = p_number_format_id,
                    modified_at = NOW()
                WHERE id = p_id;
            END
        """)

        # 3. sp_update_total_share (Modified to include number_format_id)
        print("Re-creating sp_update_total_share...")
        cursor.execute("DROP PROCEDURE IF EXISTS sp_update_total_share")
        cursor.execute("""
            CREATE PROCEDURE sp_update_total_share(
                IN p_id INT,
                IN p_total_company_shares DECIMAL(15,2),
                IN p_investor_shares DECIMAL(15,2),
                IN p_customer_shares DECIMAL(15,2),
                IN p_is_submitted TINYINT,
                IN p_modified_by VARCHAR(255),
                IN p_number_format_id INT
            )
            BEGIN
                UPDATE masters.configuration
                SET total_company_shares=p_total_company_shares,
                    total_investor_shares=p_investor_shares,
                    total_customer_shares=p_customer_shares,
                    is_submitted=p_is_submitted,
                    modified_by=p_modified_by,
                    modified_at=NOW(),
                    number_format_id=p_number_format_id
                WHERE id=p_id;
            END
        """)

        # 4. sp_upsert_total_shares (Modified to include number_format_id)
        print("Re-creating sp_upsert_total_shares...")
        cursor.execute("DROP PROCEDURE IF EXISTS sp_upsert_total_shares")
        cursor.execute("""
            CREATE PROCEDURE sp_upsert_total_shares(
                IN p_total_company_shares INT,
                IN p_total_investor_shares INT,
                IN p_total_customer_shares INT,
                IN p_is_submitted TINYINT,
                IN p_user_id INT,
                IN p_number_format_id INT
            )
            BEGIN
                INSERT INTO masters.configuration (
                    id,
                    total_company_shares,
                    total_investor_shares,
                    total_customer_shares,
                    is_submitted,
                    created_by,
                    created_at,
                    number_format_id
                ) VALUES (
                    1,
                    p_total_company_shares,
                    p_total_investor_shares,
                    p_total_customer_shares,
                    p_is_submitted,
                    p_user_id,
                    NOW(),
                    p_number_format_id
                )
                ON DUPLICATE KEY UPDATE
                    total_company_shares = p_total_company_shares,
                    total_investor_shares = p_total_investor_shares,
                    total_customer_shares = p_total_customer_shares,
                    is_submitted = p_is_submitted,
                    modified_by = p_user_id,
                    modified_at = NOW(),
                    number_format_id = p_number_format_id;
            END
        """)

        conn.commit()
        print("All stored procedures created successfully!")
    except Exception as e:
        conn.rollback()
        print(f"Error during stored procedure creation: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run()
