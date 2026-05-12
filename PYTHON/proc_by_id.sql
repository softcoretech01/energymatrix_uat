CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_client_invoice_by_id`(
    IN p_id INT
)
BEGIN
    DECLARE v_service_id   INT;
    DECLARE v_year         INT;
    DECLARE v_month_name   VARCHAR(20);
    DECLARE v_month_num    INT;
    DECLARE v_generated_units  DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_invoice_constant FLOAT DEFAULT 6.80;

    DECLARE v_charge_meter      DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_om         DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_trans      DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_sys_opr    DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_rkvah      DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_import     DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_scheduling DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_dsm        DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_wheeling   DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_charge_tax        DECIMAL(15, 2) DEFAULT 0;
    
    DECLARE v_cust_id INT;

    SELECT ci.service_id, ci.year, ci.month, ci.customer_id
    INTO   v_service_id, v_year, v_month_name, v_cust_id
    FROM   windmill.client_invoice ci
    WHERE  ci.id = p_id
    LIMIT  1;

    SET v_month_num = CASE v_month_name
        WHEN 'January'   THEN 1  WHEN 'February'  THEN 2
        WHEN 'March'     THEN 3  WHEN 'April'     THEN 4
        WHEN 'May'       THEN 5  WHEN 'June'      THEN 6
        WHEN 'July'      THEN 7  WHEN 'August'    THEN 8
        WHEN 'September' THEN 9  WHEN 'October'   THEN 10
        WHEN 'November'  THEN 11 WHEN 'December'  THEN 12
        ELSE 0
    END;

    SELECT COALESCE(SUM(a.updated_windmill_unit), 0)
    INTO   v_generated_units
    FROM   windmill.actual a
    WHERE  a.sc_id        = v_service_id
      AND  a.actual_year  = v_year
      AND  a.actual_month = v_month_num;

    SELECT COALESCE(mc.rate_per_unit, 0.00)
    INTO   v_invoice_constant
    FROM   masters.master_customers mc
    JOIN   windmill.client_invoice ci ON ci.customer_id = mc.id
    WHERE  ci.id = p_id
    LIMIT  1;

    SELECT 
        COALESCE(SUM(CASE WHEN d.charge_id = 1  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 2  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 3  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 4  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 5  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 6  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 7  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 9  THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 10 THEN d.charge_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.charge_id = 11 THEN d.charge_amount ELSE 0 END), 0)
    INTO 
        v_charge_meter, v_charge_om, v_charge_trans, v_charge_sys_opr, v_charge_rkvah,
        v_charge_import, v_charge_scheduling, v_charge_dsm, v_charge_wheeling, v_charge_tax
    FROM windmill.charge_allotment_header h
    JOIN windmill.charge_allotment_details d ON h.id = d.header_id
    WHERE h.service_id = v_service_id
      AND h.year       = v_year
      AND h.month      = v_month_num
      AND h.status     = '1';
      
    -- Add wheeling charges from EB bill
    SET v_charge_wheeling = v_charge_wheeling + (
        SELECT IFNULL(SUM(ac.wheeling_charges), 0)
        FROM windmill.eb_bill_adjustment_charges ac
        JOIN windmill.eb_bill h ON ac.eb_bill_header_id = h.id
        WHERE h.customer_id = v_cust_id AND h.sc_id = v_service_id AND h.bill_year = v_year AND h.bill_month = v_month_num
    );

    SELECT
        ci.id,
        ci.invoice_number,
        ci.customer_id,   -- FIXED: Return customer_id for router
        ci.service_id,    -- FIXED: Return service_id for router
        mc.customer_name,
        mc.address       AS customer_address,
        mc.gst_number    AS customer_gstin,
        mc.city          AS customer_city,
        cs.service_number,
        ci.month,
        ci.year,
        ci.invoice_date,
        ci.delivery_note,
        ci.mode_terms_of_payment,
        ci.reference_no_date,
        ci.other_references,
        ci.buyers_order_no,
        ci.buyers_order_date,
        ci.dispatch_doc_no,
        ci.delivery_note_date,
        ci.dispatched_through,
        ci.destination,
        ci.terms_of_delivery,
        v_generated_units  AS generated_units,
        v_invoice_constant AS invoice_constant,
        v_charge_meter      AS charge_meter,
        v_charge_om         AS charge_om,
        v_charge_trans      AS charge_trans,
        v_charge_sys_opr    AS charge_sys_opr,
        v_charge_rkvah      AS charge_rkvah,
        v_charge_import     AS charge_import,
        v_charge_scheduling AS charge_scheduling,
        v_charge_dsm        AS charge_dsm,
        v_charge_wheeling   AS charge_wheeling,
        v_charge_tax        AS charge_tax
    FROM windmill.client_invoice ci
    JOIN masters.master_customers mc ON ci.customer_id = mc.id
    JOIN masters.customer_service  cs ON ci.service_id  = cs.id
    WHERE ci.id = p_id
    LIMIT 1;
END