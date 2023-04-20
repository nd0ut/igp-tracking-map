import { type UploadcareFile } from "@uploadcare/uc-blocks/submodules/upload-client/upload-client";
import cx from "classnames";
import {
  type Feature,
  type Polygon,
  type MultiPolygon,
  type FeatureCollection,
  type Point,
} from "geojson";
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { FullscreenControl } from "react-map-gl";
import {
  BaseMap,
  DrawControl,
  links as baseMapLinks,
} from "~/components/BaseMap";
import { links as uploaderLinks, Uploader } from "~/components/Uploader";
import style from "~/styles/create-field.css";
import { useDrawFeatures } from "./useDrawFeatures";
import { useFeatureAddress } from "./useFeatureAddress";
import { useFeaturesArea } from "./useFeaturesArea";
import { useFeaturesCenter } from "./useFeaturesCenter";
import { useFetch } from "react-async";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import { useNavigate, useTransition } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { TrackingField } from "@prisma/client";
import turfCenter from "@turf/center";
import { Position } from "@turf/turf";

export type FeildFormData = {
  name: string;
  address: string;
  area: string;
  feature: MultiPolygon;
  images: UploadcareFile[];
};

export function links() {
  return [
    ...baseMapLinks(),
    ...uploaderLinks(),
    { rel: "stylesheet", href: style },
  ];
}

interface Props {
  title: string;
  fieldsGeojson: FeatureCollection<MultiPolygon | Point>;
  field?: TrackingField;
}

const useOtherFieldsGeojson = (
  fieldId: string | undefined,
  fieldsGeojson: FeatureCollection<MultiPolygon | Point>
) => {
  if (!fieldsGeojson) {
    return null;
  }

  return {
    ...fieldsGeojson,
    features: fieldsGeojson.features.filter((f) => f.id !== fieldId),
  };
};

const useInitialDrawedGeojson = (
  fieldId: string | undefined,
  fieldsGeojson: FeatureCollection<MultiPolygon | Point> | null
): FeatureCollection<Polygon> | null => {
  if (!fieldsGeojson) {
    return null;
  }
  const features: Feature<Polygon>[] = [];
  fieldsGeojson.features
    .filter((f) => f.id === fieldId && f.geometry.type === "MultiPolygon")
    .forEach((f) => {
      f.geometry.coordinates.forEach((coords) => {
        features.push({
          ...f,
          geometry: {
            type: "Polygon",
            coordinates: coords as Position[][],
          },
        });
      });
    });
    if(!features.length) {
      return null
    }
  return {
    type: "FeatureCollection",
    features,
  };
};

