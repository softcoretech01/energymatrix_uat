import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def create_proc():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='windmill'
    )
    try:
        with conn.cursor() as cursor:
            print("Creating sp_update_actual_units...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_update_actual_units")
            cursor.execute("""
CREATE PROCEDURE `sp_update_actual_units`(
    IN p_actual_id INT,
    IN p_updated_unit DECIMAL(12,2),
    IN p_tax_rate DECIMAL(12,4)
)
BEGIN
    DECLARE v_original_unit DECIMAL(12,2);
    DECLARE v_threshold DECIMAL(12,2);
    DECLARE v_windmill_no VARCHAR(50);
    DECLARE v_tax_val DECIMAL(12,2);

    -- Get original units and threshold
    SELECT 
        a.calculated_wheeling_value,
        IFNULL(mw.allotment_threshold, 0),
        a.energy_number
    INTO v_original_unit, v_threshold, v_windmill_no
    FROM windmill.actual a
    LEFT JOIN masters.master_windmill mw ON TRIM(a.energy_number) = TRIM(mw.windmill_number) COLLATE utf8mb4_unicode_ci
    WHERE a.id = p_actual_id;

    -- Validate threshold
    -- If threshold is 100, they can only update up to original + 100
    IF (p_updated_unit > (v_original_unit + v_threshold)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Threshold exceeded';
    END IF;

    -- Calculate tax
    SET v_tax_val = p_updated_unit * p_tax_rate;

    -- Update
    UPDATE windmill.actual 
    SET updated_windmill_unit = p_updated_unit,
        self_gen_tax = v_tax_val
    WHERE id = p_actual_id;
END
            """)
            conn.commit()
            print("Procedure created successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    create_proc()
