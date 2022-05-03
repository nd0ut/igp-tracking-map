import {
  BaseMap,
  DrawControl,
  links as baseMapLinks,
} from "~/components/BaseMap";
import { FullscreenControl, MapRef } from "react-map-gl";
import { useRef } from "react";

export function links() {
  return [...baseMapLinks()];
}

export default function Create() {
  const mapRef: React.Ref<MapRef> = useRef(null);

  return (
    <div className="container mx-auto h-full p-10">
      <div className="grid gap-5">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Как назовём?</span>
          </label>
          <input
            type="text"
            placeholder="Непроходимое болото на юге Франции"
            className="input input-bordered w-full max-w-xs"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Где находится?</span>
          </label>
          <div className="h-96 w-full">
            <BaseMap
              ref={mapRef}
              initialViewState={{
                longitude: 30.308611,
                latitude: 59.9375,
                zoom: 9,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/outdoors-v11"
            >
              <FullscreenControl />
              <DrawControl />
            </BaseMap>
          </div>
        </div>
      </div>
    </div>
  );
}
