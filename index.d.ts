declare module "@mapbox/mapbox-gl-language";
declare module "@mapbox/mapbox-gl-geocoder";

interface Window {
  env: {
    MAPBOX_ACCESS_TOKEN_PUBLIC: string;
  };
}
