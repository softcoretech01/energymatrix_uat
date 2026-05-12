CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_client_invoice_metadata`(
    IN p_invoice_id INT
)
BEGIN
    DECLARE v_cust_id      INT;
    DECLARE v_service_id   INT;
    DECLARE v_year         INT;
    DECLARE v_month_name   VARCHAR(20);
    DECLARE v_month_int    INT;

    SELECT customer_id, service_id, year, month
    INTO   v_cust_id, v_service_id, v_year, v_month_name
    FROM   windmill.client_invoice
    WHERE  id = p_invoice_id;

    SET v_month_int = CASE v_month_name
        WHEN 'January'   THEN 1  WHEN 'February'  THEN 2
        WHEN 'March'     THEN 3  WHEN 'April'     THEN 4
        WHEN 'May'       THEN 5  WHEN 'June'      THEN 6
        WHEN 'July'      THEN 7  WHEN 'August'    THEN 8
        WHEN 'September' THEN 9  WHEN 'October'   THEN 10
        WHEN 'November'  THEN 11 WHEN 'December'  THEN 12
        ELSE 0
    END;

    SELECT
        ci.id,
        ci.invoice_number,
        ci.invoice_date,
        mc.customer_name,
        cs.service_number,
        ci.month,
        ci.year,
        mc.rate_per_unit as invoice_constant,

        -- Meter (C001)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C001') as charge_meter_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C001') as charge_meter_solar,

        -- O&M (C002)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C002') as charge_om_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C002') as charge_om_solar,

        -- Trans (C003)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C003') as charge_trans_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C003') as charge_trans_solar,

        -- Sys Opr (C004)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C004') as charge_sys_opr_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C004') as charge_sys_opr_solar,

        -- RkvAh (C005)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C005') as charge_rkvah_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C005') as charge_rkvah_solar,

        -- Import (C006)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C006') as charge_import_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C006') as charge_import_solar,

        -- Scheduling (C007)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C007') as charge_scheduling_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C007') as charge_scheduling_solar,

        -- DSM (C010)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C010') as charge_dsm_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C010') as charge_dsm_solar,

        -- Wheeling (C009)
        (SELECT IFNULL(SUM(ac.wheeling_charges), 0) FROM windmill.eb_bill_adjustment_charges ac JOIN windmill.eb_bill h ON ac.eb_bill_header_id = h.id WHERE h.customer_id = v_cust_id AND h.sc_id = v_service_id AND h.bill_year = v_year AND h.bill_month = v_month_int) as charge_wheeling_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C009') as charge_wheeling_solar,

        -- Other Charges (C008)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C008') as charge_other_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C008') as charge_other_solar,

        -- Self Generation Tax (C011)
        (
            (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C011') +
            (SELECT IFNULL(SUM(self_gen_tax), 0) FROM windmill.actual WHERE customer_id = v_cust_id AND sc_id = v_service_id AND actual_year = v_year AND actual_month = v_month_int)
        ) as charge_tax_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C011') as charge_tax_solar
    FROM windmill.client_invoice ci
    JOIN masters.master_customers mc ON ci.customer_id = mc.id
    JOIN masters.customer_service cs ON ci.service_id = cs.id
    WHERE ci.id = p_invoice_id;
END