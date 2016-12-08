# AdvancedGeoWeb
Repository for the course

# Database setup

## Installation

```bash
sudo apt-get update

# Install PostGreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Add a user 'dbuser'
sudo -u postgres createuser -P dbuser

# Create a database 'geodb'
sudo -u postgres createdb -O dbuser geodb

# Install PostGIS
sudo apt-get install -y postgis postgresql-9.5-postgis-2.2

# Install PostGIS extension for the database 'geodb'
sudo -u postgres psql -c "CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;" geodb
```
Source: http://www.paulshapley.com/2016/04/how-to-install-postgresql-95-and.html

## Table setup with psql

```sql

-- Create a table for user's postions
CREATE TABLE locations (
    id       BIGSERIAL,
    time   timestamp DEFAULT current_timestamp
);

-- install postgis
CREATE EXTENSION postgis;

-- Add a postgis geometry column (schema: public, table: locations, column: geom, srid: 4326, type: POINT, dimensions: 2)
SELECT AddGeometryColumn ('public','locations','geom',4326,'POINT',2);

-- Example: Add point
INSERT INTO locations(geom)
VALUES(ST_GeomFromText('POINT(-59.0513 53.7331)', 4326));

-- Example: Get point
SELECT ST_AsText(geom) FROM locations;

-- Example: Get all data of the last 60 seconds
SELECT * FROM locations WHERE time > NOW() - interval '60 sec';

-- Create table for wms locations
CREATE TABLE wms (
    id      	BIGSERIAL,
    path	VARCHAR,
    time   timestamp DEFAULT current_timestamp
);

-- Example: Add wms image path
INSERT INTO wms(path)
VALUES( '/usr/l_loho01/wms/wms-0001.png');


```
