// @ts-ignore
import geocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { type Feature, type Point } from "geojson";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { useRecoilValue } from "recoil";
import { envAtom } from "~/store/envAtom";

export function useFeatureAddress(point: Feature<Point> | null) {
  const env = useRecoilValue(envAtom);

  const fetchAddress = useCallback(async () => {
    if (!point) {
      return "";
    }
    const geocodingClient = geocoding({
      accessToken: env.MAPBOX_ACCESS_TOKEN_PUBLIC,
    });
    const request = await geocodingClient.reverseGeocode({
      query: point.geometry.coordinates,
      types: [
        "region",
        "postcode",
        "district",
        "place",
        "locality",
        "neighborhood",
        "address",
      ],
      language: ["ru"],
    });

    const response = await request.send();
    const { body } = response;
    const firstFeature = body.features[0];
    const address = firstFeature.place_name_ru;
    return address;
  }, [env, point]);

  const { data, error, isPending } = useAsync({
    promiseFn: fetchAddress,
    playerId: 1,
  });

  return { data, error, isPending };
}
