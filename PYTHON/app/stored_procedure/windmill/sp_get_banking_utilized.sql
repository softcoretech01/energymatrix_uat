DROP PROCEDURE IF EXISTS windmill.sp_get_banking_utilized;

DELIMITER //

CREATE PROCEDURE windmill.sp_get_banking_utilized(
    IN p_year INT,
    IN p_mode VARCHAR(20)
)
BEGIN
    SELECT 
        windmill_number,
        year,
        month,
        SUM(total_utilized) as total_utilized,
        SUM(utilized_c1) as c1,
        SUM(utilized_c2) as c2,
        SUM(utilized_c4) as c4,
        SUM(utilized_c5) as c5,
        SUM(pp_c1) as pp_c1,
        SUM(pp_c2) as pp_c2,
        SUM(pp_c4) as pp_c4,
        SUM(pp_c5) as pp_c5,
        SUM(eb_c1) as eb_c1,
        SUM(eb_c2) as eb_c2,
        SUM(eb_c4) as eb_c4,
        SUM(eb_c5) as eb_c5
    FROM (
        SELECT 
            mw.windmill_number, 
            aa.year, 
            aa.month, 
            COALESCE(aa.allotment_total, 0) as total_utilized,
            CAST(COALESCE(NULLIF(TRIM(aa.c1), ''), '0') AS DECIMAL(15, 2)) as utilized_c1,
            CAST(COALESCE(NULLIF(TRIM(aa.c2), ''), '0') AS DECIMAL(15, 2)) as utilized_c2,
            CAST(COALESCE(NULLIF(TRIM(aa.c4), ''), '0') AS DECIMAL(15, 2)) as utilized_c4,
            CAST(COALESCE(NULLIF(TRIM(aa.c5), ''), '0') AS DECIMAL(15, 2)) as utilized_c5,
            0.0 as pp_c1,
            0.0 as pp_c2,
            0.0 as pp_c4,
            0.0 as pp_c5,
            0.0 as eb_c1,
            0.0 as eb_c2,
            0.0 as eb_c4,
            0.0 as eb_c5
        FROM actual_allotment aa
        JOIN masters.master_windmill mw ON aa.windmill_id = mw.id
        WHERE (
            (p_mode = 'financial' AND ((aa.year = p_year AND aa.month >= 4) OR (aa.year = p_year + 1 AND aa.month <= 3)))
            OR
            (p_mode = 'calendar' AND (aa.year = p_year))
        )
          AND LOWER(mw.type) = 'windmill'
          
        UNION ALL
        
        SELECT 
            mw.windmill_number,
            es.year,
            CASE TRIM(es.month)
                WHEN 'January' THEN 1
                WHEN 'February' THEN 2
                WHEN 'March' THEN 3
                WHEN 'April' THEN 4
                WHEN 'May' THEN 5
                WHEN 'June' THEN 6
                WHEN 'July' THEN 7
                WHEN 'August' THEN 8
                WHEN 'September' THEN 9
                WHEN 'October' THEN 10
                WHEN 'November' THEN 11
                WHEN 'December' THEN 12
            END as month,
            0.0 as total_utilized,
            0.0 as utilized_c1,
            0.0 as utilized_c2,
            0.0 as utilized_c4,
            0.0 as utilized_c5,
            COALESCE(CASE WHEN d.slots = 1 THEN d.net_unit END, 0.0) as pp_c1,
            COALESCE(CASE WHEN d.slots = 2 THEN d.net_unit END, 0.0) as pp_c2,
            COALESCE(CASE WHEN d.slots = 4 THEN d.net_unit END, 0.0) as pp_c4,
            COALESCE(CASE WHEN d.slots = 5 THEN d.net_unit END, 0.0) as pp_c5,
            COALESCE(CASE WHEN d.slots = 1 THEN d.banking_units END, 0.0) as eb_c1,
            COALESCE(CASE WHEN d.slots = 2 THEN d.banking_units END, 0.0) as eb_c2,
            COALESCE(CASE WHEN d.slots = 4 THEN d.banking_units END, 0.0) as eb_c4,
            COALESCE(CASE WHEN d.slots = 5 THEN d.banking_units END, 0.0) as eb_c5
        FROM eb_statements es
        JOIN masters.master_windmill mw ON es.windmill_id = mw.id
        JOIN eb_statements_details d ON es.id = d.eb_header_id
        WHERE (
            (p_mode = 'financial' AND (
                (es.year = p_year AND CASE TRIM(es.month)
                                            WHEN 'January' THEN 1
                                            WHEN 'February' THEN 2
                                            WHEN 'March' THEN 3
                                            WHEN 'April' THEN 4
                                            WHEN 'May' THEN 5
                                            WHEN 'June' THEN 6
                                            WHEN 'July' THEN 7
                                            WHEN 'August' THEN 8
                                            WHEN 'September' THEN 9
                                            WHEN 'October' THEN 10
                                            WHEN 'November' THEN 11
                                            WHEN 'December' THEN 12
                                        END >= 4) 
                OR (es.year = p_year + 1 AND CASE TRIM(es.month)
                                                WHEN 'January' THEN 1
                                                WHEN 'February' THEN 2
                                                WHEN 'March' THEN 3
                                                WHEN 'April' THEN 4
                                                WHEN 'May' THEN 5
                                                WHEN 'June' THEN 6
                                                WHEN 'July' THEN 7
                                                WHEN 'August' THEN 8
                                                WHEN 'September' THEN 9
                                                WHEN 'October' THEN 10
                                                WHEN 'November' THEN 11
                                                WHEN 'December' THEN 12
                                             END <= 3)
            ))
            OR
            (p_mode = 'calendar' AND (es.year = p_year))
        )
          AND LOWER(mw.type) = 'windmill'
    ) as combined
    GROUP BY windmill_number, year, month;
END //

DELIMITER ;
