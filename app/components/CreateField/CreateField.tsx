import { type UploadcareFile } from "@uploadcare/uc-blocks/submodules/upload-client/upload-client";
import cx from "classnames";
import { type Feature, type Polygon } from "geojson";
import { useCallback, useEffect, useState } from "react";
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
import { useNavigate } from "@remix-run/react";

export type FormData = {
  name: string;
  address: string;
  area: string;
  features: Feature<Polygon>[];
  images: UploadcareFile[];
};

export function links() {
  return [
    ...baseMapLinks(),
    ...uploaderLinks(),
    { rel: "stylesheet", href: style },
  ];
}

export function CreateField() {
  const navigate = useNavigate();
  const { error, isFulfilled, isPending, run } = useFetch("/api/fields/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    if (isFulfilled) {
      navigate("/dashboard/my/", { replace: true });
    }
  }, [isFulfilled, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit = useCallback(
    (data: FormData) => {
      run({ body: JSON.stringify(data) });
    },
    [run]
  );
  register("features", { required: true });
  register("images", { required: true });

  const { features, handlers: drawHandlers } = useDrawFeatures();
  const center = useFeaturesCenter(features);
  const address = useFeatureAddress(center);
  const area = useFeaturesArea(features);

  const [images, setImages] = useState<UploadcareFile[]>([]);
  const handleFilesChange = useCallback(
    (files: UploadcareFile[]) => setImages(files),
    []
  );

  useEffect(() => {
    setValue("features", features);
  }, [features, setValue]);

  useEffect(() => {
    setValue("images", images);
  }, [images, setValue]);

  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="container mx-auto h-full p-10"
    >
      <div className="grid gap-5">
        <h1 className="text-3xl">Новое поле</h1>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Как назовём?</span>
            {errors.name && (
              <div className="badge badge-error gap-2">Required</div>
            )}
          </label>
          <div className="flex gap-5">
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Непроходимое болото на юге Франции"
              className={cx(
                "input input-bordered w-full",
                errors.name && "input-error"
              )}
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-[2fr_1fr]">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Где находится?</span>
              {errors.features && (
                <div className="badge badge-error gap-2">Required</div>
              )}
            </label>
            <div
              className={cx(
                "h-96 w-full border rounded-lg overflow-hidden",
                errors.features && "input-error"
              )}
            >
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
                {errors.address && (
                  <div className="badge badge-error gap-2">Required</div>
                )}
              </label>
              <textarea
                {...register("address", { required: true })}
                rows={4}
                placeholder="Будет определён автоматически"
                defaultValue={address.data}
                className={cx(
                  "textarea textarea-bordered resize-none w-full",
                  errors.name && "textarea-error"
                )}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Площадь</span>
                {errors.name && (
                  <div className="badge badge-error gap-2">Required</div>
                )}
              </label>
              <input
                {...register("area", { required: true })}
                type="number"
                placeholder="Будет определена автоматически"
                defaultValue={area || ""}
                className={cx(
                  "input input-bordered w-full",
                  errors.name && "input-error"
                )}
              />
            </div>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label max-w-xs">
            <span className="label-text">Фотографии</span>
            {errors.images && (
              <div className="badge badge-error gap-2">Required</div>
            )}
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
          <input
            type="submit"
            className={cx("btn btn-primary", isPending && "loading")}
            value="Сохранить"
          />
          {error && (
            <div className="alert alert-error shadow-lg mt-5">
              <div>
                <ExclamationCircleIcon className="stroke-current flex-shrink-0 h-6 w-6" />
                <span>{error.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
