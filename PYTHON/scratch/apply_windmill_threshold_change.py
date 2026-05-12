import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def update_db():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='masters'
    )
    try:
        with conn.cursor() as cursor:
            # 1. Add column if not exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'masters' 
                AND table_name = 'master_windmill' 
                AND column_name = 'allotment_threshold'
            """)
            if cursor.fetchone()[0] == 0:
                print("Adding column 'allotment_threshold' to 'master_windmill'...")
                cursor.execute("ALTER TABLE master_windmill ADD COLUMN allotment_threshold DECIMAL(12,2) DEFAULT NULL AFTER minimum_level_generation")
            else:
                print("Column 'allotment_threshold' already exists.")

            # 2. Update sp_add_windmill
            print("Updating sp_add_windmill...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_add_windmill")
            cursor.execute("""
CREATE PROCEDURE `sp_add_windmill`(
    IN p_type VARCHAR(50),
    IN p_windmill_number VARCHAR(50),
    IN p_windmill_name VARCHAR(100),
    IN p_edc_circle_id INT,
    IN p_kva_id INT,
    IN p_capacity_mw_id INT,
    IN p_windmill_capacity DECIMAL(12,2),
    IN p_transmission_loss DECIMAL(5,2),
    IN p_ae_number VARCHAR(20),
    IN p_ae_name VARCHAR(100),
    IN p_status VARCHAR(50),
    IN p_operator_name VARCHAR(100),
    IN p_operator_number VARCHAR(20),
    IN p_contact_number VARCHAR(20),
    IN p_amc_type VARCHAR(50),
    IN p_amc_head VARCHAR(100),
    IN p_amc_head_contact VARCHAR(20),
    IN p_amc_from_date DATE,
    IN p_amc_to_date DATE,
    IN p_insurance_policy_number VARCHAR(100),
    IN p_insurance_company_name VARCHAR(100),
    IN p_insurance_company_number BIGINT,
    IN p_insurance_from_date DATE,
    IN p_insurance_to_date DATE,
    IN p_minimum_level_generation DECIMAL(12,2),
    IN p_allotment_threshold DECIMAL(12,2),
    IN p_units_expiring VARCHAR(50),
    IN p_open_access_portal VARCHAR(250),
    IN p_portal_username VARCHAR(50),
    IN p_portal_password VARCHAR(100),
    IN p_is_submitted SMALLINT,
    IN p_created_by INT
)
BEGIN
    INSERT INTO master_windmill (
        type, windmill_number, windmill_name, edc_circle_id, kva_id, capacity_mw_id,
        windmill_capacity, transmission_loss, ae_number, ae_name, status,
        operator_name, operator_number, contact_number, amc_type, amc_head,
        amc_head_contact, amc_from_date, amc_to_date, insurance_policy_number,
        insurance_company_name, insurance_company_number, insurance_from_date,
        insurance_to_date, minimum_level_generation, allotment_threshold,
        units_expiring, open_access_portal, portal_username, portal_password,
        is_submitted, created_by, created_at
    ) VALUES (
        p_type, p_windmill_number, p_windmill_name, p_edc_circle_id, p_kva_id, p_capacity_mw_id,
        p_windmill_capacity, p_transmission_loss, p_ae_number, p_ae_name, p_status,
        p_operator_name, p_operator_number, p_contact_number, p_amc_type, p_amc_head,
        p_amc_head_contact, p_amc_from_date, p_amc_to_date, p_insurance_policy_number,
        p_insurance_company_name, p_insurance_company_number, p_insurance_from_date,
        p_insurance_to_date, p_minimum_level_generation, p_allotment_threshold,
        p_units_expiring, p_open_access_portal, p_portal_username, p_portal_password,
        p_is_submitted, p_created_by, NOW()
    );
END
            """)

            # 3. Update sp_update_windmill
            print("Updating sp_update_windmill...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_update_windmill")
            cursor.execute("""
CREATE PROCEDURE `sp_update_windmill`(
    IN p_id BIGINT,
    IN p_type VARCHAR(50),
    IN p_windmill_number VARCHAR(50),
    IN p_windmill_name VARCHAR(100),
    IN p_edc_circle_id INT,
    IN p_kva_id INT,
    IN p_capacity_mw_id INT,
    IN p_windmill_capacity DECIMAL(12,2),
    IN p_transmission_loss DECIMAL(5,2),
    IN p_ae_number VARCHAR(20),
    IN p_ae_name VARCHAR(100),
    IN p_status VARCHAR(50),
    IN p_operator_name VARCHAR(100),
    IN p_operator_number VARCHAR(20),
    IN p_contact_number VARCHAR(20),
    IN p_amc_type VARCHAR(50),
    IN p_amc_head VARCHAR(100),
    IN p_amc_head_contact VARCHAR(20),
    IN p_amc_from_date DATE,
    IN p_amc_to_date DATE,
    IN p_insurance_policy_number VARCHAR(100),
    IN p_insurance_company_name VARCHAR(100),
    IN p_insurance_company_number BIGINT,
    IN p_insurance_from_date DATE,
    IN p_insurance_to_date DATE,
    IN p_minimum_level_generation DECIMAL(12,2),
    IN p_allotment_threshold DECIMAL(12,2),
    IN p_units_expiring VARCHAR(50),
    IN p_open_access_portal VARCHAR(250),
    IN p_portal_username VARCHAR(50),
    IN p_portal_password VARCHAR(100),
    IN p_is_submitted SMALLINT,
    IN p_modified_by INT
)
BEGIN
    UPDATE master_windmill SET
        type = p_type,
        windmill_number = p_windmill_number,
        windmill_name = p_windmill_name,
        edc_circle_id = p_edc_circle_id,
        kva_id = p_kva_id,
        capacity_mw_id = p_capacity_mw_id,
        windmill_capacity = p_windmill_capacity,
        transmission_loss = p_transmission_loss,
        ae_number = p_ae_number,
        ae_name = p_ae_name,
        status = p_status,
        operator_name = p_operator_name,
        operator_number = p_operator_number,
        contact_number = p_contact_number,
        amc_type = p_amc_type,
        amc_head = p_amc_head,
        amc_head_contact = p_amc_head_contact,
        amc_from_date = p_amc_from_date,
        amc_to_date = p_amc_to_date,
        insurance_policy_number = p_insurance_policy_number,
        insurance_company_name = p_insurance_company_name,
        insurance_company_number = p_insurance_company_number,
        insurance_from_date = p_insurance_from_date,
        insurance_to_date = p_insurance_to_date,
        minimum_level_generation = p_minimum_level_generation,
        allotment_threshold = p_allotment_threshold,
        units_expiring = p_units_expiring,
        open_access_portal = p_open_access_portal,
        portal_username = p_portal_username,
        portal_password = p_portal_password,
        is_submitted = p_is_submitted,
        modified_by = p_modified_by,
        modified_at = NOW()
    WHERE id = p_id;
END
            """)
            
            # sp_get_windmill_by_id doesn't need update if it uses SELECT *
            # But let's check it.
            cursor.execute("SHOW CREATE PROCEDURE sp_get_windmill_by_id")
            create_proc = cursor.fetchone()[2]
            if "SELECT *" not in create_proc:
                print("sp_get_windmill_by_id might need update...")
                # It usually uses SELECT * in this project.
            
            conn.commit()
            print("Database updated successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    update_db()
