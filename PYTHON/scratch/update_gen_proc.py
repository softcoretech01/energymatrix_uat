import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def update_proc():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='windmill'
    )
    try:
        with conn.cursor() as cursor:
            print("Updating sp_get_generation...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_get_generation")
            cursor.execute("""
CREATE PROCEDURE `sp_get_generation`(
    IN p_from_date DATE,
    IN p_to_date DATE,
    IN p_keyword VARCHAR(255)
)
BEGIN
    SELECT 
        t.*, 
        mw.windmill_name,
        mw.minimum_level_generation
    FROM windmill.windmill_daily_transaction t
    LEFT JOIN masters.master_windmill mw ON t.windmill_number COLLATE utf8mb4_unicode_ci = mw.windmill_number COLLATE utf8mb4_unicode_ci
    WHERE (p_from_date IS NULL OR t.transaction_date >= p_from_date)
      AND (p_to_date IS NULL OR t.transaction_date <= p_to_date)
      AND (p_keyword IS NULL OR t.windmill_number LIKE CONCAT('%', p_keyword, '%') COLLATE utf8mb4_unicode_ci)
    ORDER BY t.transaction_date DESC;
END
            """)
            conn.commit()
            print("Procedure updated successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    update_proc()
