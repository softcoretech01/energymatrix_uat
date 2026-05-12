-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 187.127.131.38    Database: solar
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.16-MariaDB-ubu2204
USE solar;

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
-- Dumping events for database 'solar'
--

--
-- Dumping routines for database 'solar'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_check_eb_solar_duplicate` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_check_eb_solar_duplicate`(IN p_solar_id VARCHAR(255), IN p_month VARCHAR(50), IN p_year INT)
BEGIN
    SELECT id FROM solar.eb_statement_solar 
    WHERE solar_id = p_solar_id AND month = p_month COLLATE utf8mb4_unicode_ci AND year = p_year;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_clear_eb_solar_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_clear_eb_solar_details`(IN p_header_id INT)
BEGIN
    DELETE FROM solar.eb_statement_solar_details WHERE eb_header_id = p_header_id;
    DELETE FROM solar.eb_statement_solar_applicable_charges WHERE eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_count_eb_statement_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_count_eb_statement_solar`(

    IN p_solar_id INT,

    IN p_year INT,

    IN p_month INT,

    IN p_status VARCHAR(50),

    IN p_keyword VARCHAR(100)

)
BEGIN

    SET @sql = 'SELECT COUNT(*) FROM eb_statement_solar s LEFT JOIN windmill_master w ON s.solar_id = w.id WHERE 1=1';

    IF p_solar_id IS NOT NULL AND p_solar_id <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.solar_id = ', QUOTE(p_solar_id));

    END IF;

    IF p_year IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.year = ', p_year);

    END IF;

    IF p_month IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.month = ', p_month);

    END IF;

    IF p_status IS NOT NULL AND p_status <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.status = ', QUOTE(p_status));

    END IF;

    IF p_keyword IS NOT NULL AND p_keyword <> '' THEN

        SET @sql = CONCAT(

            @sql,

            ' AND (w.windmill_number LIKE ', QUOTE(CONCAT('%', p_keyword, '%')),

            ' OR s.status LIKE ', QUOTE(CONCAT('%', p_keyword, '%')), ')'

        );

    END IF;

    PREPARE stmt FROM @sql;

    EXECUTE stmt;

    DEALLOCATE PREPARE stmt;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_eb_solar_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_eb_solar_header`(
    IN p_solar_id VARCHAR(255),
    IN p_month VARCHAR(50),
    IN p_year INT,
    IN p_path VARCHAR(500),
    IN p_user_id INT
)
BEGIN
    INSERT INTO solar.eb_statement_solar (solar_id, month, year, pdf_file_path, is_submitted, created_by, created_at)
    VALUES (p_solar_id, p_month, p_year, p_path, 0, p_user_id, NOW());
    SELECT LAST_INSERT_ID() AS id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_eb_solar_save_tables` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_eb_solar_save_tables`()
BEGIN

    CREATE TABLE IF NOT EXISTS eb_solar_statement_header (

        id                        INT AUTO_INCREMENT PRIMARY KEY,

        statement_id              INT NOT NULL,

        edc_name                  VARCHAR(100),

        service_number            VARCHAR(50),

        company_name              VARCHAR(200),

        statement_month           VARCHAR(20),

        statement_year            INT,

        injection_voltage         VARCHAR(20),

        allow_lower_adjustment    VARCHAR(5),

        allocation_completed_date VARCHAR(20),

        created_at                DATETIME DEFAULT NOW()

    );



    CREATE TABLE IF NOT EXISTS eb_solar_statement_details (

        id                  INT AUTO_INCREMENT PRIMARY KEY,

        statement_id        INT NOT NULL,

        section_type        VARCHAR(30) NOT NULL,

        label               VARCHAR(200),

        consumer_service_no VARCHAR(50)  NULL,

        org_name            VARCHAR(100) NULL,

        allocated           DECIMAL(15,2) NULL,

        c1                  DECIMAL(15,2) DEFAULT 0,

        c2                  DECIMAL(15,2) DEFAULT 0,

        c3                  DECIMAL(15,2) DEFAULT 0,

        c4                  DECIMAL(15,2) DEFAULT 0,

        c5                  DECIMAL(15,2) DEFAULT 0,

        total               DECIMAL(15,2) NULL

    );



    CREATE TABLE IF NOT EXISTS eb_solar_statement_charges (

        id                  INT AUTO_INCREMENT PRIMARY KEY,

        statement_id        INT NOT NULL,

        consumer_name       VARCHAR(200),

        consumer_service_no VARCHAR(50),

        mrc                 DECIMAL(15,2) DEFAULT 0,

        omc                 DECIMAL(15,2) DEFAULT 0,

        trc                 DECIMAL(15,2) DEFAULT 0,

        oc                  DECIMAL(15,2) DEFAULT 0,

        kp                  DECIMAL(15,2) DEFAULT 0,

        ec                  DECIMAL(15,2) DEFAULT 0,

        shc                 DECIMAL(15,2) DEFAULT 0,

        oc2                 DECIMAL(15,2) DEFAULT 0,

        dc                  DECIMAL(15,2) DEFAULT 0

    );

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_delete_eb_solar_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_eb_solar_header`(IN p_id INT)
BEGIN
    DELETE FROM solar.eb_statement_solar_details WHERE eb_header_id = p_id;
    DELETE FROM solar.eb_statement_solar_applicable_charges WHERE eb_header_id = p_id;
    DELETE FROM solar.eb_statement_solar WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_delete_solar_charge_calculation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_solar_charge_calculation`(
    IN p_solar_id INT,
    IN p_month INT,
    IN p_year INT
)
BEGIN
    DELETE FROM solar.charge_calculation 
    WHERE solar_id = p_solar_id AND month = p_month AND year = p_year;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_export_eb_statement_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_export_eb_statement_solar`(

    IN p_solar_id INT,

    IN p_year INT,

    IN p_month INT,

    IN p_status VARCHAR(50),

    IN p_keyword VARCHAR(100)

)
BEGIN

    SET @sql = CONCAT(

        'SELECT s.id, s.reading_date, s.solar_id, w.windmill_number AS solar_number, s.exported_kwh, s.consumed_kwh, s.unit_value_export, ',

        's.net_payable, s.status, s.year, s.month FROM eb_statement_solar s LEFT JOIN windmill_master w ON s.solar_id = w.id WHERE 1=1'

    );

    IF p_solar_id IS NOT NULL AND p_solar_id <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.solar_id = ', QUOTE(p_solar_id));

    END IF;

    IF p_year IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.year = ', p_year);

    END IF;

    IF p_month IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.month = ', p_month);

    END IF;

    IF p_status IS NOT NULL AND p_status <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.status = ', QUOTE(p_status));

    END IF;

    IF p_keyword IS NOT NULL AND p_keyword <> '' THEN

        SET @sql = CONCAT(

            @sql,

            ' AND (w.windmill_number LIKE ', QUOTE(CONCAT('%', p_keyword, '%')),

            ' OR s.status LIKE ', QUOTE(CONCAT('%', p_keyword, '%')), ')'

        );

    END IF;

    PREPARE stmt FROM @sql;

    EXECUTE stmt;

    DEALLOCATE PREPARE stmt;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_by_filename_extended` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_solar_by_filename_extended`(IN p_filename VARCHAR(255))
