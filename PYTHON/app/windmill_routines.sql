-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 187.127.131.38    Database: windmill
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.16-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping events for database 'windmill'
--

--
-- Dumping routines for database 'windmill'
--
USE windmill;

/*!50003 DROP PROCEDURE IF EXISTS `check_customer_exists` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `check_customer_exists`(

    IN p_customer_id INT

)
BEGIN

    SELECT 1 FROM masters.master_customers WHERE id = p_customer_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `check_service_number_exists` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `check_service_number_exists`(

    IN p_service_id INT

)
BEGIN

    SELECT 1 FROM masters.customer_service WHERE id = p_service_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `check_windmill_exists` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `check_windmill_exists`(

    IN p_windmill_id INT

)
BEGIN

    SELECT 1 FROM masters.master_windmill WHERE id = p_windmill_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `clear_eb_bill_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `clear_eb_bill_details`(

    IN p_header_id INT

)
BEGIN

    DELETE FROM eb_bill_adjustment_charges WHERE eb_bill_header_id = p_header_id;

    DELETE FROM eb_bill_details WHERE eb_bill_header_id = p_header_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `delete_eb_bill` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `delete_eb_bill`(

    IN p_id INT

)
BEGIN

    DELETE FROM eb_bill_adjustment_charges WHERE eb_bill_header_id = p_id;

    DELETE FROM eb_bill_details WHERE eb_bill_header_id = p_id;

    DELETE FROM eb_bill WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `delete_eb_statement` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `delete_eb_statement`(

    IN p_id INT

)
BEGIN



DELETE FROM windmill.eb_statements

WHERE id = p_id;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetConsumptionDropdownData` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `GetConsumptionDropdownData`()
BEGIN

    SELECT DISTINCT mc.id AS customer_id, mc.customer_name

    FROM masters.master_customers mc

    JOIN masters.customer_service cs ON mc.id = cs.customer_id

    WHERE mc.is_submitted = 1 

      AND mc.status = '1'

      AND cs.status = '1'

    ORDER BY mc.customer_name;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_active_windmill_numbers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_active_windmill_numbers`()
BEGIN

    SELECT windmill_number 

    FROM masters.master_windmill

    WHERE (type = 'Windmill' OR type = 'Solar')

      AND status = 'Active'

      AND is_submitted = 1

    ORDER BY windmill_number;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_adjustment_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_bill_adjustment_charges`(

    IN p_eb_bill_header_id INT

)
BEGIN

    SELECT * FROM eb_bill_adjustment_charges WHERE eb_bill_header_id = p_eb_bill_header_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_customers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_bill_customers`()
BEGIN

    SELECT DISTINCT mc.id, mc.customer_name 

    FROM masters.master_customers mc

    WHERE mc.status = '1' AND mc.is_submitted = 1

    ORDER BY mc.customer_name;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_bill_details`(

    IN p_eb_bill_header_id INT

)
BEGIN

    SELECT eb_bill_header_id, customer_id, customer_service_id, self_generation_tax 

    FROM eb_bill_details 

    WHERE eb_bill_header_id = p_eb_bill_header_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_bill_header`(

    IN p_id INT

)
BEGIN

    SELECT e.id, e.bill_year, e.bill_month, mc.customer_name, cs.service_number, e.customer_id, e.sc_id 

    FROM eb_bill e 

    JOIN masters.master_customers mc ON e.customer_id = mc.id 

    JOIN masters.customer_service cs ON e.sc_id = cs.id 

    WHERE e.id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_eb_bill_list`(
    IN p_customer_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        e.id, 
        e.bill_month, 
        e.bill_year, 
        mc.customer_name, 
        cs.service_number,
        e.pdf_file_path, 
        e.is_submitted, 
        e.created_at, 
        u.name as created_by
    FROM eb_bill e
    JOIN masters.master_customers mc ON e.customer_id = mc.id
    JOIN masters.customer_service cs ON e.sc_id = cs.id
    LEFT JOIN masters.users u ON e.created_by = u.id
    WHERE (p_customer_id IS NULL OR e.customer_id = p_customer_id)
      AND (p_year IS NULL OR e.bill_year = p_year)
      AND (p_month IS NULL OR e.bill_month = p_month)
    ORDER BY e.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_bill_service_number` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_bill_service_number`(IN cust_id INT)
BEGIN

    SELECT id, service_number 

    FROM masters.customer_service 

    WHERE customer_id = cust_id AND status = '1'

    ORDER BY service_number;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_eb_statement_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_eb_statement_list`(

    IN p_windmill_number VARCHAR(50),

    IN p_year INT,

    IN p_month VARCHAR(20),

    IN p_keyword VARCHAR(100)

)
BEGIN



SELECT 

    e.id,

    e.month,

    YEAR(e.created_at) AS year,

    w.windmill_number,

    e.pdf_file_path,

    e.is_submitted

FROM windmill.eb_statements e

JOIN masters.master_windmill w 

    ON e.windmill_id = w.id

WHERE

    (p_windmill_number IS NULL OR p_windmill_number = '' 

        OR w.windmill_number = p_windmill_number)



    AND (p_year IS NULL 

        OR YEAR(e.created_at) = p_year)



    AND (p_month IS NULL OR p_month = '' 

        OR e.month = p_month)



    AND (

        p_keyword IS NULL OR p_keyword = '' OR

        w.windmill_number LIKE CONCAT('%', p_keyword, '%') OR

        e.month LIKE CONCAT('%', p_keyword, '%')

    )



ORDER BY e.created_at DESC;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insert_eb_bill_adjustment_charge` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_eb_bill_adjustment_charge`(
    IN p_eb_bill_header_id INT,
    IN p_energy_number VARCHAR(50),
    IN p_c001 DECIMAL(12,2),
    IN p_c002 DECIMAL(12,2),
    IN p_c003 DECIMAL(12,2),
    IN p_c004 DECIMAL(12,2),
    IN p_c005 DECIMAL(12,2),
    IN p_c006 DECIMAL(12,2),  
    IN p_c007 DECIMAL(12,2),
    IN p_c008 DECIMAL(12,2),
    IN p_c010 DECIMAL(12,2),
    IN p_wheeling_charges DECIMAL(12,2),
    IN p_created_by INT,
    IN p_modified_by INT
)
BEGIN
    DECLARE v_calculated_wheeling DECIMAL(12,2);
    DECLARE v_bill_year INT;
    DECLARE v_bill_month INT;
    DECLARE v_customer_id INT;
    DECLARE v_sc_id INT;
    DECLARE v_whlc_cost DECIMAL(18,4);
    DECLARE v_whlc_discount DECIMAL(18,4);
    DECLARE v_whlc_factor DECIMAL(18,4) DEFAULT 0.54; -- Fallback to 0.54
    DECLARE v_sgt_constant DECIMAL(18,4) DEFAULT 0.00;
    DECLARE v_energy_type VARCHAR(50);

    -- Handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND 
    SET v_bill_year = NULL, v_bill_month = NULL, 
        v_customer_id = NULL, v_sc_id = NULL;

    -- 1. Get header/customer direct from eb_bill
    SELECT bill_year, bill_month, customer_id, sc_id
    INTO v_bill_year, v_bill_month, v_customer_id, v_sc_id
    FROM eb_bill
    WHERE id = p_eb_bill_header_id
    LIMIT 1;

    -- 2. Get Wheeling Charges Configuration from Masters
    -- Determine energy type for the given energy_number
    SELECT LOWER(type) INTO v_energy_type 
    FROM masters.master_windmill 
    WHERE windmill_number = p_energy_number COLLATE utf8mb4_unicode_ci
    LIMIT 1;

    -- Get configuration based on energy type
    SELECT cost, discount_charges 
    INTO v_whlc_cost, v_whlc_discount
    FROM masters.master_consumption_chargers
    WHERE REPLACE(LOWER(charge_name), ' ', '') = 'wheelingcharges'
      AND (v_energy_type IS NULL OR LOWER(energy_type) = v_energy_type)
    ORDER BY (CASE WHEN LOWER(energy_type) = v_energy_type THEN 0 ELSE 1 END)
    LIMIT 1;

    -- 2.1 Get SGT Constant
    SELECT cost 
    INTO v_sgt_constant
    FROM masters.master_consumption_chargers
    WHERE charge_code = 'C011'
    LIMIT 1;

    -- 3. Calculate dynamic factor: (cost * discount / 100)
    -- e.g. (1.040 * 50 / 100) = 0.52
    IF v_whlc_cost IS NOT NULL AND v_whlc_discount IS NOT NULL THEN
        SET v_whlc_factor = v_whlc_cost * (v_whlc_discount / 100.0);
    END IF;

    -- Prevent division by zero
    IF v_whlc_factor = 0 THEN SET v_whlc_factor = 0.54; END IF;

    -- 4. Calculate actual wheeling value
    SET v_calculated_wheeling = ROUND(COALESCE(p_wheeling_charges,0) / v_whlc_factor, 2);

    -- 5. Insert adjustment
    INSERT INTO eb_bill_adjustment_charges(
        eb_bill_header_id,
        energy_number,
        c001,c002,c003,c004,c005,c006,c007,c008,c010,
        wheeling_charges,
        created_by,created_at,modified_by,modified_at
    ) VALUES (
        p_eb_bill_header_id,
        p_energy_number COLLATE utf8mb4_unicode_ci,
        COALESCE(p_c001,0),
        COALESCE(p_c002,0),
        COALESCE(p_c003,0),
        COALESCE(p_c004,0),
        COALESCE(p_c005,0),
        COALESCE(p_c006,0),
        COALESCE(p_c007,0),
        COALESCE(p_c008,0),
        COALESCE(p_c010,0),
        COALESCE(p_wheeling_charges,0),
        p_created_by,NOW(),p_modified_by,NOW()
    );

    -- 6. SAFE insert into actual
    IF v_bill_year IS NOT NULL 
       AND v_bill_month IS NOT NULL
       AND v_customer_id IS NOT NULL
       AND v_sc_id IS NOT NULL THEN

        IF NOT EXISTS (
            SELECT 1 FROM actual
            WHERE client_eb_id = p_eb_bill_header_id
            AND energy_number = p_energy_number COLLATE utf8mb4_unicode_ci
            AND actual_year = v_bill_year
            AND actual_month = v_bill_month
        ) THEN

            INSERT INTO actual(
                client_eb_id,
                actual_year,
                actual_month,
                customer_id,
                sc_id,
                energy_number,
                calculated_wheeling_value,
                self_gen_tax
            ) VALUES (
                p_eb_bill_header_id,
                v_bill_year,
                v_bill_month,
                v_customer_id,
                v_sc_id,
                p_energy_number COLLATE utf8mb4_unicode_ci,
                v_calculated_wheeling,
                ROUND(v_calculated_wheeling * v_sgt_constant, 2)
            );

        END IF;

    END IF;

    SELECT LAST_INSERT_ID() AS inserted_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insert_eb_bill_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `insert_eb_bill_detail`(

    IN p_eb_bill_header_id INT,

    IN p_customer_id INT,

    IN p_customer_service_id INT,

    IN p_self_generation_tax DECIMAL(12,2),

    IN p_created_by INT,

    IN p_modified_by INT

)
BEGIN

    DECLARE v_bill_year INT DEFAULT NULL;

    DECLARE v_bill_month INT DEFAULT NULL;



    -- ✅ Handle no data case

    DECLARE CONTINUE HANDLER FOR NOT FOUND 

    SET v_bill_year = NULL, v_bill_month = NULL;



    -- Get bill year & month

    SELECT bill_year, bill_month

    INTO v_bill_year, v_bill_month

    FROM eb_bill

    WHERE id = p_eb_bill_header_id

    LIMIT 1;



    -- Insert into eb_bill_details

    INSERT INTO eb_bill_details(

        eb_bill_header_id,

        customer_id,

        customer_service_id,

        self_generation_tax,

        created_by,

        created_at,

        modified_by,

        modified_at

    ) VALUES (

        p_eb_bill_header_id,

        p_customer_id,

        p_customer_service_id,

        COALESCE(p_self_generation_tax, 0),

        p_created_by,

        NOW(),

        p_modified_by,

        NOW()

    );



    -- ✅ Safe insert into actual

    IF v_bill_year IS NOT NULL AND v_bill_month IS NOT NULL THEN



        IF NOT EXISTS (

            SELECT 1 FROM actual 

            WHERE client_eb_id = p_eb_bill_header_id

            AND customer_id = p_customer_id

            AND sc_id = p_customer_service_id

            AND actual_year = v_bill_year

            AND actual_month = v_bill_month

        ) THEN



            INSERT INTO actual(

                client_eb_id,

                actual_year,

                actual_month,

                customer_id,

                sc_id

            ) VALUES (

                p_eb_bill_header_id,

                v_bill_year,

                v_bill_month,

                p_customer_id,

                p_customer_service_id

            );



        END IF;



    END IF;



    SELECT LAST_INSERT_ID() AS inserted_id;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_check_eb_bill_duplicate` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_check_eb_bill_duplicate`(IN p_customer_id INT, IN p_sc_id INT, IN p_year INT, IN p_month INT)
BEGIN

    SELECT id FROM eb_bill WHERE customer_id = p_customer_id AND sc_id = p_sc_id AND bill_year = p_year AND bill_month = p_month LIMIT 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_check_eb_bill_exists` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_check_eb_bill_exists`(IN p_id INT)
BEGIN

    SELECT id FROM eb_bill WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_check_eb_statement_duplicate` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_check_eb_statement_duplicate`(
    IN p_windmill_id BIGINT, 
    IN p_month VARCHAR(50), 
    IN p_year INT
)
BEGIN
    SELECT id FROM windmill.eb_statements 
    WHERE windmill_id = p_windmill_id 
      AND month = p_month COLLATE utf8mb4_unicode_ci
      AND year = p_year;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_clear_eb_bill_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_clear_eb_bill_data`(IN p_header_id INT)
BEGIN

    DELETE FROM eb_bill_details WHERE eb_bill_header_id = p_header_id;

    DELETE FROM eb_bill_adjustment_charges WHERE eb_bill_header_id = p_header_id;

    DELETE FROM actual WHERE client_eb_id = p_header_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_clear_eb_statement_child_records` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_clear_eb_statement_child_records`(IN p_header_id INT)
BEGIN
    DELETE FROM windmill.eb_statements_details WHERE eb_header_id = p_header_id;
    DELETE FROM windmill.eb_statements_applicable_charges WHERE eb_header_id = p_header_id;
    DELETE FROM windmill.eb_statements_total_banking_units WHERE eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_eb_statement_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_eb_statement_header`(
    IN p_windmill_id BIGINT,
    IN p_month VARCHAR(50),
    IN p_year INT,
    IN p_path VARCHAR(500),
    IN p_user_id INT
)
BEGIN
    INSERT INTO windmill.eb_statements (windmill_id, month, year, pdf_file_path, is_submitted, created_by, created_at, modified_at)
    VALUES (p_windmill_id, p_month, p_year, p_path, 0, p_user_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() AS id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_daily_generation_delete` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_daily_generation_delete`(

    IN p_id INT

)
BEGIN

    DELETE FROM windmill_daily_transaction

    WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_daily_generation_get` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_daily_generation_get`(

    IN p_from_date DATE,

    IN p_to_date DATE,

    IN p_keyword VARCHAR(50)

)
BEGIN

    SELECT

        id,

        region,

        transaction_date,

        windmill_number,

        units,

        status,

        expected_resume_date,

        remarks,

        is_submitted,

        created_by,

        created_at

    FROM windmill_daily_transaction

    WHERE

        (p_from_date IS NULL OR DATE(created_at) >= p_from_date)

        AND

        (p_to_date IS NULL OR DATE(created_at) <= p_to_date)

        AND

        (p_keyword IS NULL OR LOWER(windmill_number) LIKE CONCAT('%', LOWER(p_keyword), '%'))

    ORDER BY created_at DESC;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_daily_generation_post` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_daily_generation_post`(

    IN p_region VARCHAR(50),

	IN p_transaction_date DATE,

    IN p_windmill_number VARCHAR(50),

    IN p_units INT,

    IN p_expected_resume_date DATE,

    IN p_remarks TEXT,

    IN p_created_by VARCHAR(50)

)
BEGIN

    INSERT INTO windmill_daily_transaction (

        region,

        transaction_date,

        windmill_number,

        units,

        status,

        expected_resume_date,

        remarks,

        is_submitted,

        created_by

    )

    VALUES (

        p_region,

        p_transaction_date,

        p_windmill_number,

        p_units,

        'Posted',               -- ✅ string

        p_expected_resume_date,

        p_remarks,

        1,                     -- ✅ not submitted

        p_created_by

    );



    SELECT * 

    FROM windmill_daily_transaction

    WHERE id = LAST_INSERT_ID();

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_daily_generation_save` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_daily_generation_save`(

    IN p_region VARCHAR(50),

     IN p_transaction_date DATE,

    IN p_windmill_number VARCHAR(50),

    IN p_units INT,

    IN p_expected_resume_date DATE,

    IN p_remarks TEXT,

    IN p_created_by VARCHAR(50)

)
BEGIN

    INSERT INTO windmill_daily_transaction (

        region,

      transaction_date,

        windmill_number,

        units,

        status,

        expected_resume_date,

        remarks,

        is_submitted,

        created_by

    )

    VALUES (

        p_region,

    p_transaction_date,

        p_windmill_number,

        p_units,

        'Saved',               -- ✅ string

        p_expected_resume_date,

        p_remarks,

        0,                     -- ✅ not submitted

        p_created_by

    );



    SELECT * 

    FROM windmill_daily_transaction

    WHERE id = LAST_INSERT_ID();

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_daily_generation_update` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_daily_generation_update`(

    IN p_id INT,

    IN p_region VARCHAR(50),

    IN p_transaction_date DATE,

    IN p_windmill_number VARCHAR(50),

    IN p_units INT,

    IN p_expected_resume_date DATE,

    IN p_remarks TEXT,

    IN p_status VARCHAR(20),     -- 'Saved' or 'Posted'

    IN p_modified_by VARCHAR(50)

)
BEGIN



    -- Check record exists

    IF NOT EXISTS (

        SELECT 1 FROM windmill_daily_transaction WHERE id = p_id

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Record not found.';

    

    -- Prevent update if already posted

    ELSEIF EXISTS (

        SELECT 1 FROM windmill_daily_transaction

        WHERE id = p_id AND is_submitted = 1

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Cannot update. Record already submitted.';

    

    ELSE

        UPDATE windmill_daily_transaction

        SET

            region = p_region,

            transaction_date = p_transaction_date,

            windmill_number = p_windmill_number,

            units = p_units,

            expected_resume_date = p_expected_resume_date,

            remarks = p_remarks,

            status = p_status,

            is_submitted = CASE 

                             WHEN p_status = 'Posted' THEN 1

                             WHEN p_status = 'Saved' THEN 0

                             ELSE is_submitted

                           END,

            modified_by = p_modified_by,

            modified_at = NOW()

        WHERE id = p_id;



        SELECT * FROM windmill_daily_transaction WHERE id = p_id;

    END IF;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_delete_actual_allotment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_delete_actual_allotment`(IN p_id INT)
BEGIN
    DELETE FROM windmill.actual_allotment WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actuals_by_client` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_actuals_by_client`(

    IN p_client_eb_id INT

)
BEGIN



    SELECT 

        a.client_eb_id,

        a.energy_number,

        a.calculated_wheeling_charges,



        mc.customer_name,

        cs.service_number AS sc_number,



        a.actual_month,

        a.actual_year



    FROM actual a



    LEFT JOIN masters.master_customers mc 

        ON a.customer_id = mc.id



    LEFT JOIN masters.customer_service cs 

        ON a.sc_id = cs.id



    WHERE a.client_eb_id = p_client_eb_id



    ORDER BY a.energy_number;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actuals_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_actuals_list`()
BEGIN



    SELECT 

        a.client_eb_id,

        a.actual_month,

        a.actual_year,

        mc.customer_name,

        cs.service_number AS sc_number



    FROM actual a



    INNER JOIN (

        SELECT client_eb_id, MAX(id) AS max_id

        FROM actual

        GROUP BY client_eb_id

    ) latest 

        ON a.id = latest.max_id



    LEFT JOIN masters.master_customers mc 

        ON a.customer_id = mc.id



    LEFT JOIN masters.customer_service cs 

        ON a.sc_id = cs.id



    ORDER BY a.client_eb_id;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actuals_pdf` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_actuals_pdf`(
        IN p_client_eb_id INT
    )
BEGIN
        SELECT 
            mc.customer_name,
            cs.service_number AS sc_number,
            a.actual_month,
            a.actual_year,
            a.energy_number AS windmill,
            a.calculated_wheeling_value AS wheeling_charges,
            t.total_self_gen_tax AS self_gen_tax,

            -- ✅ Total
            t.total_wheeling

        FROM windmill.actual a

        -- ✅ Total subquery
        CROSS JOIN (
            SELECT 
                IFNULL(SUM(calculated_wheeling_value), 0) AS total_wheeling,
                IFNULL(SUM(self_gen_tax), 0) AS total_self_gen_tax
            FROM windmill.actual
            WHERE client_eb_id = p_client_eb_id
        ) t

        LEFT JOIN masters.master_customers mc 
            ON a.customer_id = mc.id

        LEFT JOIN masters.customer_service cs 
            ON a.sc_id = cs.id

        WHERE a.client_eb_id = p_client_eb_id
        ORDER BY a.energy_number;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actual_allotment_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_actual_allotment_list`(
    IN p_windmill_id BIGINT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        aa.id, 
        aa.year AS year, 
        aa.month AS month, 
        mc.customer_name, 
        cs.service_number, 
        aa.pdf_file_path,
        aa.allotment_total as value,
        'Manual' as source
    FROM windmill.actual_allotment aa
    JOIN masters.customer_service cs ON aa.service_id = cs.id
    JOIN masters.master_customers mc ON cs.customer_id = mc.id
    WHERE (p_windmill_id IS NULL OR aa.windmill_id = p_windmill_id)
      AND (p_year IS NULL OR aa.year = p_year)
      AND (p_month IS NULL OR aa.month = p_month)
    
    UNION ALL
    
    SELECT 
        a.id, 
        a.actual_year AS year, 
        a.actual_month AS month, 
        mc.customer_name, 
        cs.service_number, 
        a.pdf_file_path,
        NULL as value,
        'System' as source
    FROM windmill.actual a
    JOIN masters.customer_service cs ON a.sc_id = cs.id
    JOIN masters.master_customers mc ON a.customer_id = mc.id
    WHERE (p_year IS NULL OR a.actual_year = p_year)
      AND (p_month IS NULL OR a.actual_month = p_month);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actual_reconciliation_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_actual_reconciliation_list`(IN p_year INT, IN p_month INT)
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_actual_tax_total` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_actual_tax_total`(
    IN p_customer_id INT,
    IN p_sc_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT (
        (SELECT IFNULL(SUM(self_gen_tax), 0) FROM windmill.actual WHERE customer_id = p_customer_id AND sc_id = p_sc_id AND actual_year = p_year AND actual_month = p_month) +
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = p_customer_id AND cah.service_id = p_sc_id AND cah.year = p_year AND cah.month = p_month AND mcc.charge_code = 'C011') +
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = p_customer_id AND scah.service_id = p_sc_id AND scah.year = p_year AND scah.month = p_month AND mcc.charge_code = 'C011')
    ) as total_tax;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_allotment_balance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_allotment_balance`(
    IN p_year INT,
    IN p_month INT,
    IN p_windmill_id INT
)
BEGIN
    SELECT 
        b.id,
        b.windmill_id,
        w.windmill_number,
        b.year,
        b.month,
        b.slot,
        b.powerplant_balance,
        b.banking_balance,
        b.created_at,
        b.created_by,
        b.modified_at,
        b.modified_by
    FROM energy_allotment_balance b
    LEFT JOIN masters.master_windmill w ON b.windmill_id = w.id
    WHERE b.year = p_year 
      AND b.month = p_month
      AND (p_windmill_id IS NULL OR b.windmill_id = p_windmill_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_allotment_orders` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_allotment_orders`(
    IN p_month VARCHAR(20),
    IN p_year INT
)
BEGIN
    SELECT 
        ao.id,
        ao.windmill_id,
        mw.windmill_number,
        ao.year,
        ao.month,
        ao.file_path,
        ao.file_name,
        ao.created_at,
        u.name as uploaded_by
    FROM windmill.allotment_order_upload ao
    JOIN masters.master_windmill mw ON ao.windmill_id = mw.id
    LEFT JOIN masters.users u ON ao.created_by = u.id
    WHERE ao.month = p_month AND ao.year = p_year;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_all_windmill_numbers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_all_windmill_numbers`()
BEGIN
    SELECT id, windmill_number FROM masters.master_windmill;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_charge_allotment_grid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_charge_allotment_grid`(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        h.id AS header_id, 
        h.windmill_id, 
        h.customer_id, 
        h.service_id, 
        h.year, 
        h.month, 
        d.charge_id, 
        d.charge_amount
    FROM charge_allotment_header h
    JOIN charge_allotment_details d ON h.id = d.header_id
    WHERE h.year = p_year 
      AND h.month = p_month 
      AND h.status = '1';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_client_invoice_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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

    SELECT ci.service_id, ci.year, ci.month
    INTO   v_service_id, v_year, v_month_name
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

    SELECT COALESCE(SUM(a.calculated_wheeling_value), 0)
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

    SELECT
        ci.id,
        ci.invoice_number,
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_client_invoice_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_client_invoice_details`(IN p_invoice_id INT)
BEGIN
    SELECT field_name, amount, calculation 
    FROM windmill.client_invoice_details 
    WHERE invoice_id = p_invoice_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_client_invoice_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_client_invoice_list`(
    IN p_customer_id INT,
    IN p_year        INT,
    IN p_month       VARCHAR(20)
)
BEGIN
    SELECT
        ci.id,
        ci.invoice_number,
        mc.customer_name,
        cs.service_number,
        ci.month,
        ci.year,
        ci.invoice_date
    FROM windmill.client_invoice ci
    JOIN masters.master_customers mc ON ci.customer_id = mc.id
    JOIN masters.customer_service  cs ON ci.service_id  = cs.id
    WHERE (p_customer_id IS NULL OR ci.customer_id = p_customer_id)
      AND (p_year        IS NULL OR ci.year         = p_year)
      AND (p_month       IS NULL OR ci.month        = p_month)
    ORDER BY ci.invoice_number DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_client_invoice_metadata` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_client_invoice_metadata`(IN p_id INT)
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
        (SELECT IFNULL(rate_per_unit, 0) FROM masters.master_customers WHERE id = v_cust_id) as invoice_constant,
        
        -- Sum Generated Units
        (SELECT IFNULL(SUM(ead.allocated), 0)
         FROM windmill.energy_allotment_header eah
         JOIN windmill.energy_allotment_details ead ON eah.allocation_id = ead.allocation_id
         WHERE eah.customer_id = v_cust_id AND eah.service_id = v_service_id
           AND eah.year = v_year AND eah.month = v_month_int) as generated_units,
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
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C010') as charge_dsm_solar,

        -- Wheeling (C009)
        (
            (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C009') +
            (SELECT IFNULL(SUM(calculated_wheeling_value), 0) FROM windmill.actual WHERE customer_id = v_cust_id AND sc_id = v_service_id AND actual_year = v_year AND actual_month = v_month_int)
        ) as charge_wheeling_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C009') as charge_wheeling_solar,

        -- Other Charges (C008)
        (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C008') as charge_other_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C008') as charge_other_solar,

        -- Self Generation Tax (C011)
        (
            (SELECT IFNULL(SUM(cad.charge_amount), 0) FROM windmill.charge_allotment_header cah JOIN windmill.charge_allotment_details cad ON cah.id = cad.header_id JOIN masters.master_consumption_chargers mcc ON cad.charge_id = mcc.id WHERE cah.customer_id = v_cust_id AND cah.service_id = v_service_id AND cah.year = v_year AND cah.month = v_month_int AND mcc.charge_code = 'C011') +
            (SELECT IFNULL(SUM(self_gen_tax), 0) FROM windmill.actual WHERE customer_id = v_cust_id AND sc_id = v_service_id AND actual_year = v_year AND actual_month = v_month_int)
        ) as charge_tax_windmill,
        (SELECT IFNULL(SUM(scad.allocation), 0) FROM windmill.solar_charge_allotment_header scah JOIN windmill.solar_charge_allotment_details scad ON scah.id = scad.header_id JOIN masters.master_consumption_chargers mcc ON scad.charge_id = mcc.id WHERE scah.customer_id = v_cust_id AND scah.service_id = v_service_id AND scah.year = v_year AND scah.month = v_month_int AND mcc.charge_code = 'C011') as charge_tax_solar;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_consumption_requests` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_consumption_requests`(
            IN p_year INT,
            IN p_month INT
        )
BEGIN
            SELECT
                mc.id AS customer_id,
                mc.customer_name,
                cs.id AS service_id,
                cs.service_number AS sc_number,
                COALESCE(cc.c1, 0) AS c1,
                COALESCE(cc.c2, 0) AS c2,
                COALESCE(cc.c4, 0) AS c4,
                COALESCE(cc.c5, 0) AS c5,
                COALESCE(cc.total, 0) AS total,
                cc.id AS request_id
            FROM masters.master_customers mc
            INNER JOIN masters.customer_service cs ON mc.id = cs.customer_id
            LEFT JOIN windmill.customer_consumption_requests cc ON mc.id = cc.customer_id
                AND cs.id = cc.service_id
                AND cc.billing_year = p_year
                AND cc.billing_month = p_month
            WHERE mc.status = '1' 
              AND mc.is_submitted = 1 
              AND cs.status = '1'
            ORDER BY mc.customer_name, cs.service_number;
        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_customer_name_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_customer_name_by_id`(IN p_id INT)
BEGIN

    SELECT customer_name FROM masters.master_customers WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_customer_service_info` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_customer_service_info`(IN p_sc_id INT)
BEGIN
    SELECT mc.customer_name, cs.service_number, cs.customer_id 
    FROM masters.customer_service cs 
    JOIN masters.master_customers mc ON cs.customer_id = mc.id 
    WHERE cs.id = p_sc_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_adjustment_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_adjustment_charges`(

            IN p_year INT,

            IN p_month VARCHAR(20)

        )
BEGIN

            SELECT 

                mw.windmill_number, 

                m.charge_description, 

                ac.total_charge

            FROM windmill.eb_statements es

            JOIN masters.master_windmill mw ON es.windmill_id = mw.id

            JOIN windmill.eb_statements_applicable_charges ac ON es.id = ac.eb_header_id

            LEFT JOIN masters.master_consumption_chargers m ON ac.charge_id = m.id

            WHERE es.year = p_year AND (es.month = p_month OR es.month LIKE CONCAT(LEFT(p_month, 3), '%'));

        END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_applicable_charges_summary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_applicable_charges_summary`(IN p_year INT, IN p_month VARCHAR(50))
BEGIN
    DECLARE v_month_num INT;
    DECLARE v_month_name VARCHAR(50);
    
    -- Determine numeric and name versions of the month
    IF p_month REGEXP '^[0-9]+$' THEN
        SET v_month_num = CAST(p_month AS UNSIGNED);
        SET v_month_name = CASE v_month_num
            WHEN 1 THEN 'January' WHEN 2 THEN 'February' WHEN 3 THEN 'March' WHEN 4 THEN 'April'
            WHEN 5 THEN 'May' WHEN 6 THEN 'June' WHEN 7 THEN 'July' WHEN 8 THEN 'August'
            WHEN 9 THEN 'September' WHEN 10 THEN 'October' WHEN 11 THEN 'November' WHEN 12 THEN 'December'
            ELSE NULL
        END;
    ELSE
        SET v_month_name = p_month;
        SET v_month_num = CASE LOWER(p_month)
            WHEN 'january' THEN 1 WHEN 'february' THEN 2 WHEN 'march' THEN 3 WHEN 'april' THEN 4
            WHEN 'may' THEN 5 WHEN 'june' THEN 6 WHEN 'july' THEN 7 WHEN 'august' THEN 8
            WHEN 'september' THEN 9 WHEN 'october' THEN 10 WHEN 'november' THEN 11 WHEN 'december' THEN 12
            ELSE NULL
        END;
    END IF;

    -- Windmill Charges
    SELECT 
        mw.windmill_number,
        mcc.charge_code,
        ac.total_charge
    FROM windmill.eb_statements es
    JOIN masters.master_windmill mw ON es.windmill_id = mw.id
    JOIN windmill.eb_statements_applicable_charges ac ON es.id = ac.eb_header_id
    JOIN masters.master_consumption_chargers mcc ON ac.charge_id = mcc.id
    WHERE es.year = p_year 
      AND (es.month = v_month_name COLLATE utf8mb4_unicode_ci OR es.month = CAST(v_month_num AS CHAR) COLLATE utf8mb4_unicode_ci)
    
    UNION ALL
    
    -- Solar Charges
    SELECT 
        mw.windmill_number,
        mcc.charge_code,
        sc.total_charge
    FROM solar.eb_statement_solar es
    JOIN masters.master_windmill mw ON es.solar_id = mw.id
    JOIN solar.eb_statement_solar_applicable_charges sc ON es.id = sc.eb_header_id
    JOIN masters.master_consumption_chargers mcc ON sc.charge_id = mcc.id
    WHERE es.year = p_year 
      AND (es.month = v_month_name COLLATE utf8mb4_unicode_ci OR es.month = CAST(v_month_num AS CHAR) COLLATE utf8mb4_unicode_ci);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_bill_header_info` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_bill_header_info`(IN p_client_eb_id INT)
BEGIN
    SELECT bill_year, bill_month, sc_id FROM windmill.eb_bill WHERE id = p_client_eb_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_by_id`(IN p_id INT)
BEGIN
    SELECT id, month, windmill_id, pdf_file_path, is_submitted FROM windmill.eb_statements WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_charges`(IN p_header_id INT)
BEGIN
    SELECT a.charge_id, a.charge_description, a.total_charge, m.charge_name, m.charge_code
    FROM windmill.eb_statements_applicable_charges a
    LEFT JOIN masters.master_consumption_chargers m ON a.charge_id = m.id
    WHERE a.eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_details_slots` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_details_slots`(IN p_header_id INT)
BEGIN
    SELECT slots, net_unit, banking_units 
    FROM windmill.eb_statements_details 
    WHERE eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_file_path_for_delete` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_file_path_for_delete`(IN p_id INT)
BEGIN
    SELECT pdf_file_path FROM windmill.eb_statements WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_info` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_info`(IN p_id INT)
BEGIN
    SELECT windmill_id, month, year FROM windmill.eb_statements WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_list` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_statement_list`(
                IN p_windmill_number VARCHAR(100),
                IN p_year INT,
                IN p_month VARCHAR(50)
            )
BEGIN
                SELECT es.id, es.month, es.year, mw.windmill_number, mw.windmill_name, es.pdf_file_path, es.is_submitted, 
                       COALESCE(es.modified_at, es.created_at) as submitted_time, u.name as submitted_by
                FROM windmill.eb_statements es
                LEFT JOIN masters.master_windmill mw ON es.windmill_id = mw.id
                LEFT JOIN masters.users u ON es.created_by = u.id
                WHERE (p_windmill_number IS NULL OR mw.windmill_number = p_windmill_number COLLATE utf8mb4_unicode_ci)
                  AND (p_year IS NULL OR es.year = p_year)
                  AND (p_month IS NULL OR es.month = p_month COLLATE utf8mb4_unicode_ci)
                ORDER BY submitted_time DESC;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_metadata_by_filename` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_metadata_by_filename`(IN p_filename VARCHAR(255))
BEGIN
    SELECT id, month, year FROM windmill.eb_statements WHERE pdf_file_path LIKE CONCAT('%', p_filename, '%');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_summary_by_month` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_statement_summary_by_month`(IN p_year INT, IN p_month VARCHAR(50))
BEGIN
    -- This procedure fetches aggregated units from both Windmill and Solar databases.
    -- It handles both numeric month strings (e.g. '3') and name strings (e.g. 'March').
    
    DECLARE v_month_num INT;
    DECLARE v_month_name VARCHAR(50);
    
    -- Determine numeric and name versions of the month
    IF p_month REGEXP '^[0-9]+$' THEN
        SET v_month_num = CAST(p_month AS UNSIGNED);
        SET v_month_name = CASE v_month_num
            WHEN 1 THEN 'January' WHEN 2 THEN 'February' WHEN 3 THEN 'March' WHEN 4 THEN 'April'
            WHEN 5 THEN 'May' WHEN 6 THEN 'June' WHEN 7 THEN 'July' WHEN 8 THEN 'August'
            WHEN 9 THEN 'September' WHEN 10 THEN 'October' WHEN 11 THEN 'November' WHEN 12 THEN 'December'
            ELSE NULL
        END;
    ELSE
        SET v_month_name = p_month;
        SET v_month_num = CASE LOWER(p_month)
            WHEN 'january' THEN 1 WHEN 'february' THEN 2 WHEN 'march' THEN 3 WHEN 'april' THEN 4
            WHEN 'may' THEN 5 WHEN 'june' THEN 6 WHEN 'july' THEN 7 WHEN 'august' THEN 8
            WHEN 'september' THEN 9 WHEN 'october' THEN 10 WHEN 'november' THEN 11 WHEN 'december' THEN 12
            ELSE NULL
        END;
    END IF;

    -- Windmill Data
    SELECT 
        mw.windmill_number,
        esd.slots,
        esd.net_unit,
        esd.banking_units
    FROM windmill.eb_statements es
    JOIN masters.master_windmill mw ON es.windmill_id = mw.id
    JOIN windmill.eb_statements_details esd ON es.id = esd.eb_header_id
    WHERE es.year = p_year 
      AND (es.month = v_month_name COLLATE utf8mb4_unicode_ci OR es.month = CAST(v_month_num AS CHAR) COLLATE utf8mb4_unicode_ci)
    
    UNION ALL
    
    -- Solar Data
    SELECT 
        mw.windmill_number,
        esd.slots,
        esd.net_unit,
        0.0 as banking_units -- Solar doesn't typically have banking in this schema
    FROM solar.eb_statement_solar es
    JOIN masters.master_windmill mw ON es.solar_id = mw.id
    JOIN solar.eb_statement_solar_details esd ON es.id = esd.eb_header_id
    WHERE es.year = p_year 
      AND (es.month = v_month_name COLLATE utf8mb4_unicode_ci OR es.month = CAST(v_month_num AS CHAR) COLLATE utf8mb4_unicode_ci);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_statement_total_banking` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_statement_total_banking`(IN p_header_id INT)
BEGIN
    SELECT total_banking_units FROM windmill.eb_statements_total_banking_units WHERE eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_windmill_summary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_windmill_summary`(
    IN p_year INT,
    IN p_month VARCHAR(20)
)
BEGIN
    DECLARE v_month_num VARCHAR(2);
    
    SET v_month_num = (SELECT CASE p_month
        WHEN 'January' THEN '1' WHEN 'February' THEN '2' WHEN 'March' THEN '3'
        WHEN 'April' THEN '4' WHEN 'May' THEN '5' WHEN 'June' THEN '6'
        WHEN 'July' THEN '7' WHEN 'August' THEN '8' WHEN 'September' THEN '9'
        WHEN 'October' THEN '10' WHEN 'November' THEN '11' WHEN 'December' THEN '12'
        ELSE p_month END);

    SELECT 
        mw.windmill_number,
        d.slots AS slot,
        d.net_unit AS pp_units,
        d.banking_units AS bank_units
    FROM eb_statements es
    JOIN masters.master_windmill mw ON es.windmill_id = mw.id
    JOIN eb_statements_details d ON es.id = d.eb_header_id
    WHERE es.year = p_year AND (es.month = p_month OR es.month = v_month_num)
    
    UNION ALL
    
    SELECT 
        mw.windmill_number,
        d.slots AS slot,
        d.net_unit AS pp_units,
        0.0 AS bank_units
    FROM solar.eb_statement_solar es
    JOIN masters.master_windmill mw ON es.solar_id = mw.id
    JOIN solar.eb_statement_solar_details d ON es.id = d.eb_header_id
    WHERE (es.year = p_year OR YEAR(es.created_at) = p_year)
      AND (es.month = p_month OR es.month = v_month_num);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_energy_allotment_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_energy_allotment_details`(
    IN p_windmill_id BIGINT,
    IN p_year        INT,
    IN p_month       INT
)
BEGIN
    SELECT 
        h.customer_id,
        h.service_id,
        mc.customer_name,
        cs.service_number,
        h.windmill_id,
        MAX(CASE WHEN d.slot = 'c1' THEN d.power_allocated ELSE 0 END) as c1_pp,
        MAX(CASE WHEN d.slot = 'c1' THEN d.banking_allocated ELSE 0 END) as c1_bank,
        MAX(CASE WHEN d.slot = 'c2' THEN d.power_allocated ELSE 0 END) as c2_pp,
        MAX(CASE WHEN d.slot = 'c2' THEN d.banking_allocated ELSE 0 END) as c2_bank,
        MAX(CASE WHEN d.slot = 'c4' THEN d.power_allocated ELSE 0 END) as c4_pp,
        MAX(CASE WHEN d.slot = 'c4' THEN d.banking_allocated ELSE 0 END) as c4_bank,
        MAX(CASE WHEN d.slot = 'c5' THEN d.power_allocated ELSE 0 END) as c5_pp,
        MAX(CASE WHEN d.slot = 'c5' THEN d.banking_allocated ELSE 0 END) as c5_bank,
        -- Keep legacy c1, c2 etc for compatibility if needed, or just sum them here
        MAX(CASE WHEN d.slot = 'c1' THEN d.allocated ELSE 0 END) as c1,
        MAX(CASE WHEN d.slot = 'c2' THEN d.allocated ELSE 0 END) as c2,
        MAX(CASE WHEN d.slot = 'c4' THEN d.allocated ELSE 0 END) as c4,
        MAX(CASE WHEN d.slot = 'c5' THEN d.allocated ELSE 0 END) as c5
    FROM windmill.energy_allotment_header h
    JOIN windmill.energy_allotment_details d ON h.allocation_id = d.allocation_id
    JOIN masters.master_customers mc ON h.customer_id = mc.id
    JOIN masters.customer_service cs ON h.service_id = cs.id
    WHERE h.windmill_id = p_windmill_id
      AND h.year = p_year
      AND h.month = p_month
      AND h.status = '1'
      AND d.status = '1'
    GROUP BY h.customer_id, h.service_id, mc.customer_name, cs.service_number, h.windmill_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_energy_allotment_grid` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_energy_allotment_grid`(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        h.allocation_id, h.customer_id, h.windmill_id, h.service_id, h.year, h.month, d.slot, d.allocated
    FROM energy_allotment_header h
    JOIN energy_allotment_details d ON h.allocation_id = d.allocation_id
    WHERE h.year = p_year 
      AND h.month = p_month 
      AND h.status = '1' 
      AND d.status = '1';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_generation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_generation`(
                IN p_from_date DATE,
                IN p_to_date DATE,
                IN p_keyword VARCHAR(255)
            )
BEGIN
                SELECT t.*, mw.windmill_name
                FROM windmill.windmill_daily_transaction t
                LEFT JOIN masters.master_windmill mw ON t.windmill_number COLLATE utf8mb4_unicode_ci = mw.windmill_number COLLATE utf8mb4_unicode_ci
                WHERE (p_from_date IS NULL OR t.transaction_date >= p_from_date)
                  AND (p_to_date IS NULL OR t.transaction_date <= p_to_date)
                  AND (p_keyword IS NULL OR t.windmill_number LIKE CONCAT('%', p_keyword, '%') COLLATE utf8mb4_unicode_ci)
                ORDER BY t.transaction_date DESC;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_generation_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_generation_by_id`(

    IN p_id INT

)
BEGIN

    SELECT *

    FROM windmill.windmill_daily_transaction 

    WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_manual_allotment_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_manual_allotment_details`(
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT mw.windmill_number, aa.allotment_total 
    FROM windmill.actual_allotment aa 
    JOIN masters.master_windmill mw ON aa.windmill_id = mw.id 
    WHERE aa.service_id = p_service_id AND aa.year = p_year AND aa.month = p_month;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_next_invoice_number` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_next_invoice_number`()
BEGIN
    SELECT COALESCE(MAX(invoice_number), 0) + 1 AS next_number
    FROM windmill.client_invoice;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_reconciliation_system_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_reconciliation_system_charges`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_service_id_by_consumer_no` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_service_id_by_consumer_no`(IN p_consumer_no VARCHAR(255))
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_service_number_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_service_number_by_id`(IN p_id INT)
BEGIN

    SELECT service_number FROM masters.customer_service WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_windmill_list_dropdown` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_windmill_list_dropdown`()
BEGIN

    SELECT id, windmill_number 

    FROM masters.master_windmill 

    WHERE status = 1 and is_submitted = 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_windmill_number` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_windmill_number`(IN p_id INT)
BEGIN
    SELECT windmill_number FROM masters.master_windmill WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_statement_charge` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_insert_eb_statement_charge`(
    IN p_header_id INT,
    IN p_charge_id INT,
    IN p_description VARCHAR(255),
    IN p_amount DECIMAL(18,4),
    IN p_user_id INT
)
BEGIN
    INSERT INTO windmill.eb_statements_applicable_charges (eb_header_id, charge_id, charge_description, total_charge, created_by)
    VALUES (p_header_id, p_charge_id, p_description, p_amount, p_user_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_statement_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_eb_statement_detail`(
    IN p_header_id INT,
    IN p_company_name VARCHAR(255),
    IN p_windmill_id BIGINT,
    IN p_slot INT,
    IN p_net_unit DECIMAL(18,4),
    IN p_banking_units DECIMAL(18,4),
    IN p_user_id INT
)
BEGIN
    INSERT INTO windmill.eb_statements_details 
    (eb_header_id, company_name, windmill_id, slots, net_unit, banking_units, created_by)
    VALUES (p_header_id, p_company_name, p_windmill_id, p_slot, p_net_unit, p_banking_units, p_user_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_statement_total_banking` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_eb_statement_total_banking`(
    IN p_header_id INT,
    IN p_units DECIMAL(18,4),
    IN p_user_id INT
)
BEGIN
    INSERT INTO windmill.eb_statements_total_banking_units (eb_header_id, total_banking_units, created_by)
    VALUES (p_header_id, p_units, p_user_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_mark_eb_statement_submitted` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_mark_eb_statement_submitted`(IN p_id INT)
BEGIN
    UPDATE windmill.eb_statements SET is_submitted = 1, modified_at = NOW() WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_refresh_allotment_balance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_refresh_allotment_balance`(
    IN p_windmill_id INT,
    IN p_year INT,
    IN p_month_int INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_month_name VARCHAR(20);
    DECLARE v_wm_type VARCHAR(50);
    
    SET v_month_name = (SELECT CASE p_month_int
        WHEN 1 THEN 'January' WHEN 2 THEN 'February' WHEN 3 THEN 'March'
        WHEN 4 THEN 'April' WHEN 5 THEN 'May' WHEN 6 THEN 'June'
        WHEN 7 THEN 'July' WHEN 8 THEN 'August' WHEN 9 THEN 'September'
        WHEN 10 THEN 'October' WHEN 11 THEN 'November' WHEN 12 THEN 'December'
    END);
    
    SELECT COALESCE(LOWER(type), 'windmill') INTO v_wm_type FROM masters.master_windmill WHERE id = p_windmill_id;

    -- Delete existing for this period to avoid duplicates
    DELETE FROM windmill.energy_allotment_balance WHERE windmill_id = p_windmill_id AND year = p_year AND month = p_month_int;

    IF v_wm_type IS NOT NULL THEN
        INSERT INTO windmill.energy_allotment_balance (windmill_id, year, month, slot, powerplant_balance, banking_balance, created_at, created_by, modified_at, modified_by)
        SELECT 
            p_windmill_id, p_year, p_month_int, agg_eb.slot_key,
            (IFNULL(agg_eb.total_pp, 0.0) - IFNULL(alloted_slots.pp_allotted, 0)) AS pp_bal,
            (IF(v_wm_type = 'solar', 0.0, IFNULL(agg_eb.total_bank, 0.0)) - IFNULL(alloted_slots.bank_allotted, 0)) AS bank_bal,
            NOW(), p_user_id, NOW(), p_user_id
        FROM (
            SELECT slot_key, SUM(eb_pp) as total_pp, SUM(eb_bank) as total_bank
            FROM (
                -- Regular EB Statements (Treat as Solar for Solar type - no banking)
                SELECT 
                    CASE CAST(slots AS CHAR) WHEN '1' THEN 'c1' WHEN '2' THEN 'c2' WHEN '4' THEN 'c4' WHEN '5' THEN 'c5' ELSE CAST(slots AS CHAR) END as slot_key,
                    IFNULL(net_unit, 0.0) AS eb_pp, 
                    IF(v_wm_type = 'solar', 0.0, IFNULL(banking_units, 0.0)) AS eb_bank
                FROM windmill.eb_statements es
                JOIN windmill.eb_statements_details d ON es.id = d.eb_header_id
                WHERE es.windmill_id = p_windmill_id 
                  AND es.year = p_year 
                  AND (es.month = v_month_name OR es.month = CAST(p_month_int AS CHAR))
                
                UNION ALL
                
                -- Solar EB Statements
                SELECT 
                    CASE CAST(slots AS CHAR) WHEN '1' THEN 'c1' WHEN '2' THEN 'c2' WHEN '4' THEN 'c4' WHEN '5' THEN 'c5' ELSE CAST(slots AS CHAR) END as slot_key,
                    IFNULL(net_unit, 0.0) AS eb_pp, 0.0 AS eb_bank
                FROM solar.eb_statement_solar es
                JOIN solar.eb_statement_solar_details d ON es.id = d.eb_header_id
                WHERE es.solar_id = p_windmill_id 
                  AND (es.year = p_year OR YEAR(es.created_at) = p_year)
                  AND (es.month = v_month_name OR es.month = CAST(p_month_int AS CHAR))
            ) combined
            GROUP BY slot_key
        ) agg_eb
        LEFT JOIN (
            SELECT 
                SUBSTRING_INDEX(d.slot, '_', 1) as base_slot,
                SUM(IF(d.slot LIKE '%_P', d.allocated, 0)) as pp_allotted,
                SUM(IF(d.slot LIKE '%_B', d.allocated, 0)) as bank_allotted
            FROM windmill.energy_allotment_header h
            JOIN windmill.energy_allotment_details d ON h.allocation_id = d.allocation_id
            WHERE h.windmill_id = p_windmill_id AND h.year = p_year AND h.month = p_month_int AND h.status = '1' AND d.status = '1'
            GROUP BY SUBSTRING_INDEX(d.slot, '_', 1)
        ) alloted_slots ON agg_eb.slot_key = alloted_slots.base_slot;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_refresh_allotment_balance_all` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_refresh_allotment_balance_all`(
    IN p_year INT,
    IN p_month_int INT,
    IN p_user_id INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_windmill_id INT;
    DECLARE cur_windmills CURSOR FOR
        SELECT id FROM masters.master_windmill;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur_windmills;
    read_loop: LOOP
        FETCH cur_windmills INTO v_windmill_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        CALL sp_refresh_allotment_balance(v_windmill_id, p_year, p_month_int, p_user_id);
    END LOOP;
    CLOSE cur_windmills;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_remove_allotment_order` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_remove_allotment_order`(
    IN p_id INT
)
BEGIN
    DELETE FROM windmill.allotment_order_upload WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_actual_allotment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_actual_allotment`(
    IN p_windmill_id BIGINT,
    IN p_service_id INT,
    IN p_allotment_total DECIMAL(15, 2),
    IN p_year INT,
    IN p_month INT,
    IN p_path VARCHAR(500),
    IN p_user_id INT
)
BEGIN
    -- Remove any existing rows for the same windmill+service+year+month
    -- This prevents duplicates even if no UNIQUE constraint exists on the table
    DELETE FROM windmill.actual_allotment
    WHERE windmill_id = p_windmill_id
      AND service_id = p_service_id
      AND year = p_year
      AND month = p_month;

    -- Insert the fresh record
    INSERT INTO windmill.actual_allotment (
        windmill_id, service_id, allotment_total, year, month, pdf_file_path, created_by, created_at, modified_by, modified_at
    )
    VALUES (
        p_windmill_id, p_service_id, p_allotment_total, p_year, p_month, p_path, p_user_id, NOW(), p_user_id, NOW()
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_charge_allotment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_charge_allotment`(
    IN p_customer_id INT,
    IN p_windmill_id BIGINT,
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_user_id INT,
    IN p_charge_code VARCHAR(10),
    IN p_charge_amount DECIMAL(15, 2)
)
BEGIN
    DECLARE v_header_id INT;
    DECLARE v_charge_id INT;

    -- 1. Get or Create Header
    SELECT id INTO v_header_id 
    FROM windmill.charge_allotment_header
    WHERE customer_id = p_customer_id 
      AND windmill_id = p_windmill_id 
      AND service_id = p_service_id 
      AND year = p_year 
      AND month = p_month;

    IF v_header_id IS NULL THEN
        INSERT INTO windmill.charge_allotment_header (
            customer_id, windmill_id, service_id, year, month, created_at, created_by, modified_at, modified_by, status
        ) VALUES (
            p_customer_id, p_windmill_id, p_service_id, p_year, p_month, NOW(), p_user_id, NOW(), p_user_id, '1'
        );
        SET v_header_id = LAST_INSERT_ID();
    ELSE
        UPDATE windmill.charge_allotment_header 
        SET modified_at = NOW(), modified_by = p_user_id 
        WHERE id = v_header_id;
    END IF;

    -- 2. Resolve Charge ID from code
    SELECT id INTO v_charge_id FROM masters.master_consumption_chargers WHERE charge_code = p_charge_code;

    -- 3. Upsert Detail
    IF v_charge_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM windmill.charge_allotment_details WHERE header_id = v_header_id AND charge_id = v_charge_id) THEN
            UPDATE windmill.charge_allotment_details 
            SET charge_amount = p_charge_amount, modified_at = NOW(), modified_by = p_user_id
            WHERE header_id = v_header_id AND charge_id = v_charge_id;
        ELSE
            INSERT INTO windmill.charge_allotment_details (header_id, charge_id, charge_amount, created_at, created_by, modified_at, modified_by)
            VALUES (v_header_id, v_charge_id, p_charge_amount, NOW(), p_user_id, NOW(), p_user_id);
        END IF;
    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_charge_allotment_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_charge_allotment_detail`(
    IN p_header_id INT,
    IN p_charge_id INT,
    IN p_charge_amount DECIMAL(15, 2),
    IN p_user_id INT
)
BEGIN
    DECLARE v_detail_id INT;

    SELECT id INTO v_detail_id 
    FROM charge_allotment_details 
    WHERE header_id = p_header_id 
      AND charge_id = p_charge_id
    LIMIT 1;

    IF v_detail_id IS NOT NULL THEN
        UPDATE charge_allotment_details SET 
            charge_amount = p_charge_amount,
            modified_by = p_user_id,
            modified_at = NOW()
        WHERE id = v_detail_id;
    ELSE
        INSERT INTO charge_allotment_details (
            header_id, charge_id, charge_amount, created_by, modified_by
        ) VALUES (
            p_header_id, p_charge_id, p_charge_amount, p_user_id, p_user_id
        );
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_client_invoice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_client_invoice`(
    IN p_invoice_number INT,
    IN p_customer_id    INT,
    IN p_service_id     INT,
    IN p_year           INT,
    IN p_month          VARCHAR(20),
    IN p_invoice_date   DATE,
    IN p_user_id        INT
)
BEGIN
    INSERT INTO windmill.client_invoice (
        invoice_number, customer_id, service_id,
        year, month, invoice_date,
        created_by, created_at, modified_by, modified_at, is_submitted
    ) VALUES (
        p_invoice_number, p_customer_id, p_service_id,
        p_year, p_month, p_invoice_date,
        p_user_id, NOW(), p_user_id, NOW(), 0
    );
    SELECT LAST_INSERT_ID() AS id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_consumption_request` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_consumption_request`(

    IN p_customer_id INT,

    IN p_service_id INT,

    IN p_c1 DECIMAL(10,2),

    IN p_c2 DECIMAL(10,2),

    IN p_c4 DECIMAL(10,2),

    IN p_c5 DECIMAL(10,2),

    IN p_total DECIMAL(12,2),

    IN p_year INT,

    IN p_month SMALLINT,

    IN p_day SMALLINT,

    IN p_user_id INT

)
BEGIN

    DECLARE v_existing_id INT DEFAULT NULL;



    SELECT id INTO v_existing_id

    FROM windmill.customer_consumption_requests

    WHERE customer_id = p_customer_id

      AND service_id = p_service_id

      AND billing_year = p_year

      AND billing_month = p_month

    LIMIT 1;



    IF v_existing_id IS NOT NULL THEN

        UPDATE windmill.customer_consumption_requests

        SET c1 = p_c1,

            c2 = p_c2,

            c4 = p_c4,

            c5 = p_c5,

            total = p_total,

            billing_day = p_day,

            modified_by = p_user_id

        WHERE id = v_existing_id;

    ELSE

        INSERT INTO windmill.customer_consumption_requests

            (customer_id, service_id, c1, c2, c4, c5, total,

             billing_year, billing_month, billing_day, created_by)

        VALUES

            (p_customer_id, p_service_id, p_c1, p_c2, p_c4, p_c5, p_total,

             p_year, p_month, p_day, p_user_id);

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_energy_allotment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_energy_allotment`(
    IN p_customer_id INT,
    IN p_windmill_id BIGINT,
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_user_id INT,
    IN p_c1_power DECIMAL(15, 2),
    IN p_c1_banking DECIMAL(15, 2),
    IN p_c2_power DECIMAL(15, 2),
    IN p_c2_banking DECIMAL(15, 2),
    IN p_c4_power DECIMAL(15, 2),
    IN p_c4_banking DECIMAL(15, 2),
    IN p_c5_power DECIMAL(15, 2),
    IN p_c5_banking DECIMAL(15, 2)
)
BEGIN
    DECLARE v_allocation_id INT;
    DECLARE v_month_name VARCHAR(20);
    DECLARE v_gen_month INT;
    DECLARE v_gen_year INT;
    DECLARE v_old_c1_pp, v_old_c1_bank DECIMAL(15,2) DEFAULT 0;
    DECLARE v_old_c2_pp, v_old_c2_bank DECIMAL(15,2) DEFAULT 0;
    DECLARE v_old_c4_pp, v_old_c4_bank DECIMAL(15,2) DEFAULT 0;
    DECLARE v_old_c5_pp, v_old_c5_bank DECIMAL(15,2) DEFAULT 0;

    -- Generation month is usually the month before allotment
    SET v_gen_month = p_month - 1;
    SET v_gen_year = p_year;
    IF v_gen_month = 0 THEN
        SET v_gen_month = 12;
        SET v_gen_year = v_gen_year - 1;
    END IF;

    -- Get month name for EB statement lookup (EB statements use full month names like 'January')
    SET v_month_name = CASE v_gen_month 
        WHEN 1 THEN 'January' WHEN 2 THEN 'February' WHEN 3 THEN 'March' WHEN 4 THEN 'April'
        WHEN 5 THEN 'May' WHEN 6 THEN 'June' WHEN 7 THEN 'July' WHEN 8 THEN 'August'
        WHEN 9 THEN 'September' WHEN 10 THEN 'October' WHEN 11 THEN 'November' WHEN 12 THEN 'December'
    END;

    -- 1. Upsert Energy Allotment Header
    SELECT allocation_id INTO v_allocation_id 
    FROM windmill.energy_allotment_header 
    WHERE customer_id = p_customer_id 
      AND windmill_id = p_windmill_id 
      AND service_id = p_service_id 
      AND year = p_year 
      AND month = p_month;

    IF v_allocation_id IS NULL THEN
        INSERT INTO windmill.energy_allotment_header (
            customer_id, windmill_id, service_id, year, month, created_at, created_by, modified_at, modified_by, status
        ) VALUES (
            p_customer_id, p_windmill_id, p_service_id, p_year, p_month, NOW(), p_user_id, NOW(), p_user_id, '1'
        );
        SET v_allocation_id = LAST_INSERT_ID();
    ELSE
        UPDATE windmill.energy_allotment_header 
        SET modified_at = NOW(), modified_by = p_user_id 
        WHERE allocation_id = v_allocation_id;
    END IF;

    -- 2. Get old values to adjust balance BEFORE deleting
    SELECT IFNULL(power_allocated, 0), IFNULL(banking_allocated, 0) INTO v_old_c1_pp, v_old_c1_bank FROM windmill.energy_allotment_details WHERE allocation_id = v_allocation_id AND slot = 'c1';
    SELECT IFNULL(power_allocated, 0), IFNULL(banking_allocated, 0) INTO v_old_c2_pp, v_old_c2_bank FROM windmill.energy_allotment_details WHERE allocation_id = v_allocation_id AND slot = 'c2';
    SELECT IFNULL(power_allocated, 0), IFNULL(banking_allocated, 0) INTO v_old_c4_pp, v_old_c4_bank FROM windmill.energy_allotment_details WHERE allocation_id = v_allocation_id AND slot = 'c4';
    SELECT IFNULL(power_allocated, 0), IFNULL(banking_allocated, 0) INTO v_old_c5_pp, v_old_c5_bank FROM windmill.energy_allotment_details WHERE allocation_id = v_allocation_id AND slot = 'c5';
    -- 3. Clear existing details for this allocation
    DELETE FROM windmill.energy_allotment_details WHERE allocation_id = v_allocation_id;

    -- 4. Save Allotment Details (Balance is managed separately by the UI via API)
    
    -- C1
    INSERT INTO windmill.energy_allotment_details (allocation_id, slot, allocated, power_allocated, banking_allocated, created_at, created_by, modified_at, modified_by, status)
    VALUES (v_allocation_id, 'c1', p_c1_power + p_c1_banking, p_c1_power, p_c1_banking, NOW(), p_user_id, NOW(), p_user_id, '1');

    -- C2
    INSERT INTO windmill.energy_allotment_details (allocation_id, slot, allocated, power_allocated, banking_allocated, created_at, created_by, modified_at, modified_by, status)
    VALUES (v_allocation_id, 'c2', p_c2_power + p_c2_banking, p_c2_power, p_c2_banking, NOW(), p_user_id, NOW(), p_user_id, '1');

    -- C4
    INSERT INTO windmill.energy_allotment_details (allocation_id, slot, allocated, power_allocated, banking_allocated, created_at, created_by, modified_at, modified_by, status)
    VALUES (v_allocation_id, 'c4', p_c4_power + p_c4_banking, p_c4_power, p_c4_banking, NOW(), p_user_id, NOW(), p_user_id, '1');

    -- C5
    INSERT INTO windmill.energy_allotment_details (allocation_id, slot, allocated, power_allocated, banking_allocated, created_at, created_by, modified_at, modified_by, status)
    VALUES (v_allocation_id, 'c5', p_c5_power + p_c5_banking, p_c5_power, p_c5_banking, NOW(), p_user_id, NOW(), p_user_id, '1');

    SELECT v_allocation_id AS allocation_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_energy_allotment_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_energy_allotment_detail`(
    IN p_allocation_id INT,
    IN p_slot VARCHAR(10),
    IN p_allocated DECIMAL(15, 2),
    IN p_user_id INT
)
BEGIN
    DECLARE v_detail_id INT;

    -- slot key encodes type: c1_P, c1_B, c2_P, c2_B, etc.
    -- energy_allotment_details has no 'type' column (was removed)
    SELECT details_id INTO v_detail_id 
    FROM energy_allotment_details 
    WHERE allocation_id = p_allocation_id 
      AND slot = p_slot
      AND status = '1'
    LIMIT 1;

    IF v_detail_id IS NOT NULL THEN
        UPDATE energy_allotment_details SET 
            allocated = p_allocated,
            modified_by = p_user_id,
            modified_at = NOW()
        WHERE details_id = v_detail_id;
    ELSE
        INSERT INTO energy_allotment_details (
            allocation_id, slot, allocated, created_by, modified_by
        ) VALUES (
            p_allocation_id, p_slot, p_allocated, p_user_id, p_user_id
        );
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_solar_charge_allotment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_solar_charge_allotment`(
    IN p_customer_id INT,
    IN p_solar_id BIGINT,
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_user_id INT,
    IN p_charge_code VARCHAR(50),
    IN p_charge_amount DECIMAL(15, 2),
    IN p_allocation DECIMAL(15, 2)
)
BEGIN
    DECLARE v_header_id INT;
    DECLARE v_charge_id INT;

    -- 1. Upsert Header
    SELECT id INTO v_header_id 
    FROM windmill.solar_charge_allotment_header 
    WHERE customer_id = p_customer_id 
      AND solar_id = p_solar_id 
      AND service_id = p_service_id 
      AND year = p_year 
      AND month = p_month 
      AND status = '1';

    IF v_header_id IS NULL THEN
        INSERT INTO windmill.solar_charge_allotment_header (customer_id, solar_id, service_id, year, month, created_at, created_by, modified_at, modified_by, status)
        VALUES (p_customer_id, p_solar_id, p_service_id, p_year, p_month, NOW(), p_user_id, NOW(), p_user_id, '1');
        SET v_header_id = LAST_INSERT_ID();
    ELSE
        UPDATE windmill.solar_charge_allotment_header 
        SET modified_at = NOW(), modified_by = p_user_id 
        WHERE id = v_header_id;
    END IF;

    -- 2. Resolve Charge ID from code
    SELECT id INTO v_charge_id FROM masters.master_consumption_chargers WHERE charge_code = p_charge_code;

    -- 3. Upsert Detail
    IF v_charge_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM windmill.solar_charge_allotment_details WHERE header_id = v_header_id AND charge_id = v_charge_id) THEN
            UPDATE windmill.solar_charge_allotment_details 
            SET charge_amount = p_charge_amount, 
                allocation = p_allocation,
                modified_at = NOW(), 
                modified_by = p_user_id
            WHERE header_id = v_header_id AND charge_id = v_charge_id;
        ELSE
            INSERT INTO windmill.solar_charge_allotment_details (header_id, charge_id, charge_amount, allocation, created_at, created_by, modified_at, modified_by)
            VALUES (v_header_id, v_charge_id, p_charge_amount, p_allocation, NOW(), p_user_id, NOW(), p_user_id);
        END IF;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_solar_charge_allotment_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_solar_charge_allotment_detail`(
    IN p_header_id INT,
    IN p_charge_id INT,
    IN p_charge_amount DECIMAL(15,2),
    IN p_user_id INT
)
BEGIN
    -- Check if detail already exists for this header and charge
    IF EXISTS (SELECT 1 FROM solar_charge_allotment_details WHERE header_id = p_header_id AND charge_id = p_charge_id) THEN
        UPDATE solar_charge_allotment_details
        SET charge_amount = p_charge_amount
        WHERE header_id = p_header_id AND charge_id = p_charge_id;
    ELSE
        INSERT INTO solar_charge_allotment_details (
            header_id, charge_id, charge_amount, created_by, created_at
        ) VALUES (
            p_header_id, p_charge_id, p_charge_amount, p_user_id, NOW()
        );
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_submit_eb_bill` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_submit_eb_bill`(IN p_header_id INT)
BEGIN

    UPDATE eb_bill SET is_submitted = 1 WHERE id = p_header_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_client_invoice_amount` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_client_invoice_amount`(IN p_invoice_id INT, IN p_amount DECIMAL(15,2))
BEGIN
    UPDATE windmill.client_invoice SET amount = p_amount WHERE id = p_invoice_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_eb_statement_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_eb_statement_header`(
    IN p_id INT,
    IN p_windmill_id BIGINT,
    IN p_month VARCHAR(50),
    IN p_path VARCHAR(500)
)
BEGIN
    UPDATE windmill.eb_statements 
    SET windmill_id = p_windmill_id, month = p_month, pdf_file_path = p_path, modified_at = NOW() 
    WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_windmill_daily_transaction_status` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_windmill_daily_transaction_status`(

    IN p_id INT,

    IN p_status VARCHAR(50)

)
BEGIN

    UPDATE windmill_daily_transaction

    SET status = p_status

    WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_windmill_daily_transaction_submitted` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_windmill_daily_transaction_submitted`(IN p_id INT, IN p_val INT)
BEGIN

    UPDATE windmill.windmill_daily_transaction SET is_submitted = p_val WHERE id = p_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upload_allotment_order` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upload_allotment_order`(
    IN p_windmill_id BIGINT,
    IN p_year INT,
    IN p_month VARCHAR(20),
    IN p_file_path VARCHAR(255),
    IN p_file_name VARCHAR(255),
    IN p_created_by INT
)
BEGIN
    -- Check if a record already exists for this windmill, month, and year
    IF EXISTS (SELECT 1 FROM windmill.allotment_order_upload 
               WHERE windmill_id = p_windmill_id AND month = p_month AND year = p_year) THEN
        UPDATE windmill.allotment_order_upload
        SET file_path = p_file_path,
            file_name = p_file_name,
            created_by = p_created_by,
            created_at = NOW()
        WHERE windmill_id = p_windmill_id AND month = p_month AND year = p_year;
    ELSE
        INSERT INTO windmill.allotment_order_upload (
            windmill_id,
            year,
            month,
            file_path,
            file_name,
            created_by,
            created_at
        ) VALUES (
            p_windmill_id,
            p_year,
            p_month,
            p_file_path,
            p_file_name,
            p_created_by,
            NOW()
        );
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upsert_allotment_balance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upsert_allotment_balance`(
    IN p_windmill_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_slot VARCHAR(10),
    IN p_powerplant_balance DECIMAL(15, 2),
    IN p_banking_balance DECIMAL(15, 2),
    IN p_user_id INT
)
BEGIN
    DECLARE v_id INT;

    -- Check if balance already exists
    SELECT id INTO v_id 
    FROM energy_allotment_balance 
    WHERE windmill_id = p_windmill_id 
      AND year = p_year 
      AND month = p_month 
      AND slot = p_slot
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        -- Update existing balance
        UPDATE energy_allotment_balance SET 
            powerplant_balance = p_powerplant_balance,
            banking_balance = p_banking_balance,
            modified_by = p_user_id,
            modified_at = NOW()
        WHERE id = v_id;
    ELSE
        -- Insert new balance
        INSERT INTO energy_allotment_balance (
            windmill_id, 
            year, 
            month, 
            slot, 
            powerplant_balance, 
            banking_balance,
            created_at,
            created_by, 
            modified_at,
            modified_by
        ) VALUES (
            p_windmill_id, 
            p_year, 
            p_month, 
            p_slot, 
            p_powerplant_balance, 
            p_banking_balance,
            NOW(),
            p_user_id,
            NOW(),
            p_user_id
        );
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upsert_charge_allotment_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upsert_charge_allotment_header`(
    IN p_windmill_id INT,
    IN p_customer_id INT,
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_id INT;

    SELECT id INTO v_id 
    FROM charge_allotment_header 
    WHERE windmill_id = p_windmill_id 
      AND customer_id = p_customer_id 
      AND service_id = p_service_id 
      AND year = p_year 
      AND month = p_month
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        UPDATE charge_allotment_header SET
            modified_by = p_user_id,
            modified_at = NOW()
        WHERE id = v_id;
    ELSE
        INSERT INTO charge_allotment_header (
            windmill_id, customer_id, service_id, year, month, created_by, modified_by
        ) VALUES (
            p_windmill_id, p_customer_id, p_service_id, p_year, p_month, p_user_id, p_user_id
        );
        SET v_id = LAST_INSERT_ID();
    END IF;

    SELECT v_id AS header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upsert_client_invoice_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upsert_client_invoice_detail`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upsert_energy_allotment_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upsert_energy_allotment_header`(
    IN p_customer_id INT,
    IN p_windmill_id INT,
    IN p_service_id INT,
    IN p_year INT,
    IN p_month INT,
    IN p_user_id INT
)
BEGIN
    INSERT INTO energy_allotment_header (
        customer_id, windmill_id, service_id, year, month, created_by, modified_by
    ) VALUES (
        p_customer_id, p_windmill_id, p_service_id, p_year, p_month, p_user_id, p_user_id
    );

    SELECT LAST_INSERT_ID() AS allocation_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_upsert_solar_charge_allotment_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_upsert_solar_charge_allotment_header`(
    IN p_year INT,
    IN p_month INT,
    IN p_solar_id INT,
    IN p_cust_id INT,
    IN p_service_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_id INT;

    -- Check if record already exists
    SELECT id INTO v_id 
    FROM solar_charge_allotment_header
    WHERE year = p_year 
      AND month = p_month 
      AND solar_id = p_solar_id
      AND cust_id = p_cust_id
      AND service_id = p_service_id
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        -- Update existing (audit)
        UPDATE solar_charge_allotment_header
        SET modified_at = NOW(),
            modified_by = p_user_id
        WHERE id = v_id;
    ELSE
        -- Insert new
        INSERT INTO solar_charge_allotment_header (
            year, month, solar_id, cust_id, service_id, created_by, created_at
        ) VALUES (
            p_year, p_month, p_solar_id, p_cust_id, p_service_id, p_user_id, NOW()
        );
        SET v_id = LAST_INSERT_ID();
    END IF;

    -- Return the header ID
    SELECT v_id AS header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `upsert_eb_bill_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `upsert_eb_bill_header`(

    IN p_customer_id INT,

    IN p_sc_id INT,

    IN p_year INT,

    IN p_month INT,

    IN p_file_path VARCHAR(255),

    IN p_user_id INT

)
BEGIN

    DECLARE v_header_id INT;

    DECLARE v_old_path VARCHAR(255);



    SELECT id, pdf_file_path INTO v_header_id, v_old_path 

    FROM eb_bill 

    WHERE customer_id = p_customer_id AND sc_id = p_sc_id AND bill_year = p_year AND bill_month = p_month

    LIMIT 1;



    IF v_header_id IS NOT NULL THEN

        UPDATE eb_bill SET pdf_file_path = p_file_path, created_by = p_user_id, created_at = NOW() 

        WHERE id = v_header_id;

        SELECT v_header_id AS header_id, v_old_path AS old_path;

    ELSE

        INSERT INTO eb_bill (customer_id, sc_id, bill_year, bill_month, pdf_file_path, created_by, created_at) 

        VALUES (p_customer_id, p_sc_id, p_year, p_month, p_file_path, p_user_id, NOW());

        SELECT LAST_INSERT_ID() AS header_id, NULL AS old_path;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 19:14:44
