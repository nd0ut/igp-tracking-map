import turfArea from "@turf/area";
import { type Feature } from "geojson";
import { useEffect, useState } from "react";

export function useFeaturesArea(features: Feature[]) {
  const [area, setArea] = useState<number>(0);

  useEffect(() => {
    if (features.length === 0) {
      return;
    }
    const collection: any = {
      type: "FeatureCollection",
      features,
    };
    const area = turfArea(collection);
    setArea(area);
  }, [features]);

  return Math.floor(area);
}
