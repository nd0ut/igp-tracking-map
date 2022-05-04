import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { type Feature, type Polygon } from "geojson";
import { useCallback, useState } from "react";

export function useDrawFeatures() {
  const [features, setFeatures] = useState<Feature<Polygon>[]>([]);

  const onDrawCreate = useCallback(
    (e: MapboxDraw.DrawCreateEvent) => {
      setFeatures([...features, ...(e.features as Feature<Polygon>[])]);
    },
    [features]
  );

  const onDrawDelete = useCallback(
    (e: MapboxDraw.DrawDeleteEvent) => {
      setFeatures(
        features.filter((feature: Feature) => e.features.includes(feature))
      );
    },
    [features]
  );

  const onDrawUpdate = useCallback(
    (e: MapboxDraw.DrawUpdateEvent) => {
      const newFeatures: Feature<Polygon>[] = features.map(
        (feature: Feature<Polygon>) => {
          const updatedFeature = (e.features as Feature<Polygon>[]).find(
            (f) => f.id === feature.id
          );
          if (updatedFeature) {
            return updatedFeature;
          }
          return feature;
        }
      );
      setFeatures(newFeatures);
    },
    [features]
  );

  return { features, handlers: { onDrawUpdate, onDrawCreate, onDrawDelete } };
}
