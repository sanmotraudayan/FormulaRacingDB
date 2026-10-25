CREATE DATABASE  IF NOT EXISTS `formularacingdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `formularacingdb`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: formularacingdb
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `car`
--

DROP TABLE IF EXISTS `car`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car` (
  `car_id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `car_number` int NOT NULL,
  `car_model` varchar(100) NOT NULL,
  `engine_manufacturer` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`car_id`),
  UNIQUE KEY `uq_team_car_number` (`team_id`,`car_number`),
  CONSTRAINT `fk_car_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`),
  CONSTRAINT `chk_car_number` CHECK ((`car_number` between 1 and 99))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car`
--

LOCK TABLES `car` WRITE;
/*!40000 ALTER TABLE `car` DISABLE KEYS */;
INSERT INTO `car` VALUES (1,1,11,'Apex AR25','Apex Power'),(2,1,22,'Apex AR25','Apex Power'),(3,2,33,'Velocity V25','Velocity Engines'),(4,2,44,'Velocity V25','Velocity Engines'),(5,3,55,'Titan T25','Titan Powertrain'),(6,3,66,'Titan T25','Titan Powertrain'),(7,4,77,'Nova N25','Nova Engines'),(8,4,88,'Nova N25','Nova Engines');
/*!40000 ALTER TABLE `car` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `championship`
--

DROP TABLE IF EXISTS `championship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `championship` (
  `championship_id` int NOT NULL AUTO_INCREMENT,
  `championship_name` varchar(100) NOT NULL,
  `season_year` year NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'UPCOMING',
  PRIMARY KEY (`championship_id`),
  UNIQUE KEY `season_year` (`season_year`),
  CONSTRAINT `chk_championship_status` CHECK ((`status` in (_cp850'UPCOMING',_cp850'ONGOING',_cp850'COMPLETED')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `championship`
--

LOCK TABLES `championship` WRITE;
/*!40000 ALTER TABLE `championship` DISABLE KEYS */;
INSERT INTO `championship` VALUES (1,'Formula Racing Championship',2025,'COMPLETED'),(2,'Formula Racing Championship',2026,'ONGOING');
/*!40000 ALTER TABLE `championship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `circuit`
--

DROP TABLE IF EXISTS `circuit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `circuit` (
  `circuit_id` int NOT NULL AUTO_INCREMENT,
  `circuit_name` varchar(120) NOT NULL,
  `country` varchar(60) NOT NULL,
  `city` varchar(80) DEFAULT NULL,
  `circuit_length_km` decimal(6,3) NOT NULL,
  `number_of_turns` int NOT NULL,
  PRIMARY KEY (`circuit_id`),
  UNIQUE KEY `circuit_name` (`circuit_name`),
  CONSTRAINT `chk_circuit_length` CHECK ((`circuit_length_km` > 0)),
  CONSTRAINT `chk_circuit_turns` CHECK ((`number_of_turns` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `circuit`
--

LOCK TABLES `circuit` WRITE;
/*!40000 ALTER TABLE `circuit` DISABLE KEYS */;
INSERT INTO `circuit` VALUES (1,'Silverstone Circuit','United Kingdom','Silverstone',5.891,18),(2,'Monza Circuit','Italy','Monza',5.793,11),(3,'Suzuka Circuit','Japan','Suzuka',5.807,18),(4,'Marina Bay Circuit','Singapore','Singapore',4.940,19),(5,'Interlagos Circuit','Brazil','Sao Paulo',4.309,15);
/*!40000 ALTER TABLE `circuit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `constructorstandings`
--

DROP TABLE IF EXISTS `constructorstandings`;
/*!50001 DROP VIEW IF EXISTS `constructorstandings`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `constructorstandings` AS SELECT 
 1 AS `championship_id`,
 1 AS `team_id`,
 1 AS `team_name`,
 1 AS `total_points`,
 1 AS `drivers_scoring`,
 1 AS `race_wins`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `nationality` varchar(60) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `driver_number` int NOT NULL,
  PRIMARY KEY (`driver_id`),
  UNIQUE KEY `driver_number` (`driver_number`),
  CONSTRAINT `chk_driver_number` CHECK ((`driver_number` between 1 and 99))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (1,'Alex','Morgan','British','2000-04-12',11),(2,'Daniel','Reed','Australian','1999-08-21',22),(3,'Luca','Moretti','Italian','2001-02-15',33),(4,'Carlos','Vega','Spanish','1998-11-09',44),(5,'Felix','Schneider','German','2000-06-18',55),(6,'Oliver','Brooks','British','2002-01-25',66),(7,'Theo','Laurent','French','1999-09-14',77),(8,'Mateo','Silva','Brazilian','2001-12-03',88);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `driverstandings`
--

DROP TABLE IF EXISTS `driverstandings`;
/*!50001 DROP VIEW IF EXISTS `driverstandings`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `driverstandings` AS SELECT 
 1 AS `championship_id`,
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `total_points`,
 1 AS `race_wins`,
 1 AS `podiums`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `lap`
--

DROP TABLE IF EXISTS `lap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lap` (
  `lap_id` bigint NOT NULL AUTO_INCREMENT,
  `result_id` int NOT NULL,
  `lap_number` int NOT NULL,
  `lap_time_seconds` decimal(8,3) NOT NULL,
  `is_fastest_lap` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`lap_id`),
  UNIQUE KEY `uq_result_lap` (`result_id`,`lap_number`),
  KEY `idx_lap_time` (`lap_time_seconds`),
  CONSTRAINT `fk_lap_result` FOREIGN KEY (`result_id`) REFERENCES `raceresult` (`result_id`),
  CONSTRAINT `chk_lap_number` CHECK ((`lap_number` > 0)),
  CONSTRAINT `chk_lap_time` CHECK ((`lap_time_seconds` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lap`
--

LOCK TABLES `lap` WRITE;
/*!40000 ALTER TABLE `lap` DISABLE KEYS */;
INSERT INTO `lap` VALUES (1,1,3,90.300,0),(2,1,2,89.790,1),(3,1,1,90.280,0),(4,2,3,90.440,0),(5,2,2,90.430,0),(6,2,1,90.420,0),(7,3,3,90.580,0),(8,3,2,90.570,0),(9,3,1,90.560,0),(10,4,3,90.720,0),(11,4,2,90.710,0),(12,4,1,90.700,0),(13,5,3,90.370,0),(14,5,2,90.360,0),(15,5,1,90.350,0),(16,6,3,90.510,0),(17,6,2,90.500,0),(18,6,1,90.490,0),(19,7,3,90.650,0),(20,7,2,90.640,0),(21,7,1,90.630,0),(22,8,3,90.790,0),(23,8,2,90.780,0),(24,8,1,90.770,0),(25,9,3,90.640,0),(26,9,2,90.130,1),(27,9,1,90.620,0),(28,10,3,90.500,0),(29,10,2,90.490,0),(30,10,1,90.480,0),(31,11,3,90.920,0),(32,11,2,90.910,0),(33,11,1,90.900,0),(34,12,3,90.780,0),(35,12,2,90.770,0),(36,12,1,90.760,0),(37,13,3,90.710,0),(38,13,2,90.700,0),(39,13,1,90.690,0),(40,14,3,90.570,0),(41,14,2,90.560,0),(42,14,1,90.550,0),(43,15,3,90.990,0),(44,15,2,90.980,0),(45,15,1,90.970,0),(46,16,3,90.850,0),(47,16,2,90.840,0),(48,16,1,90.830,0),(49,17,3,90.980,0),(50,17,2,90.470,1),(51,17,1,90.960,0),(52,18,3,90.840,0),(53,18,2,90.830,0),(54,18,1,90.820,0),(55,19,3,90.700,0),(56,19,2,90.690,0),(57,19,1,90.680,0),(58,20,3,90.770,0),(59,20,2,90.760,0),(60,20,1,90.750,0),(61,21,3,91.120,0),(62,21,2,91.110,0),(63,21,1,91.100,0),(64,22,3,90.910,0),(65,22,2,90.900,0),(66,22,1,90.890,0),(67,23,3,91.050,0),(68,23,2,91.040,0),(69,23,1,91.030,0),(70,24,3,91.190,0),(71,24,2,91.180,0),(72,24,1,91.170,0),(73,25,3,90.900,0),(74,25,2,90.390,1),(75,25,1,90.880,0),(76,26,3,91.320,0),(77,26,2,91.310,0),(78,26,1,91.300,0),(79,27,3,91.040,0),(80,27,2,91.030,0),(81,27,1,91.020,0),(82,28,3,91.180,0),(83,28,2,91.170,0),(84,28,1,91.160,0),(85,29,3,90.970,0),(86,29,2,90.960,0),(87,29,1,90.950,0),(88,30,3,91.390,0),(89,30,2,91.380,0),(90,30,1,91.370,0),(91,31,3,91.110,0),(92,31,2,91.100,0),(93,31,1,91.090,0),(94,32,3,91.250,0),(95,32,2,91.240,0),(96,32,1,91.230,0),(97,33,3,91.240,0),(98,33,2,90.730,1),(99,33,1,91.220,0),(100,34,3,91.380,0),(101,34,2,91.370,0),(102,34,1,91.360,0),(103,35,3,91.100,0),(104,35,2,91.090,0),(105,35,1,91.080,0),(106,36,3,91.520,0),(107,36,2,91.510,0),(108,36,1,91.500,0),(109,37,3,91.450,0),(110,37,2,91.440,0),(111,37,1,91.430,0),(112,38,3,91.170,0),(113,38,2,91.160,0),(114,38,1,91.150,0),(115,39,3,91.310,0),(116,39,2,91.300,0),(117,39,1,91.290,0),(118,40,3,91.590,0),(119,40,2,91.580,0),(120,40,1,91.570,0);
/*!40000 ALTER TABLE `lap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penalty`
--

DROP TABLE IF EXISTS `penalty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penalty` (
  `penalty_id` int NOT NULL AUTO_INCREMENT,
  `result_id` int NOT NULL,
  `penalty_type` varchar(50) NOT NULL,
  `penalty_description` varchar(255) DEFAULT NULL,
  `time_penalty_seconds` decimal(7,2) NOT NULL DEFAULT '0.00',
  `position_penalty` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`penalty_id`),
  KEY `idx_penalty_result` (`result_id`),
  CONSTRAINT `fk_penalty_result` FOREIGN KEY (`result_id`) REFERENCES `raceresult` (`result_id`),
  CONSTRAINT `chk_penalty_position` CHECK ((`position_penalty` >= 0)),
  CONSTRAINT `chk_penalty_time` CHECK ((`time_penalty_seconds` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penalty`
--

LOCK TABLES `penalty` WRITE;
/*!40000 ALTER TABLE `penalty` DISABLE KEYS */;
INSERT INTO `penalty` VALUES (1,6,'TIME PENALTY','Track limits violation',5.00,0),(2,14,'GRID PENALTY','Unsafe release investigation',0.00,3),(3,27,'TIME PENALTY','Causing a collision',10.00,0),(4,35,'WARNING','Repeated track limits violation',0.00,0);
/*!40000 ALTER TABLE `penalty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pitstop`
--

DROP TABLE IF EXISTS `pitstop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pitstop` (
  `pit_stop_id` int NOT NULL AUTO_INCREMENT,
  `result_id` int NOT NULL,
  `tyre_id` int NOT NULL,
  `lap_number` int NOT NULL,
  `duration_seconds` decimal(7,3) NOT NULL,
  PRIMARY KEY (`pit_stop_id`),
  UNIQUE KEY `uq_result_pit_lap` (`result_id`,`lap_number`),
  KEY `fk_pit_tyre` (`tyre_id`),
  CONSTRAINT `fk_pit_result` FOREIGN KEY (`result_id`) REFERENCES `raceresult` (`result_id`),
  CONSTRAINT `fk_pit_tyre` FOREIGN KEY (`tyre_id`) REFERENCES `tyrecompound` (`tyre_id`),
  CONSTRAINT `chk_pit_duration` CHECK ((`duration_seconds` > 0)),
  CONSTRAINT `chk_pit_lap` CHECK ((`lap_number` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pitstop`
--

LOCK TABLES `pitstop` WRITE;
/*!40000 ALTER TABLE `pitstop` DISABLE KEYS */;
INSERT INTO `pitstop` VALUES (1,1,1,13,2.180),(2,10,1,10,2.900),(3,19,1,37,2.660),(4,25,1,25,2.180),(5,35,2,25,2.980),(6,5,2,25,2.500),(7,14,2,22,2.260),(8,20,2,10,2.740),(9,29,2,37,2.500),(10,38,2,34,2.260),(11,2,2,16,2.260),(12,9,3,37,2.820),(13,18,3,34,2.580),(14,27,3,31,2.340),(15,33,3,19,2.820),(16,6,3,28,2.580),(17,13,1,19,2.180),(18,22,1,16,2.900),(19,31,1,13,2.660),(20,39,3,37,2.340),(21,3,3,19,2.340),(22,12,3,16,2.100),(23,17,2,31,2.500),(24,28,1,34,2.420),(25,34,1,22,2.900),(26,7,1,31,2.660),(27,16,1,28,2.420),(28,23,2,19,2.980),(29,32,2,16,2.740),(30,37,1,31,2.180),(31,4,1,22,2.420),(32,11,2,13,2.980),(33,21,3,13,2.820),(34,26,2,28,2.260),(35,36,3,28,2.100),(36,8,2,34,2.740),(37,15,3,25,2.340),(38,24,3,22,2.100),(39,30,3,10,2.580),(40,40,1,10,2.420);
/*!40000 ALTER TABLE `pitstop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `pitstopanalytics`
--

DROP TABLE IF EXISTS `pitstopanalytics`;
/*!50001 DROP VIEW IF EXISTS `pitstopanalytics`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `pitstopanalytics` AS SELECT 
 1 AS `team_name`,
 1 AS `total_pit_stops`,
 1 AS `average_duration`,
 1 AS `fastest_pit_stop`,
 1 AS `slowest_pit_stop`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `race`
--

DROP TABLE IF EXISTS `race`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `race` (
  `race_id` int NOT NULL AUTO_INCREMENT,
  `championship_id` int NOT NULL,
  `circuit_id` int NOT NULL,
  `race_name` varchar(120) NOT NULL,
  `round_number` int NOT NULL,
  `race_date` date NOT NULL,
  `scheduled_laps` int NOT NULL,
  `race_status` varchar(20) NOT NULL DEFAULT 'SCHEDULED',
  PRIMARY KEY (`race_id`),
  UNIQUE KEY `uq_championship_round` (`championship_id`,`round_number`),
  KEY `fk_race_circuit` (`circuit_id`),
  KEY `idx_race_date` (`race_date`),
  CONSTRAINT `fk_race_championship` FOREIGN KEY (`championship_id`) REFERENCES `championship` (`championship_id`),
  CONSTRAINT `fk_race_circuit` FOREIGN KEY (`circuit_id`) REFERENCES `circuit` (`circuit_id`),
  CONSTRAINT `chk_race_round` CHECK ((`round_number` > 0)),
  CONSTRAINT `chk_race_status` CHECK ((`race_status` in (_utf8mb4'SCHEDULED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `chk_scheduled_laps` CHECK ((`scheduled_laps` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `race`
--

LOCK TABLES `race` WRITE;
/*!40000 ALTER TABLE `race` DISABLE KEYS */;
INSERT INTO `race` VALUES (1,1,1,'British Grand Prix',1,'2025-03-16',52,'COMPLETED'),(2,1,2,'Italian Grand Prix',2,'2025-04-13',53,'COMPLETED'),(3,1,3,'Japanese Grand Prix',3,'2025-05-11',53,'COMPLETED'),(4,1,4,'Singapore Grand Prix',4,'2025-06-08',62,'COMPLETED'),(5,1,5,'Brazilian Grand Prix',5,'2025-07-06',71,'COMPLETED');
/*!40000 ALTER TABLE `race` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raceincident`
--

DROP TABLE IF EXISTS `raceincident`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raceincident` (
  `incident_id` int NOT NULL AUTO_INCREMENT,
  `race_id` int NOT NULL,
  `result_id` int DEFAULT NULL,
  `lap_number` int DEFAULT NULL,
  `incident_type` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `safety_car_deployed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`incident_id`),
  KEY `fk_incident_race` (`race_id`),
  KEY `fk_incident_result` (`result_id`),
  CONSTRAINT `fk_incident_race` FOREIGN KEY (`race_id`) REFERENCES `race` (`race_id`),
  CONSTRAINT `fk_incident_result` FOREIGN KEY (`result_id`) REFERENCES `raceresult` (`result_id`),
  CONSTRAINT `chk_incident_lap` CHECK (((`lap_number` is null) or (`lap_number` > 0)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raceincident`
--

LOCK TABLES `raceincident` WRITE;
/*!40000 ALTER TABLE `raceincident` DISABLE KEYS */;
INSERT INTO `raceincident` VALUES (1,1,6,12,'TRACK LIMITS','Track limits violation reported',0),(2,2,14,20,'UNSAFE RELEASE','Unsafe release investigated',0),(3,3,18,15,'COLLISION','Minor collision between cars',1),(4,4,27,31,'DEBRIS','Debris reported on circuit',1),(5,5,35,44,'TRACK LIMITS','Repeated track limits violation',0);
/*!40000 ALTER TABLE `raceincident` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raceresult`
--

DROP TABLE IF EXISTS `raceresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raceresult` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `race_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `team_id` int NOT NULL,
  `car_id` int DEFAULT NULL,
  `finishing_position` int DEFAULT NULL,
  `points_awarded` decimal(5,2) NOT NULL DEFAULT '0.00',
  `result_status` varchar(20) NOT NULL DEFAULT 'FINISHED',
  `total_race_time_seconds` decimal(12,3) DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `uq_race_driver` (`race_id`,`driver_id`),
  KEY `fk_result_driver` (`driver_id`),
  KEY `fk_result_car` (`car_id`),
  KEY `idx_result_team_race` (`team_id`,`race_id`),
  CONSTRAINT `fk_result_car` FOREIGN KEY (`car_id`) REFERENCES `car` (`car_id`),
  CONSTRAINT `fk_result_driver` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`),
  CONSTRAINT `fk_result_race` FOREIGN KEY (`race_id`) REFERENCES `race` (`race_id`),
  CONSTRAINT `fk_result_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`),
  CONSTRAINT `chk_finishing_position` CHECK (((`finishing_position` is null) or (`finishing_position` > 0))),
  CONSTRAINT `chk_points` CHECK ((`points_awarded` >= 0)),
  CONSTRAINT `chk_race_time` CHECK (((`total_race_time_seconds` is null) or (`total_race_time_seconds` > 0))),
  CONSTRAINT `chk_result_status` CHECK ((`result_status` in (_utf8mb4'FINISHED',_utf8mb4'RETIRED',_utf8mb4'DISQUALIFIED',_utf8mb4'DNS',_utf8mb4'DNF')))
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raceresult`
--

LOCK TABLES `raceresult` WRITE;
/*!40000 ALTER TABLE `raceresult` DISABLE KEYS */;
INSERT INTO `raceresult` VALUES (1,1,1,1,1,1,25.00,'FINISHED',5400.120),(2,1,3,2,3,2,18.00,'FINISHED',5402.450),(3,1,5,3,5,3,15.00,'FINISHED',5404.210),(4,1,7,4,7,4,12.00,'FINISHED',5406.330),(5,1,2,1,2,5,10.00,'FINISHED',5408.500),(6,1,4,2,4,6,8.00,'FINISHED',5410.620),(7,1,6,3,6,7,6.00,'FINISHED',5412.800),(8,1,8,4,8,8,4.00,'FINISHED',5415.100),(9,2,3,2,3,1,25.00,'FINISHED',5100.100),(10,2,1,1,1,2,18.00,'FINISHED',5102.200),(11,2,7,4,7,3,15.00,'FINISHED',5104.300),(12,2,5,3,5,4,12.00,'FINISHED',5106.400),(13,2,4,2,4,5,10.00,'FINISHED',5108.500),(14,2,2,1,2,6,8.00,'FINISHED',5110.600),(15,2,8,4,8,7,6.00,'FINISHED',5112.700),(16,2,6,3,6,8,4.00,'FINISHED',5114.800),(17,3,5,3,5,1,25.00,'FINISHED',5200.100),(18,3,3,2,3,2,18.00,'FINISHED',5202.200),(19,3,1,1,1,3,15.00,'FINISHED',5204.300),(20,3,2,1,2,4,12.00,'FINISHED',5206.400),(21,3,7,4,7,5,10.00,'FINISHED',5208.500),(22,3,4,2,4,6,8.00,'FINISHED',5210.600),(23,3,6,3,6,7,6.00,'FINISHED',5212.700),(24,3,8,4,8,8,4.00,'FINISHED',5214.800),(25,4,1,1,1,1,25.00,'FINISHED',6000.100),(26,4,7,4,7,2,18.00,'FINISHED',6002.200),(27,4,3,2,3,3,15.00,'FINISHED',6004.300),(28,4,5,3,5,4,12.00,'FINISHED',6006.400),(29,4,2,1,2,5,10.00,'FINISHED',6008.500),(30,4,8,4,8,6,8.00,'FINISHED',6010.600),(31,4,4,2,4,7,6.00,'FINISHED',6012.700),(32,4,6,3,6,8,4.00,'FINISHED',6014.800),(33,5,3,2,3,1,25.00,'FINISHED',4800.100),(34,5,5,3,5,2,18.00,'FINISHED',4802.200),(35,5,1,1,1,3,15.00,'FINISHED',4804.300),(36,5,7,4,7,4,12.00,'FINISHED',4806.400),(37,5,6,3,6,5,10.00,'FINISHED',4808.500),(38,5,2,1,2,6,8.00,'FINISHED',4810.600),(39,5,4,2,4,7,6.00,'FINISHED',4812.700),(40,5,8,4,8,8,4.00,'FINISHED',4814.800);
/*!40000 ALTER TABLE `raceresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sponsor`
--

DROP TABLE IF EXISTS `sponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sponsor` (
  `sponsor_id` int NOT NULL AUTO_INCREMENT,
  `sponsor_name` varchar(120) NOT NULL,
  `industry` varchar(80) DEFAULT NULL,
  `country` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`sponsor_id`),
  UNIQUE KEY `sponsor_name` (`sponsor_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sponsor`
--

LOCK TABLES `sponsor` WRITE;
/*!40000 ALTER TABLE `sponsor` DISABLE KEYS */;
INSERT INTO `sponsor` VALUES (1,'Vertex Technologies','Technology','United States'),(2,'AeroFuel','Energy','United Kingdom'),(3,'Quantum Systems','Engineering','Germany'),(4,'Velocity Financial','Finance','Italy');
/*!40000 ALTER TABLE `sponsor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) NOT NULL,
  `base_country` varchar(60) NOT NULL,
  `team_principal` varchar(100) DEFAULT NULL,
  `founded_year` year DEFAULT NULL,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `team_name` (`team_name`),
  CONSTRAINT `chk_team_founded` CHECK (((`founded_year` is null) or (`founded_year` >= 1900)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES (1,'Apex Racing','United Kingdom','James Carter',2010),(2,'Velocity GP','Italy','Marco Rossi',2008),(3,'Titan Motorsport','Germany','Hans Weber',2012),(4,'Nova Racing','France','Louis Martin',2015);
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teamdriver`
--

DROP TABLE IF EXISTS `teamdriver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teamdriver` (
  `team_driver_id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `championship_id` int NOT NULL,
  `contract_start` date DEFAULT NULL,
  `contract_end` date DEFAULT NULL,
  PRIMARY KEY (`team_driver_id`),
  UNIQUE KEY `uq_driver_season` (`driver_id`,`championship_id`),
  KEY `fk_td_team` (`team_id`),
  KEY `fk_td_championship` (`championship_id`),
  CONSTRAINT `fk_td_championship` FOREIGN KEY (`championship_id`) REFERENCES `championship` (`championship_id`),
  CONSTRAINT `fk_td_driver` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`),
  CONSTRAINT `fk_td_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`),
  CONSTRAINT `chk_contract_dates` CHECK (((`contract_end` is null) or (`contract_start` is null) or (`contract_end` >= `contract_start`)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teamdriver`
--

LOCK TABLES `teamdriver` WRITE;
/*!40000 ALTER TABLE `teamdriver` DISABLE KEYS */;
INSERT INTO `teamdriver` VALUES (1,1,1,1,'2025-01-01','2025-12-31'),(2,1,2,1,'2025-01-01','2025-12-31'),(3,2,3,1,'2025-01-01','2025-12-31'),(4,2,4,1,'2025-01-01','2025-12-31'),(5,3,5,1,'2025-01-01','2025-12-31'),(6,3,6,1,'2025-01-01','2025-12-31'),(7,4,7,1,'2025-01-01','2025-12-31'),(8,4,8,1,'2025-01-01','2025-12-31');
/*!40000 ALTER TABLE `teamdriver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teamsponsor`
--

DROP TABLE IF EXISTS `teamsponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teamsponsor` (
  `team_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `championship_id` int NOT NULL,
  `sponsorship_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`team_id`,`sponsor_id`,`championship_id`),
  KEY `fk_ts_sponsor` (`sponsor_id`),
  KEY `fk_ts_championship` (`championship_id`),
  CONSTRAINT `fk_ts_championship` FOREIGN KEY (`championship_id`) REFERENCES `championship` (`championship_id`),
  CONSTRAINT `fk_ts_sponsor` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsor` (`sponsor_id`),
  CONSTRAINT `fk_ts_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`),
  CONSTRAINT `chk_sponsorship_amount` CHECK ((`sponsorship_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teamsponsor`
--

LOCK TABLES `teamsponsor` WRITE;
/*!40000 ALTER TABLE `teamsponsor` DISABLE KEYS */;
INSERT INTO `teamsponsor` VALUES (1,1,1,12000500.00),(1,2,1,8000000.00),(2,4,1,10000000.00),(3,3,1,9000000.00),(4,1,1,6000000.00);
/*!40000 ALTER TABLE `teamsponsor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyrecompound`
--

DROP TABLE IF EXISTS `tyrecompound`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyrecompound` (
  `tyre_id` int NOT NULL AUTO_INCREMENT,
  `compound_name` varchar(40) NOT NULL,
  `tyre_type` varchar(20) NOT NULL,
  PRIMARY KEY (`tyre_id`),
  UNIQUE KEY `compound_name` (`compound_name`),
  CONSTRAINT `chk_tyre_type` CHECK ((`tyre_type` in (_cp850'DRY',_cp850'INTERMEDIATE',_cp850'WET')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyrecompound`
--

LOCK TABLES `tyrecompound` WRITE;
/*!40000 ALTER TABLE `tyrecompound` DISABLE KEYS */;
INSERT INTO `tyrecompound` VALUES (1,'Soft','DRY'),(2,'Medium','DRY'),(3,'Hard','DRY'),(4,'Intermediate','INTERMEDIATE'),(5,'Wet','WET');
/*!40000 ALTER TABLE `tyrecompound` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `constructorstandings`
--

/*!50001 DROP VIEW IF EXISTS `constructorstandings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `constructorstandings` AS select `r`.`championship_id` AS `championship_id`,`t`.`team_id` AS `team_id`,`t`.`team_name` AS `team_name`,sum(`rr`.`points_awarded`) AS `total_points`,count(distinct `rr`.`driver_id`) AS `drivers_scoring`,count(distinct (case when ((`rr`.`finishing_position` = 1) and (`rr`.`result_status` = 'FINISHED')) then `rr`.`result_id` end)) AS `race_wins` from ((`raceresult` `rr` join `race` `r` on((`rr`.`race_id` = `r`.`race_id`))) join `team` `t` on((`rr`.`team_id` = `t`.`team_id`))) group by `r`.`championship_id`,`t`.`team_id`,`t`.`team_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `driverstandings`
--

/*!50001 DROP VIEW IF EXISTS `driverstandings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `driverstandings` AS select `r`.`championship_id` AS `championship_id`,`d`.`driver_id` AS `driver_id`,concat(`d`.`first_name`,' ',`d`.`last_name`) AS `driver_name`,sum(`rr`.`points_awarded`) AS `total_points`,sum((case when ((`rr`.`finishing_position` = 1) and (`rr`.`result_status` = 'FINISHED')) then 1 else 0 end)) AS `race_wins`,sum((case when ((`rr`.`finishing_position` between 1 and 3) and (`rr`.`result_status` = 'FINISHED')) then 1 else 0 end)) AS `podiums` from ((`raceresult` `rr` join `race` `r` on((`rr`.`race_id` = `r`.`race_id`))) join `driver` `d` on((`rr`.`driver_id` = `d`.`driver_id`))) group by `r`.`championship_id`,`d`.`driver_id`,`d`.`first_name`,`d`.`last_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `pitstopanalytics`
--

/*!50001 DROP VIEW IF EXISTS `pitstopanalytics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `pitstopanalytics` AS select `t`.`team_name` AS `team_name`,count(`ps`.`pit_stop_id`) AS `total_pit_stops`,round(avg(`ps`.`duration_seconds`),3) AS `average_duration`,min(`ps`.`duration_seconds`) AS `fastest_pit_stop`,max(`ps`.`duration_seconds`) AS `slowest_pit_stop` from ((`pitstop` `ps` join `raceresult` `rr` on((`ps`.`result_id` = `rr`.`result_id`))) join `team` `t` on((`rr`.`team_id` = `t`.`team_id`))) group by `t`.`team_id`,`t`.`team_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 14:51:44
