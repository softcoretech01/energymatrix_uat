DELIMITER //

-- =============================================
-- DATABASE: windmill
-- =============================================
USE windmill //

-- 16. Get Reconciliation System Charges from Actual Table
DROP PROCEDURE IF EXISTS windmill.sp_get_reconciliation_system_charges //
CREATE DEFINER=`root`@`%` PROCEDURE windmill.sp_get_reconciliation_system_charges(
    IN p_client_eb_id INT
)
BEGIN
    SELECT 
        a.energy_number, 
        a.calculated_wheeling_value,
        ebac.wheeling_charges
    FROM windmill.actual a
    LEFT JOIN windmill.eb_bill_adjustment_charges ebac 
      ON a.client_eb_id = ebac.eb_bill_header_id 
     AND a.energy_number = ebac.energy_number
    WHERE a.client_eb_id = p_client_eb_id;
END //

-- 17. Get client invoice metadata (IDs, month, year, sums of charges with breakdown)
DROP PROCEDURE IF EXISTS windmill.sp_get_client_invoice_metadata //
CREATE PROCEDURE windmill.sp_get_client_invoice_metadata(IN p_id INT)
BEGIN
    DECLARE v_cust_id INT;
    DECLARE v_service_id INT;
    DECLARE v_year INT;
    DECLARE v_month_name VARCHAR(20);
    DECLARE v_month_int INT;

    -- Get invoice basics
    SELECT customer_id, service_id, year, month 
    INTO v_cust_id, v_service_id, v_year, v_month_name
    FROM windmill.client_invoice WHERE id = p_id;

    -- Convert month name to int
    SET v_month_int = CASE v_month_name
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3 
        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9 
        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
        ELSE 0 END;

    SELECT 
        v_cust_id as customer_id, 
        v_service_id as service_id, 
        v_month_name as month, 
        v_year as year,
        (SELECT IFNULL(per_cost_unit, 0) FROM masters.customer_service WHERE id = v_service_id) as invoice_constant,
        
        -- Sum Generated Units
        (SELECT IFNULL(SUM(ead.allocated), 0)
         FROM windmill.energy_allotment_header eah
         JOIN windmill.energy_allotment_details ead ON eah.allocation_id = ead.allocation_id
         WHERE eah.customer_id = v_cust_id AND eah.service_id = v_service_id
           AND eah.year = v_year AND eah.month = v_month_int) as generated_units,

        -- Breakdown for charges (Windmill: charge_amount, Solar: allocation)
        -- Meter (1)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 1) as charge_meter_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 1) as charge_meter_solar,

        -- O&M (2)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 2) as charge_om_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 2) as charge_om_solar,

        -- Trans (3)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 3) as charge_trans_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 3) as charge_trans_solar,

        -- Sys Opr (4)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 4) as charge_sys_opr_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 4) as charge_sys_opr_solar,

        -- RkvAh (5)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 5) as charge_rkvah_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 5) as charge_rkvah_solar,

        -- Import (6)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 6) as charge_import_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 6) as charge_import_solar,

        -- Scheduling (7)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 7) as charge_scheduling_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 7) as charge_scheduling_solar,

        -- DSM (9)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 9) as charge_dsm_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 9) as charge_dsm_solar,

        -- Wheeling (10)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND cad.charge_id = 10) as charge_wheeling_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND scad.charge_id = 10) as charge_wheeling_solar
    ;
END //