BEGIN
    SELECT id, month, year, is_submitted 
    FROM solar.eb_statement_solar 
    WHERE pdf_file_path LIKE CONCAT('%', p_filename, '%') 
    ORDER BY created_at DESC 
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_by_id_simple` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_solar_by_id_simple`(IN p_id INT)
BEGIN
    SELECT id, month, year, is_submitted, pdf_file_path, solar_id FROM solar.eb_statement_solar WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_solar_charges`(IN p_header_id INT)
BEGIN
    SELECT c.id, c.charge_id, c.total_charge, m.charge_description, m.charge_code
    FROM solar.eb_statement_solar_applicable_charges c
    LEFT JOIN masters.master_consumption_chargers m ON c.charge_id = m.id
    WHERE c.eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_solar_details`(IN p_header_id INT)
BEGIN
    SELECT id, company_name, solar_id, slots, net_unit 
    FROM solar.eb_statement_solar_details 
    WHERE eb_header_id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_info` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_solar_info`(IN p_id INT)
BEGIN
    SELECT solar_id, month, year FROM solar.eb_statement_solar WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_latest_by_solar_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_solar_latest_by_solar_id`(IN p_solar_id VARCHAR(255))
BEGIN
    SELECT id, month, year FROM solar.eb_statement_solar WHERE solar_id = p_solar_id ORDER BY created_at DESC LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_metadata_by_filename` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_eb_solar_metadata_by_filename`(IN p_filename VARCHAR(255))
BEGIN
    SELECT id, month, year 
    FROM solar.eb_statement_solar 
    WHERE pdf_file_path LIKE CONCAT('%', p_filename, '%') 
    ORDER BY created_at DESC 
    LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_eb_solar_summary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_eb_solar_summary`(

    IN p_year INT,

    IN p_month_name VARCHAR(20),

    IN p_month_num VARCHAR(10)

)
BEGIN

    SELECT 

        mw.windmill_number,

        d.slots AS slot,

        d.net_unit AS pp_units

    FROM eb_statement_solar es

    JOIN masters.master_windmill mw ON es.solar_id = mw.id

    JOIN eb_statement_solar_details d ON es.id = d.eb_header_id

    WHERE (es.year = p_year OR YEAR(es.created_at) = p_year)

      AND (es.month = p_month_name OR es.month = p_month_num);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_solar_applicable_charges_summary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_solar_applicable_charges_summary`(IN p_year INT, IN p_month VARCHAR(50))
BEGIN
    SELECT 
        mw.windmill_number,
        mcc.charge_code,
        sc.total_charge
    FROM solar.eb_statement_solar es
    JOIN masters.master_windmill mw ON es.solar_id = mw.id
    JOIN solar.eb_statement_solar_applicable_charges sc ON es.id = sc.eb_header_id
    JOIN masters.master_consumption_chargers mcc ON sc.charge_id = mcc.id
    WHERE es.year = p_year AND es.month = p_month COLLATE utf8mb4_unicode_ci;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_solar_calculated_charges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_solar_calculated_charges`(
    IN p_solar_id INT,
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT charge_id, value, calculation 
    FROM solar.charge_calculation 
    WHERE solar_id = p_solar_id AND month = p_month AND year = p_year;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_solar_units` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_solar_units`(
    IN p_solar_id INT,
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT SUM(net_unit) 
    FROM solar.eb_statement_solar_details 
    WHERE eb_header_id = (
        SELECT id FROM solar.eb_statement_solar 
        WHERE solar_id = p_solar_id AND month = p_month AND year = p_year 
        LIMIT 1
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_solar_windmill_numbers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_solar_windmill_numbers`()
BEGIN

    SELECT id, windmill_number

    FROM masters.master_windmill

    WHERE LOWER(`type`) = 'solar' AND is_submitted = 1

    ORDER BY windmill_number;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_solar_charge` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_insert_eb_solar_charge`(
    IN p_header_id INT, 
    IN p_charge_id INT, 
    IN p_description VARCHAR(255),
    IN p_amount DECIMAL(18,4), 
    IN p_user_id INT
)
BEGIN
    INSERT INTO solar.eb_statement_solar_applicable_charges (eb_header_id, charge_id, charge_description, total_charge, created_by, created_at)
    VALUES (p_header_id, p_charge_id, p_description, p_amount, p_user_id, NOW());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_solar_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_insert_eb_solar_detail`(
    IN p_header_id INT, 
    IN p_company_name VARCHAR(255), 
    IN p_solar_id VARCHAR(255), 
    IN p_slots VARCHAR(50), 
    IN p_net_unit DECIMAL(18,4), 
    IN p_user_id INT
)
BEGIN
    INSERT INTO solar.eb_statement_solar_details (eb_header_id, company_name, solar_id, slots, net_unit, created_by, created_at)
    VALUES (p_header_id, p_company_name, p_solar_id, p_slots, p_net_unit, p_user_id, NOW());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_eb_statement_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_insert_eb_statement_solar`(

    IN p_solar_id INT,

    IN p_month VARCHAR(20),

    IN p_pdf_path VARCHAR(255)

)
BEGIN

    INSERT INTO eb_statement_solar (solar_id, month, pdf_file_path)

    VALUES (p_solar_id, p_month, p_pdf_path);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insert_solar_charge_calculation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insert_solar_charge_calculation`(
    IN p_solar_id INT,
    IN p_month INT,
    IN p_year INT,
    IN p_charge_id INT,
    IN p_value DECIMAL(18,2),
    IN p_calculation TEXT
)
BEGIN
    INSERT INTO solar.charge_calculation (solar_id, month, year, charge_id, value, calculation)
    VALUES (p_solar_id, p_month, p_year, p_charge_id, p_value, p_calculation);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_eb_solar_charge` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_eb_solar_charge`(

    IN p_statement_id        INT,

    IN p_consumer_name       VARCHAR(200),

    IN p_consumer_service_no VARCHAR(50),

    IN p_mrc                 DECIMAL(15,2),

    IN p_omc                 DECIMAL(15,2),

    IN p_trc                 DECIMAL(15,2),

    IN p_oc                  DECIMAL(15,2),

    IN p_kp                  DECIMAL(15,2),

    IN p_ec                  DECIMAL(15,2),

    IN p_shc                 DECIMAL(15,2),

    IN p_oc2                 DECIMAL(15,2),

    IN p_dc                  DECIMAL(15,2)

)
BEGIN

    INSERT INTO eb_solar_statement_charges

        (statement_id, consumer_name, consumer_service_no,

         mrc, omc, trc, oc, kp, ec, shc, oc2, dc)

    VALUES

        (p_statement_id, p_consumer_name, p_consumer_service_no,

         p_mrc, p_omc, p_trc, p_oc, p_kp, p_ec, p_shc, p_oc2, p_dc);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_eb_solar_detail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_eb_solar_detail`(

    IN p_statement_id        INT,

    IN p_section_type        VARCHAR(30),

    IN p_label               VARCHAR(200),

    IN p_consumer_service_no VARCHAR(50),

    IN p_org_name            VARCHAR(100),

    IN p_allocated           DECIMAL(15,2),

    IN p_c1                  DECIMAL(15,2),

    IN p_c2                  DECIMAL(15,2),

    IN p_c3                  DECIMAL(15,2),

    IN p_c4                  DECIMAL(15,2),

    IN p_c5                  DECIMAL(15,2),

    IN p_total               DECIMAL(15,2)

)
BEGIN

    INSERT INTO eb_solar_statement_details

        (statement_id, section_type, label, consumer_service_no,

         org_name, allocated, c1, c2, c3, c4, c5, total)

    VALUES

        (p_statement_id, p_section_type, p_label, p_consumer_service_no,

         p_org_name, p_allocated, p_c1, p_c2, p_c3, p_c4, p_c5, p_total);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_eb_solar_header` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_eb_solar_header`(

    IN p_statement_id              INT,

    IN p_edc_name                  VARCHAR(100),

    IN p_service_number            VARCHAR(50),

    IN p_company_name              VARCHAR(200),

    IN p_statement_month           VARCHAR(20),

    IN p_statement_year            INT,

    IN p_injection_voltage         VARCHAR(20),

    IN p_allow_lower_adjustment    VARCHAR(5),

    IN p_allocation_completed_date VARCHAR(20)

)
BEGIN

    INSERT INTO eb_solar_statement_header

        (statement_id, edc_name, service_number, company_name,

         statement_month, statement_year, injection_voltage,

         allow_lower_adjustment, allocation_completed_date)

    VALUES

        (p_statement_id, p_edc_name, p_service_number, p_company_name,

         p_statement_month, p_statement_year, p_injection_voltage,

         p_allow_lower_adjustment, p_allocation_completed_date);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_search_eb_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_search_eb_solar`(
                IN p_solar_id INT,
                IN p_year INT,
                IN p_month VARCHAR(50),
                IN p_keyword VARCHAR(255),
                IN p_order_by VARCHAR(50),
                IN p_limit INT,
                IN p_offset INT
            )
BEGIN
                -- Result Set 1: Total Count
                SELECT COUNT(*) 
                FROM solar.eb_statement_solar es
                WHERE (p_solar_id IS NULL OR es.solar_id = p_solar_id)
                  AND (p_year IS NULL OR es.year = p_year)
                  AND (p_month IS NULL OR es.month = p_month COLLATE utf8mb4_unicode_ci)
                  AND (p_keyword IS NULL OR es.pdf_file_path LIKE CONCAT('%', p_keyword, '%') COLLATE utf8mb4_unicode_ci);

                -- Result Set 2: Paginated Data
                SELECT es.id, es.solar_id, es.month, es.year, es.pdf_file_path, es.is_submitted, 
                       mw.windmill_name,
                       COALESCE(es.modified_at, es.created_at) as submitted_time, u.name as submitted_by
                FROM solar.eb_statement_solar es
                LEFT JOIN masters.master_windmill mw ON es.solar_id = mw.id
                LEFT JOIN masters.users u ON es.created_by = u.id
                WHERE (p_solar_id IS NULL OR es.solar_id = p_solar_id)
                  AND (p_year IS NULL OR es.year = p_year)
                  AND (p_month IS NULL OR es.month = p_month COLLATE utf8mb4_unicode_ci)
                  AND (p_keyword IS NULL OR es.pdf_file_path LIKE CONCAT('%', p_keyword, '%') COLLATE utf8mb4_unicode_ci)
                ORDER BY submitted_time DESC
                LIMIT p_limit OFFSET p_offset;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_search_eb_statement_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_search_eb_statement_solar`(

    IN p_solar_id INT,

    IN p_year INT,

    IN p_month INT,

    IN p_status VARCHAR(50),

    IN p_keyword VARCHAR(100),

    IN p_limit INT,

    IN p_offset INT

)
BEGIN

    SET @sql = CONCAT(

        'SELECT s.id, s.reading_date, s.solar_id, w.windmill_number AS solar_number, s.exported_kwh, s.consumed_kwh, ',

        's.unit_value_export, s.net_payable, s.status, s.year, s.month FROM eb_statement_solar s LEFT JOIN windmill_master w ON s.solar_id = w.id WHERE 1=1'

    );

    IF p_solar_id IS NOT NULL AND p_solar_id <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.solar_id = ', QUOTE(p_solar_id));

    END IF;

    IF p_year IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.year = ', p_year);

    END IF;

    IF p_month IS NOT NULL THEN

        SET @sql = CONCAT(@sql, ' AND s.month = ', p_month);

    END IF;

    IF p_status IS NOT NULL AND p_status <> '' THEN

        SET @sql = CONCAT(@sql, ' AND s.status = ', QUOTE(p_status));

    END IF;

    IF p_keyword IS NOT NULL AND p_keyword <> '' THEN

        SET @sql = CONCAT(

            @sql,

            ' AND (w.windmill_number LIKE ', QUOTE(CONCAT('%', p_keyword, '%')),

            ' OR s.status LIKE ', QUOTE(CONCAT('%', p_keyword, '%')), ')'

        );

    END IF;

    SET @sql = CONCAT(@sql, ' LIMIT ', p_limit, ' OFFSET ', p_offset);

    PREPARE stmt FROM @sql;

    EXECUTE stmt;

    DEALLOCATE PREPARE stmt;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_submit_eb_solar` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_submit_eb_solar`(IN p_header_id INT)
BEGIN
    UPDATE solar.eb_statement_solar SET is_submitted = 1, modified_at = NOW() WHERE id = p_header_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_eb_solar_year` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_eb_solar_year`(IN p_id INT, IN p_year INT)
BEGIN
    UPDATE solar.eb_statement_solar SET year = p_year WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_solar_charge_calculation_value` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_solar_charge_calculation_value`(
    IN p_value DECIMAL(18,2),
    IN p_solar_id INT,
    IN p_month INT,
    IN p_year INT,
    IN p_charge_id INT
)
BEGIN
    UPDATE solar.charge_calculation 
    SET value = p_value 
    WHERE solar_id = p_solar_id AND month = p_month AND year = p_year AND charge_id = p_charge_id;
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

-- Dump completed on 2026-05-12 12:05:19
