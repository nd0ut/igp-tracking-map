import MapboxDraw from "@mapbox/mapbox-gl-draw";
import drawStyles from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import geocoderStyles from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl, { FillLayer, SymbolLayer } from "mapbox-gl";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import React, { useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import Map, {
  type ControlPosition,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  useControl,
  useMap,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import { useRecoilValue } from "recoil";
import { envAtom } from "~/store/envAtom";
import { type FeatureCollection, type Point, type MultiPolygon } from "geojson";
import { Feature, Polygon } from "@turf/turf";

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
  initialGeojson?: FeatureCollection<Polygon> | null;
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
      map?.on("load", () => {
        props.initialGeojson && draw.add(props.initialGeojson);
      });
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

const polygonsLayer: FillLayer = {
  id: "polygons",
  type: "fill",
  layout: {},
  paint: {
    "fill-color": "#EE82EE",
    "fill-opacity": 0.5,
  },
};

const pointsLayer: SymbolLayer = {
  id: "points",
  type: "symbol",
  layout: {
    "icon-image": "marker-icon",
    "icon-size": 0.1,
    "text-field": ["get", "name"],
    "text-offset": [0, 2],
  },
};

export const BaseMap = function BaseMap(
  props: React.ComponentPropsWithoutRef<typeof Map> & {
    children?: React.ReactNode;
    polygonsGeojson?: FeatureCollection<MultiPolygon> | null;
    pointsGeojson?: FeatureCollection<Point> | null;
  }
) {
  const env = useRecoilValue(envAtom);
  const mapRef: React.Ref<MapRef> = useRef(null);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    map.loadImage("/paw.png", (error, image) => {
      image && map.addImage("marker-icon", image);
    });
  }, []);

  return (
    <Map
      mapboxAccessToken={env.MAPBOX_ACCESS_TOKEN_PUBLIC}
      onLoad={onMapLoad}
      ref={mapRef}
      {...props}
    >
      <MapboxGeocoderControl />
      <MapboxLanguageControl />
      <NavigationControl />
      <ScaleControl />
      <GeolocateControl fitBoundsOptions={{ maxZoom: 9, animate: false }} />
      {props.polygonsGeojson && (
        <Source type="geojson" data={props.polygonsGeojson}>
          <Layer {...polygonsLayer} />
        </Source>
      )}
      {props.pointsGeojson && (
        <Source type="geojson" data={props.pointsGeojson}>
          <Layer {...pointsLayer} />
        </Source>
      )}
      {props.children}
    </Map>
  );
};
