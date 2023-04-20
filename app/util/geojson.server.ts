import { type FeatureCollection, type MultiPolygon, type Point } from "geojson";
import { db } from "~/util/db.server";

type AllFieldsQueryResult = [
  {
    jsonb_build_object: FeatureCollection<MultiPolygon | Point>;
  }
];

export const getFieldPolygonsGeojson = async () => {
  const rows = await db.$queryRaw<AllFieldsQueryResult>`
SELECT
  jsonb_build_object(
    'type',
    'FeatureCollection',
    'features',
    jsonb_agg(features.feature)
  )
FROM
  (
    SELECT
      jsonb_build_object(
        'type',
        'Feature',
        'id',
        id,
        'geometry',
        ST_AsGeoJSON(polygons) :: jsonb,
        'properties',
        to_jsonb(input) - 'location' - 'polygons'
      ) as feature
    FROM
      "TrackingField" input
  ) features;
  `;
  const json = rows?.[0]["jsonb_build_object"];
  if(!json.features) {
    return null
  }
  return json;
};


export const getFieldPointsGeojson = async () => {
  const rows = await db.$queryRaw<AllFieldsQueryResult>`
SELECT
  jsonb_build_object(
    'type',
    'FeatureCollection',
    'features',
    jsonb_agg(features.feature)
  )
FROM
  (
    SELECT
      jsonb_build_object(
        'type',
        'Feature',
        'id',
        id,
        'geometry',
        ST_AsGeoJSON(location) :: jsonb,
        'properties',
        to_jsonb(input) - 'polygons' - 'location'
      ) as feature
    FROM
      "TrackingField" input
  ) features;
  `;
  const json = rows?.[0]["jsonb_build_object"];
  if(!json.features) {
    return null
  }
  return json;
};

