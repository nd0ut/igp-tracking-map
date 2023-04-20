CREATE EXTENSION postgis SCHEMA public;

SELECT
  AddGeometryColumn (
    'public',
    'TrackingField',
    'location',
    3857,
    'POINT',
    2
  );

SELECT
  AddGeometryColumn (
    'public',
    'TrackingField',
    'polygons',
    3857,
    'MULTIPOLYGON',
    2
  );
