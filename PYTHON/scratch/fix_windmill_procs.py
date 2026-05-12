import pymysql
import os
from dotenv import load_dotenv

load_dotenv('d:/DOWNLOADS/energymatrix_uat/PYTHON/.env')

def fix_procs():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database='masters'
    )
    try:
        with conn.cursor() as cursor:
            # 1. Fix sp_add_windmill
            print("Fixing sp_add_windmill...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_add_windmill")
            cursor.execute("""
CREATE PROCEDURE `sp_add_windmill`(
  IN p_type VARCHAR(255),
  IN p_windmill_number VARCHAR(255),
  IN p_windmill_name VARCHAR(255),
  IN p_edc_circle_id INT,
  IN p_kva_id INT,
  IN p_capacity_mw_id INT,
  IN p_windmill_capacity DECIMAL(12,2),
  IN p_transmission_loss DECIMAL(10,2),
  IN p_ae_number VARCHAR(255),
  IN p_ae_name VARCHAR(255),
  IN p_status VARCHAR(50),
  IN p_operator_name VARCHAR(255),
  IN p_operator_number VARCHAR(50),
  IN p_contact_number VARCHAR(20),
  IN p_amc_type VARCHAR(50),
  IN p_amc_head VARCHAR(255),
  IN p_amc_head_contact VARCHAR(50),
  IN p_amc_from_date DATE,
  IN p_amc_to_date DATE,
  IN p_insurance_policy_number VARCHAR(255),
  IN p_insurance_person_name VARCHAR(255),
  IN p_insurance_person_phone VARCHAR(50),
  IN p_insurance_from_date DATE,
  IN p_insurance_to_date DATE,
  IN p_minimum_level_generation DECIMAL(12,2),
  IN p_allotment_threshold DECIMAL(12,2),
  IN p_units_expiring VARCHAR(50),
  IN p_portal_url VARCHAR(250),
  IN p_username VARCHAR(50),
  IN p_password VARCHAR(100),
  IN p_is_submitted TINYINT,
  IN p_created_by INT
)
BEGIN
  INSERT INTO master_windmill (
    type, windmill_number, windmill_name, status,
    kva_id, transmission_loss, capacity_mw_id, edc_circle_id,
    ae_name, ae_number, operator_name, operator_number, contact_number,
    amc_type, amc_head, amc_head_contact, amc_from_date, amc_to_date,
    insurance_policy_number, insurance_company_name, insurance_company_number,
    insurance_from_date, insurance_to_date,
    minimum_level_generation, allotment_threshold, units_expiring,
    open_access_portal, portal_username, portal_password,
    is_submitted, created_by, created_at
  )
  VALUES (
    p_type, p_windmill_number, p_windmill_name, p_status,
    p_kva_id, p_transmission_loss, p_capacity_mw_id, p_edc_circle_id,
    p_ae_name, p_ae_number, p_operator_name, p_operator_number, p_contact_number,
    p_amc_type, p_amc_head, p_amc_head_contact, p_amc_from_date, p_amc_to_date,
    p_insurance_policy_number, p_insurance_person_name, p_insurance_person_phone,
    p_insurance_from_date, p_insurance_to_date,
    p_minimum_level_generation, p_allotment_threshold, p_units_expiring,
    p_portal_url, p_username, p_password,
    p_is_submitted, p_created_by, NOW()
  );
END
            """)

            # 2. Fix sp_update_windmill
            print("Fixing sp_update_windmill...")
            cursor.execute("DROP PROCEDURE IF EXISTS sp_update_windmill")
            cursor.execute("""
CREATE PROCEDURE `sp_update_windmill`(
  IN p_windmill_id INT,
  IN p_type VARCHAR(255),
  IN p_windmill_number VARCHAR(255),
  IN p_windmill_name VARCHAR(255),
  IN p_edc_circle_id INT,
  IN p_kva_id INT,
  IN p_capacity_mw_id INT,
  IN p_windmill_capacity DECIMAL(12,2),
  IN p_transmission_loss DECIMAL(10,2),
  IN p_ae_number VARCHAR(255),
  IN p_ae_name VARCHAR(255),
  IN p_status VARCHAR(50),
  IN p_operator_name VARCHAR(255),
  IN p_operator_number VARCHAR(50),
  IN p_contact_number VARCHAR(20),
  IN p_amc_type VARCHAR(50),
  IN p_amc_head VARCHAR(255),
  IN p_amc_head_contact VARCHAR(50),
  IN p_amc_from_date DATE,
  IN p_amc_to_date DATE,
  IN p_insurance_policy_number VARCHAR(255),
  IN p_insurance_person_name VARCHAR(255),
  IN p_insurance_person_phone VARCHAR(50),
  IN p_insurance_from_date DATE,
  IN p_insurance_to_date DATE,
  IN p_minimum_level_generation DECIMAL(12,2),
  IN p_allotment_threshold DECIMAL(12,2),
  IN p_units_expiring VARCHAR(50),
  IN p_portal_url VARCHAR(250),
  IN p_username VARCHAR(50),
  IN p_password VARCHAR(100),
  IN p_is_submitted TINYINT,
  IN p_modified_by INT
)
BEGIN
  UPDATE master_windmill SET
    type = p_type,
    windmill_number = p_windmill_number,
    windmill_name = p_windmill_name,
    status = p_status,
    kva_id = p_kva_id,
    transmission_loss = p_transmission_loss,
    capacity_mw_id = p_capacity_mw_id,
    edc_circle_id = p_edc_circle_id,
    ae_name = p_ae_name,
    ae_number = p_ae_number,
    operator_name = p_operator_name,
    operator_number = p_operator_number,
    contact_number = p_contact_number,
    amc_type = p_amc_type,
    amc_head = p_amc_head,
    amc_head_contact = p_amc_head_contact,
    amc_from_date = p_amc_from_date,
    amc_to_date = p_amc_to_date,
    insurance_policy_number = p_insurance_policy_number,
    insurance_company_name = p_insurance_person_name,
    insurance_company_number = p_insurance_person_phone,
    insurance_from_date = p_insurance_from_date,
    insurance_to_date = p_insurance_to_date,
    minimum_level_generation = p_minimum_level_generation,
    allotment_threshold = p_allotment_threshold,
    units_expiring = p_units_expiring,
    open_access_portal = p_portal_url,
    portal_username = p_username,
    portal_password = p_password,
    is_submitted = p_is_submitted,
    modified_by = p_modified_by,
    modified_at = NOW()
  WHERE id = p_windmill_id;
END
            """)
            
            conn.commit()
            print("Procedures fixed successfully.")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_procs()
