DROP PROCEDURE IF EXISTS windmill.sp_save_actual_allotment;

DELIMITER //

CREATE PROCEDURE windmill.sp_save_actual_allotment(
    IN p_windmill_id BIGINT,
    IN p_service_id INT,
    IN p_allotment_total DECIMAL(15, 2),
    IN p_year INT,
    IN p_month INT,
    IN p_path VARCHAR(500),
    IN p_user_id INT,
    IN p_c1 VARCHAR(255),
    IN p_c2 VARCHAR(255),
    IN p_c4 VARCHAR(255),
    IN p_c5 VARCHAR(255)
)
BEGIN
    -- Remove any existing rows for the same windmill+service+year+month
    DELETE FROM windmill.actual_allotment
    WHERE windmill_id = p_windmill_id
      AND service_id = p_service_id
      AND year = p_year
      AND month = p_month;

    -- Insert the fresh record
    INSERT INTO windmill.actual_allotment (
        windmill_id, service_id, allotment_total, year, month, pdf_file_path, created_by, created_at, modified_by, modified_at, c1, c2, c4, c5
    )
    VALUES (
        p_windmill_id, p_service_id, p_allotment_total, p_year, p_month, p_path, p_user_id, NOW(), p_user_id, NOW(), p_c1, p_c2, p_c4, p_c5
    );
END //

DELIMITER ;
