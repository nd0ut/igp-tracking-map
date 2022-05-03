import type MapboxDraw from "@mapbox/mapbox-gl-draw";
// @ts-ignore
import geocoding from "@mapbox/mapbox-sdk/services/geocoding";
import turfArea from "@turf/area";
import turfCenter from "@turf/center";
import { type AllGeoJSON } from "@turf/turf";
import { type Feature, type Point } from "geojson";
import { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-async";
import { FullscreenControl } from "react-map-gl";
import { useRecoilValue } from "recoil";
import {
  BaseMap,
  DrawControl,
  links as baseMapLinks,
} from "~/components/BaseMap";
import { envAtom } from "~/store/envAtom";
import { Uploader, links as uploaderLinks } from "~/components/Uploader";
import { UploadcareFile } from "@uploadcare/uc-blocks/submodules/upload-client/upload-client";
import style from "~/styles/create-field.css";

export function links() {
  return [
    ...baseMapLinks(),
    ...uploaderLinks(),
    { rel: "stylesheet", href: style },
  ];
}

function useDrawFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);

  const onDrawCreate = useCallback(
    (e: MapboxDraw.DrawCreateEvent) => {
      setFeatures([...features, ...e.features]);
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
      const newFeatures = features.map((feature: Feature) => {
        const updatedFeature = e.features.find((f) => f.id === feature.id);
        if (updatedFeature) {
          return updatedFeature;
        }
        return feature;
      });
      setFeatures(newFeatures);
    },
    [features]
  );

  return { features, handlers: { onDrawUpdate, onDrawCreate, onDrawDelete } };
}

function useFeaturesCenter(features: Feature[]) {
  const [center, setCenter] = useState<Feature<Point> | null>(null);

  useEffect(() => {
    if (features.length === 0) {
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

function useFeaturesArea(features: Feature[]) {
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

function useAddress(point: Feature<Point> | null) {
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

export default function CreateField() {
  const { features, handlers: drawHandlers } = useDrawFeatures();
  const center = useFeaturesCenter(features);
  const address = useAddress(center);
  const area = useFeaturesArea(features);

  const [images, setImages] = useState<UploadcareFile[]>([]);
  const handleFilesChange = useCallback(
    (files: UploadcareFile[]) => setImages(files),
    []
  );

  console.log("center", center);
  console.log("features", features);
  console.log("address", address);
  console.log("area", area);
  console.log("files", images);

  return (
    <div className="container mx-auto h-full p-10">
      <div className="grid gap-5">
        <h1 className="text-3xl">Новое поле</h1>
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

        <div className="grid w-full grid-cols-[2fr_1fr]">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Где находится?</span>
            </label>
            <div className="h-96 w-full">
              <BaseMap
                initialViewState={{
                  longitude: 30.308611,
                  latitude: 59.9375,
                  zoom: 9,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/outdoors-v11"
              >
                <FullscreenControl />
                <DrawControl
                  position="top-left"
                  displayControlsDefault={false}
                  controls={{
                    trash: true,
                    polygon: true,
                  }}
                  defaultMode="draw_polygon"
                  {...drawHandlers}
                />
              </BaseMap>
            </div>
          </div>
          <div className="grid auto-rows-min gap-2 px-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Адрес</span>
              </label>
              <textarea
                rows={4}
                placeholder="Будет определён автоматически"
                className="textarea textarea-bordered resize-none w-full"
                defaultValue={address.data}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Площадь</span>
              </label>
              <input
                type="text"
                placeholder="Будет определён автоматически"
                className="input input-bordered w-full"
                defaultValue={area}
              />
            </div>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Фотографии</span>
          </label>
          {images && (
            <div className="grid grid-cols-[repeat(auto-fit,200px)] auto-cols-max grid-flow-row auto-rows-[200px] gap-5 w-full pb-5">
              {images.map((image) => (
                <uc-img key={image.uuid} uuid={image.uuid} />
              ))}
            </div>
          )}
          <Uploader onChange={handleFilesChange} />
        </div>

        <div className="form-control w-full max-w-xs">
          <button className="btn btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  );
}
