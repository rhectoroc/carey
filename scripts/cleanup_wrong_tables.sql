-- CLEANUP SCRIPT (Ejecutar en adrielshealthcore)
-- Estas tablas se crearon por error en la base de datos equivocada.
-- Ejecuta esto SOLO si estás seguro de que quieres borrarlas de 'adrielshealthcore'.

DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS destinations;

-- Una vez borradas, asegúrate de crear la nueva base de datos y seleccionarla:
-- CREATE DATABASE careytour;
-- (Luego cambia a esa base de datos antes de correr el script schema.sql)
