import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import { useRef } from "react";
import Map, {
  GeolocateControl,
  useControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geocoderStyles from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import mapboxgl from 'mapbox-gl';

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibmQwdXQiLCJhIjoiY2wybmQzMmEwMHA3aDNkbWEzcnd2YWtqOCJ9.vV_Q858IfAQgVuxb-FkXeg";

export function links() {
  return [
    { rel: "stylesheet", href: mapboxStyles },
    { rel: "stylesheet", href: geocoderStyles },
  ];
}

function MapboxGeocoderControl(props: { accessToken: string }) {
  useControl(() => {
    return new MapboxGeocoder({...props, mapboxgl});
  });

  return null;
}

function MapboxLanguageControl() {
  useControl(() => {
    return new MapboxLanguage();
  });

  return null;
}

export function BasicMap() {
  const geolocateControlRef = useRef<{ trigger: () => boolean }>(null);

  return (
    <Map
      onLoad={() => geolocateControlRef.current?.trigger()}
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: 30.308611,
        latitude: 59.9375,
        zoom: 9,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/outdoors-v11"
    >
      <MapboxGeocoderControl accessToken={MAPBOX_ACCESS_TOKEN} />
      <MapboxLanguageControl />
      <NavigationControl />
      <ScaleControl />
      <GeolocateControl
        ref={geolocateControlRef}
        fitBoundsOptions={{ maxZoom: 9, animate: false }}
      />
    </Map>
  );
}
