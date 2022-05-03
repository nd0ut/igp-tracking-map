import MapboxDraw from "@mapbox/mapbox-gl-draw";
import drawStyles from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geocoderStyles from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef } from "react";
import { forwardRef } from "react";
import Map, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  useControl,
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

export function DrawControl(
  props: ConstructorParameters<typeof MapboxDraw>[0]
) {
  useControl(() => {
    return new MapboxDraw(props);
  });

  return null;
}

export function MapboxLanguageControl() {
  useControl(() => {
    return new MapboxLanguage();
  });

  return null;
}

export const BaseMap = forwardRef(function BaseMap(
  {
    children,
    ...props
  }: React.ComponentPropsWithoutRef<typeof Map> & { children?: React.ReactNode },
  ref: React.ComponentPropsWithRef<typeof Map>['ref']
) {
  const env = useRecoilValue(envAtom);
  const geolocateControlRef = useRef<{ trigger: () => boolean }>(null);

  return (
    <Map
      ref={ref}
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
});
