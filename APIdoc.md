# API Documentation

## /api/1.0/GPS

### POST

#### body parameters:
- GeoJSON geometry (see http://geojson.org/geojson-spec.html#geometry-objects) including longitude, latitude and accuracy as a GeoJSON properties object

Inserts the values (got from the body of the http request) into the database
- geometry, add the current position as Geometry with longitude and latitude with the default spatial reference identifier 4326
- accuracy, the number of digits from the geometry as Integer
- timestamp, automatically generate current timestamp as the geometry is inserted into the database

example: `curl --data "type=Feature&properties%5Btime%5D=17.1.2017%2C+11%3A30%3A38&properties%5Baccuracy%5D=1766&geometry%5Btype%5D=Point&geometry%5Bcoordinates%5D%5B%5D=7.6084083&geometry%5Bcoordinates%5D%5B%5D=51.9623597"`<br>
response: `Inserted location into the DB`

### GET returns params: id, ST_X(geom), ST_Y(geom), time, accuracy, crs

returns the following values from the database as json
- id, the identifier of the location
- ST_X(geom), the x-coordinate of the geometry as longitude
- ST_Y(geom), the y-coordinate of the geometry as latitude
- time, the timestamp of the location
- accuracy, the number of digits from the geometry as Integer
- crs, the coordinate reference system as String, always 'WGS84'

example: `curl -k https://giv-project13.uni-muenster.de:8443/api/1.0/GPS`<br>
response: `[{"id":"404","longitude":7.5955987,"latitude":51.9623682,"timestamp":"2016-12-12T11:16:03.883Z","accuracy":1910,"crs":"WGS84"},{"id":"405","longitude":7.6145142,"latitude":51.9614855,"timestamp":"2016-12-12T11:16:20.631Z","accuracy":1874,"crs":"WGS84"}]`

## /api/1.0/timeslider/:string/:bounds

### POST params: string, bbox

inserts the values (from the URL parameter) into the database
- string, the path name of the picture as varchar
- bbox, the boundingbox of the wms as varchar (containing two points indicating the diagonal, here first latitude then longitude is needed, as a constraint by leaflet)
- timestamp, automatically generate current timestamp as the geometry is inserted into the database

example: `curl -k -X POST 'https://giv-project13.uni-muenster.de:8443/api/1.0/timeslider/https%3A%2F%2Fgiv-project13.uni-muenster.de%2Fimages%2FPlants-PNG-File.png/%5B%5B51.960485500000004%2C%207.5945987%5D%2C%5B51.9735946%2C%207.598831000000001%5D%5D'`<br>
response: `Inserted history into the DB`

## /api/1.0/timeslider/:number

### GET returns params: time, path, bbox

returns the values of the wms from the last ':number' minutes as json
- time, the timestamp of the wms
- path, the path of the wms as varchar
- bbox, the boundingbox of the wms as a string (containing two points indicating the diagonal)

example: `curl --insecure https://giv-project13.uni-muenster.de:8443/api/1.0/timeslider/10`<br>
response: `[{"time":"2017-01-17T11:36:11.781Z","path":"/var/img/test0001.png"}]`

## /api/1.0/currentPicture

### GET returns params: path, bbox

returns the following values of the latest wms from the database as json
- path, the path of the image as a string
- bbox, the boundingbox of the wms as a string (containing two points indicating the diagonal)
- time, the timestamp of the wms

example: `curl -k https://giv-project13.uni-muenster.de:8443/api/1.0/currentPicture`<br>
response: `{"path":"20170126-105400_heatmap.png","bbox":"[[51.9766042, 7.2274019], [51.9735946, 7.5740204]]","time":"2017-01-26T09:54:00.455Z"}`
