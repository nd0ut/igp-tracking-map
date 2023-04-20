import { FilterIcon, MenuIcon, UserCircleIcon } from "@heroicons/react/solid";
import { useCallback, useRef } from "react";
import { Layer, MapRef, Source, SymbolLayer, type FillLayer } from "react-map-gl";
import { type LoaderFunction, NavLink, useLoaderData } from "remix";
import { BaseMap, links as baseMapLinks } from "~/components/BaseMap";
import { Logo } from "~/components/Logo";
import { getFieldPointsGeojson, getFieldPolygonsGeojson } from "~/util/geojson.server";

export function links() {
  return [...baseMapLinks()];
}

export const loader = async () => {
  return {
    polygonsGeojson: await getFieldPolygonsGeojson(),
    pointsGeojson: await getFieldPointsGeojson(),
  };
};

export default function Index() {
  const { polygonsGeojson, pointsGeojson } = useLoaderData();

  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <label
          htmlFor="my-drawer"
          className="fixed left-0 top-0 z-10 mt-2 ml-2 btn btn-square btn-ghost drawer-button"
        >
          <MenuIcon className="h-9 w-9" />
        </label>
        <BaseMap
          initialViewState={{
            longitude: 30.308611,
            latitude: 59.9375,
            zoom: 9,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          polygonsGeojson={polygonsGeojson}
          pointsGeojson={pointsGeojson}
        >
        </BaseMap>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="p-4 overflow-y-auto w-80 bg-base-200 text-base-content flex flex-col justify-between">
          <NavLink className="normal-case text-xl" to="/">
            <h1 className="text-xl font-light  link link-hover gap-2 flex items-center">
              <Logo className="h-12 w-12" />
              Следовые поля
            </h1>
          </NavLink>
          <div className="divider"></div>
          <div className="grow">
            <h2 className="text-lg font-bold inline-flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              Фильтры
            </h2>
          </div>
          <div className="divider mb-0"></div>
          <form action="/auth/auth0" method="post">
            <button className="btn gap-2 btn-link btn-s pl-0">
              <UserCircleIcon className="h-5 w-5" />
              Личный кабинет
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
