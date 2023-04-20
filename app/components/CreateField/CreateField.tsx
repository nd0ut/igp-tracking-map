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
  road: number;
  cover: string[];
  description: string;
  actualAt: string;
  images: UploadcareFile[];
};

export function links() {
  return [
    ...baseMapLinks(),
    ...uploaderLinks(),
    { rel: "stylesheet", href: style },
  ];
}

const mapStylesEnum = {
  outdoors: 'mapbox://styles/mapbox/outdoors-v11', 
  satellite: "mapbox://styles/mapbox/satellite-streets-v11"
};

const coverTypes = ['пашня', 'низкая травка', 'высокая травка', 'скошенная трава', 'бурьян', 'болото'];
const coverNone: {[key: string]: boolean} = {}; 

coverTypes.forEach(key => {
  coverNone[key] = false; 
});




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
  register("road", { required: true });
  register("cover", { required: true });

  const { features, handlers: drawHandlers } = useDrawFeatures();
  const center = useFeaturesCenter(features);
  const address = useFeatureAddress(center);
  const area = useFeaturesArea(features);

  const [images, setImages] = useState<UploadcareFile[]>([]);
  const [mapStyle, setMapStyle] = useState(mapStylesEnum.outdoors);
  const [cover, setCover] = useState(coverNone);
  const [roadRating, setRoadRating] = useState<number>(0);

  function Rating() {
    return (
    <div className="rating">
        {Array.from({length: 5}, (_, i) => i + 1).map( i => (
        <label key={i}>
            <input type="radio" name="stars" value={i} checked={roadRating == i} onChange={() => setRoadRating(i)}/>
            {[...Array(i).keys()].map( j => (
              <span className="icon" key={j}>★</span>
            ))}
        </label>
        ))}
    </div>
    )
  }

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

  useEffect(() => {
    setValue("road", roadRating);
  }, [roadRating, setValue]);

  useEffect(() => {
    setValue("cover", Object.keys(cover).filter(key => cover[key]));
  }, [cover, setValue]);

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
                mapStyle={mapStyle}
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
                <div id="map-source-menu">
                  <input id="satellite"
                    type="radio"
                    name="rtoggle"
                    value="satellite"
                    checked={mapStyle == mapStylesEnum.satellite}
                    onChange={() => {setMapStyle(mapStylesEnum.satellite)}}/>
                  <label htmlFor="satellite">Cпутник</label>
                  <input id="outdoors"
                    type="radio"
                    name="rtoggle"
                    value="outdoors"
                    checked={mapStyle == mapStylesEnum.outdoors}
                    onChange={() => {setMapStyle(mapStylesEnum.outdoors)}}/>
                  <label htmlFor="outdoors">Карта</label>
                </div>
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
                rows={2}
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
                <span className="label-text">Площадь, га</span>
                {errors.name && (
                  <div className="badge badge-error gap-2">Required</div>
                )}
              </label>
              <input
                {...register("area", { required: true })}
                type="number"
                placeholder="Будет определена автоматически"
                defaultValue={Math.round(area / 10000) || ""}
                className={cx(
                  "input input-bordered w-full",
                  errors.name && "input-error"
                )}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Проезд</span>
                {errors.name && (
                  <div className="badge badge-error gap-2">Required</div>
                )}
              </label>
              <Rating />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Покрытие</span>
              </label>
              {coverTypes.map(name => (
              <span key={name}>
                <input type="checkbox" value={name} checked={cover[name]} onChange={evt => setCover({...cover, [name]: evt.target.checked})}></input>
                <label htmlFor={name} >{name}</label>
              </span>))
              }
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Особенности</span>
              </label>
              <textarea
                {...register("description", { required: true })}
                rows={2}
                placeholder="Любая информация о текущем состоянии поля и в целом об обстановке"
                className={cx(
                  "textarea textarea-bordered resize-none w-full",
                  errors.name && "textarea-error"
                )}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Информация актуальна на</span>
              </label>
              <input type="date"
                {...register("actualAt", { required: true })}
                defaultValue={new Date().toJSON().slice(0,10)}
                min="2022-02-24" max={new Date().toJSON().slice(0,10)}> 
              </input>
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