export function FieldForm({ field, title, fieldsGeojson }: Props) {
  const transition = useTransition();

  const featuresInputRef: MutableRefObject<HTMLInputElement | null> =
    useRef(null);
  const imagesInputRef: MutableRefObject<HTMLInputElement | null> =
    useRef(null);

  console.log("fieldsGeojson", fieldsGeojson);
  const initialDrawedGeojson = useInitialDrawedGeojson(field?.id, fieldsGeojson);
  const initialDrawedCenter =
    initialDrawedGeojson && turfCenter(initialDrawedGeojson);

  const initialViewState = initialDrawedCenter
    ? {
        longitude: initialDrawedCenter.geometry.coordinates[0],
        latitude: initialDrawedCenter.geometry.coordinates[1],
        zoom: 13,
      }
    : {
        longitude: 30.308611,
        latitude: 59.9375,
        zoom: 9,
      };

  const { features: drawedFeatures, handlers: drawHandlers } =
    useDrawFeatures(initialDrawedGeojson?.features);
  const drawedCenter = useFeaturesCenter(drawedFeatures);
  const drawedAddress = useFeatureAddress(drawedCenter);
  const drawedArea = useFeaturesArea(drawedFeatures);

  console.log("initialDrawedGeojson", initialDrawedGeojson);
  console.log("drawedFeatures", drawedFeatures);
  console.log("drawedAddress", drawedAddress);
  console.log("drawedCenter", drawedCenter);
  console.log("drawedArea", drawedArea);

  const [images, setImages] = useState<UploadcareFile[]>([]);

  const handleFilesChange = useCallback(
    (files: UploadcareFile[]) => setImages(files),
    []
  );

  useEffect(() => {
    const feature: MultiPolygon = {
      type: "MultiPolygon",
      coordinates: drawedFeatures.map(
        (f: Feature<Polygon>) => f.geometry.coordinates
      ),
    };
    if (featuresInputRef.current) {
      featuresInputRef.current.value = JSON.stringify(feature);
    }
  }, [drawedFeatures]);

  useEffect(() => {
    if (imagesInputRef.current) {
      imagesInputRef.current.value = JSON.stringify(images);
    }
  }, [images]);

  return (
    <div className="container mx-auto h-full p-10">
      <h1 className="text-3xl">{title}</h1>
      <Form method="post">
        <input ref={featuresInputRef} type="hidden" name="feature"></input>
        <input ref={imagesInputRef} type="hidden" name="images"></input>

        <div className="grid gap-5">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Как назовём?</span>
              {/* {errors.name && (
                <div className="badge badge-error gap-2">Required</div>
              )} */}
            </label>
            <div className="flex gap-5">
              <input
                name="name"
                type="text"
                placeholder="Непроходимое болото на юге Франции"
                defaultValue={field?.name}
                className={cx(
                  "input input-bordered w-full"
                  // errors.name && "input-error"
                )}
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-[2fr_1fr]">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Где находится?</span>
                {/* {errors.multiPolygon && (
                  <div className="badge badge-error gap-2">Required</div>
                )} */}
              </label>
              <div
                className={cx(
                  "h-96 w-full border rounded-lg overflow-hidden"
                  // errors.multiPolygon && "input-error"
                )}
              >
                <BaseMap
                  initialViewState={initialViewState}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="mapbox://styles/mapbox/outdoors-v11"
                  polygonsGeojson={useOtherFieldsGeojson(
                    field?.id,
                    fieldsGeojson
                  )}
                >
                  <FullscreenControl />
                  <DrawControl
                    position="top-left"
                    displayControlsDefault={false}
                    controls={{
                      trash: true,
                      polygon: true,
                    }}
                    defaultMode={field ? "simple_select" : "draw_polygon"}
                    initialGeojson={initialDrawedGeojson}
                    {...drawHandlers}
                  />
                </BaseMap>
              </div>
            </div>
            <div className="grid auto-rows-min gap-2 px-5">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Адрес</span>
                  {/* {errors.address && (
                    <div className="badge badge-error gap-2">Required</div>
                  )} */}
                </label>
                <textarea
                  readOnly
                  name="address"
                  rows={4}
                  placeholder="Будет определён автоматически"
                  value={drawedAddress.data}
                  className={cx(
                    "textarea textarea-bordered resize-none w-full"
                    // errors.name && "textarea-error"
                  )}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Площадь</span>
                  {/* {errors.name && (
                    <div className="badge badge-error gap-2">Required</div>
                  )} */}
                </label>
                <input
                  readOnly
                  name="area"
                  type="number"
                  placeholder="Будет определена автоматически"
                  value={drawedArea}
                  className={cx(
                    "input input-bordered w-full"
                    // errors.name && "input-error"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label max-w-xs">
              <span className="label-text">Фотографии</span>
              {/* {errors.images && (
                <div className="badge badge-error gap-2">Required</div>
              )} */}
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,200px)] auto-cols-max grid-flow-row auto-rows-[200px] gap-5 w-full pb-5">
                {images.map((image) => (
                  <uc-img key={image.uuid} uuid={image.uuid} />
                ))}
              </div>
            )}
            <Uploader onChange={handleFilesChange} />
          </div>

          <div className="form-control w-full max-w-xs">
            <button
              type="submit"
              className={cx(
                "btn btn-primary",
                ["submitting", "loading"].includes(transition.state) &&
                  "loading"
              )}
              disabled={["submitting", "loading"].includes(transition.state)}
            >
              Сохранить
            </button>
            {/* {error && (
              <div className="alert alert-error shadow-lg mt-5">
                <div>
                  <ExclamationCircleIcon className="stroke-current flex-shrink-0 h-6 w-6" />
                  <span>{error.message}</span>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </Form>
    </div>
  );
}
