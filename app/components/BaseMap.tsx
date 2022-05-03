import MapboxDraw from "@mapbox/mapbox-gl-draw";
import drawStyles from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geocoderStyles from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef } from "react";
import { forwardRef } from "react";
import Map, {
  type ControlPosition,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  useControl,
  useMap,
} from "react-map-gl";
import { useRecoilValue } from "recoil";
import { envAtom } from "~/store/envAtom";

export function links() {
  return [
    { rel: "stylesheet", href: mapboxStyles },
    { rel: "stylesheet", href: geocoderStyles },
    { rel: "stylesheet", href: drawStyles },
  ];
}

export function MapboxGeocoderControl() {
  const env = useRecoilValue(envAtom);

  useControl(() => {
    return new MapboxGeocoder({
      accessToken: env.MAPBOX_ACCESS_TOKEN_PUBLIC,
      mapboxgl,
    });
  });

  return null;
}

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  onDrawCreate?: (e: MapboxDraw.DrawCreateEvent) => void;
  onDrawDelete?: (e: MapboxDraw.DrawDeleteEvent) => void;
  onDrawUpdate?: (e: MapboxDraw.DrawUpdateEvent) => void;
};

export function DrawControl(props: DrawControlProps) {
  const { current: map } = useMap();

  useEffect(() => {
    props.onDrawCreate && map?.on("draw.create", props.onDrawCreate);
    props.onDrawDelete && map?.on("draw.delete", props.onDrawDelete);
    props.onDrawUpdate && map?.on("draw.update", props.onDrawUpdate);

    return () => {
      props.onDrawCreate && map?.off("draw.create", props.onDrawCreate);
      props.onDrawDelete && map?.off("draw.delete", props.onDrawDelete);
      props.onDrawUpdate && map?.off("draw.update", props.onDrawUpdate);
    };
  }, [map, props.onDrawCreate, props.onDrawDelete, props.onDrawUpdate]);

  useControl(
    () => {
      const draw = new MapboxDraw(props);
      return draw;
    },
    { position: props.position }
  );

  return null;
}

export function MapboxLanguageControl() {
  useControl(() => {
    return new MapboxLanguage();
  });

  return null;
}

export const BaseMap = function BaseMap({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Map> & {
  children?: React.ReactNode;
}) {
  const env = useRecoilValue(envAtom);
  const geolocateControlRef = useRef<{ trigger: () => boolean }>(null);

  return (
    <Map
      mapboxAccessToken={env.MAPBOX_ACCESS_TOKEN_PUBLIC}
      onLoad={() => geolocateControlRef.current?.trigger()}
      {...props}
    >
      <MapboxGeocoderControl />
      <MapboxLanguageControl />
      <NavigationControl />
      <ScaleControl />
      <GeolocateControl
        ref={geolocateControlRef}
        fitBoundsOptions={{ maxZoom: 9, animate: false }}
      />
      {children}
    </Map>
  );
};
