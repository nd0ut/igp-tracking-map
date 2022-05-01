import { BasicMap, links as basicMapLinks } from "~/components/BasicMap";
import { UserCircleIcon, FilterIcon } from "@heroicons/react/solid";
import { useRecoilValue } from "recoil";
import { userAtom } from "~/store/userAtom";

export function links() {
  return [...basicMapLinks()];
}

export default function Index() {
  const user = useRecoilValue(userAtom);

  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <BasicMap />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <div className="p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
          <form action="/auth/auth0" method="post">
            <button className="btn gap-2 btn-link btn-s pl-0">
              <UserCircleIcon className="h-5 w-5" />
              Личный кабинет
            </button>
          </form>
          <div className="divider mt-0"></div>
          <h2 className="text-lg font-bold  inline-flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Фильтры
          </h2>
        </div>
      </div>
    </div>
  );
}
