import turfCenter from "@turf/center";
import { type AllGeoJSON } from "@turf/turf";
import { type Feature, type Point } from "geojson";
import { useEffect, useState } from "react";

export function useFeaturesCenter(features: Feature[]) {
  const [center, setCenter] = useState<Feature<Point> | null>(null);

  useEffect(() => {
    if (features.length === 0) {
      setCenter(null)
      return;
    }
    const collection: AllGeoJSON = {
      type: "FeatureCollection",
      features,
    } as any;
    const center = turfCenter(collection);
    setCenter(center);
  }, [features]);

  return center;
}