-- 18. Get Total Self Gen Tax from Actual table
DROP PROCEDURE IF EXISTS windmill.sp_get_actual_tax_total //
CREATE PROCEDURE windmill.sp_get_actual_tax_total(
    IN p_customer_id INT,
    IN p_sc_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT IFNULL(SUM(self_gen_tax), 0) as total_tax
    FROM windmill.actual
    WHERE customer_id = p_customer_id 
      AND sc_id = p_sc_id 
      AND actual_year = p_year 
      AND actual_month = p_month;
END //

-- 19. Get client invoice details
DROP PROCEDURE IF EXISTS windmill.sp_get_client_invoice_details //
CREATE PROCEDURE windmill.sp_get_client_invoice_details(IN p_invoice_id INT)
BEGIN
    SELECT field_name, amount, calculation 
    FROM windmill.client_invoice_details 
    WHERE invoice_id = p_invoice_id;
END //

-- 20. Upsert client invoice detail
DROP PROCEDURE IF EXISTS windmill.sp_upsert_client_invoice_detail //
CREATE PROCEDURE windmill.sp_upsert_client_invoice_detail(
    IN p_invoice_id INT,
    IN p_field_name VARCHAR(100),
    IN p_amount DECIMAL(15,2),
    IN p_calculation VARCHAR(255)
)
BEGIN
    IF EXISTS (SELECT 1 FROM windmill.client_invoice_details WHERE invoice_id = p_invoice_id AND field_name = p_field_name) THEN
        UPDATE windmill.client_invoice_details SET amount = p_amount, calculation = p_calculation WHERE invoice_id = p_invoice_id AND field_name = p_field_name;
    ELSE
        INSERT INTO windmill.client_invoice_details (invoice_id, field_name, amount, calculation) VALUES (p_invoice_id, p_field_name, p_amount, p_calculation);
    END IF;
END //

-- 21. Update client invoice total amount
DROP PROCEDURE IF EXISTS windmill.sp_update_client_invoice_amount //
CREATE PROCEDURE windmill.sp_update_client_invoice_amount(IN p_invoice_id INT, IN p_amount DECIMAL(15,2))
BEGIN
    UPDATE windmill.client_invoice SET amount = p_amount WHERE id = p_invoice_id;
END //

-- 22. Get Reconciliation List (Summary)
DROP PROCEDURE IF EXISTS windmill.sp_get_actual_reconciliation_list //
CREATE PROCEDURE windmill.sp_get_actual_reconciliation_list(IN p_year INT, IN p_month INT)
BEGIN
    SELECT 
        MIN(a.id) AS id, a.client_eb_id, a.actual_year AS year, a.actual_month AS month, 
        mc.customer_name, CAST(cs.service_number AS CHAR) AS service_number, cs.id AS service_id, a.pdf_file_path,
        a.calculated_wheeling_value AS system_wheeling_charge, 'System-Final-Verified' AS source,
        (SELECT SUM(allotment_total) FROM windmill.actual_allotment aa WHERE aa.service_id = a.sc_id AND aa.year = a.actual_year AND aa.month = a.actual_month) as manual_adjusted_total
    FROM windmill.actual a
    JOIN masters.master_customers mc ON a.customer_id = mc.id
    JOIN masters.customer_service cs ON a.sc_id = cs.id
    WHERE a.client_eb_id IS NOT NULL
      AND (p_year IS NULL OR a.actual_year = p_year)
      AND (p_month IS NULL OR a.actual_month = p_month)
    GROUP BY a.actual_year, a.actual_month, a.customer_id, a.sc_id
    ORDER BY a.actual_year DESC, a.actual_month DESC;
END //

-- 23. Delete actual allotment record
DROP PROCEDURE IF EXISTS windmill.sp_delete_actual_allotment //
CREATE PROCEDURE windmill.sp_delete_actual_allotment(IN p_id INT)
BEGIN
    DELETE FROM windmill.actual_allotment WHERE id = p_id;
END //

-- 24. Get EB Bill Header info
DROP PROCEDURE IF EXISTS windmill.sp_get_eb_bill_header_info //
CREATE PROCEDURE windmill.sp_get_eb_bill_header_info(IN p_client_eb_id INT)
BEGIN
    SELECT bill_year, bill_month, sc_id FROM windmill.eb_bill WHERE id = p_client_eb_id;
END //

-- 25. Get manual allotment details for reconciliation
DROP PROCEDURE IF EXISTS windmill.sp_get_manual_allotment_details //
CREATE PROCEDURE windmill.sp_get_manual_allotment_details(
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT mw.windmill_number, aa.allotment_total 
    FROM windmill.actual_allotment aa 
    JOIN masters.master_windmill mw ON aa.windmill_id = mw.id 
    WHERE aa.service_id = p_service_id AND aa.year = p_year AND aa.month = p_month;
END //


-- 26. Get service id by consumer number
DROP PROCEDURE IF EXISTS windmill.sp_get_service_id_by_consumer_no //
CREATE PROCEDURE windmill.sp_get_service_id_by_consumer_no(IN p_consumer_no VARCHAR(255))
BEGIN
    DECLARE v_id INT;
    
    -- Try exact or replaced match
    SELECT id INTO v_id 
    FROM masters.customer_service 
    WHERE CAST(service_number AS CHAR) = p_consumer_no 
       OR REPLACE(CAST(service_number AS CHAR), '-', '') = p_consumer_no
    LIMIT 1;
    
    -- Try stripped match
    IF v_id IS NULL THEN
        SELECT id INTO v_id 
        FROM masters.customer_service 
        WHERE CAST(service_number AS CHAR) = TRIM(LEADING '0' FROM p_consumer_no)
        LIMIT 1;
    END IF;
    
    SELECT v_id as id;
END //

-- 27. Get Customer Service Info
DROP PROCEDURE IF EXISTS windmill.sp_get_customer_service_info //
CREATE PROCEDURE windmill.sp_get_customer_service_info(IN p_sc_id INT)
BEGIN
    SELECT mc.customer_name, cs.service_number, cs.customer_id 
    FROM masters.customer_service cs 
    JOIN masters.master_customers mc ON cs.customer_id = mc.id 
    WHERE cs.id = p_sc_id;
END //

-- 28. Get Windmill Number by ID
DROP PROCEDURE IF EXISTS windmill.sp_get_windmill_number //
CREATE PROCEDURE windmill.sp_get_windmill_number(IN p_id INT)
BEGIN
    SELECT windmill_number FROM masters.master_windmill WHERE id = p_id;
END //

-- 29. Get all Windmill Numbers
DROP PROCEDURE IF EXISTS windmill.sp_get_all_windmill_numbers //
CREATE PROCEDURE windmill.sp_get_all_windmill_numbers()
BEGIN
    SELECT id, windmill_number FROM masters.master_windmill;
END //

DELIMITER ;
