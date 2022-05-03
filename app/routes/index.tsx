import { BasicMap, links as basicMapLinks } from "~/components/BasicMap";
import { UserCircleIcon, FilterIcon, MenuIcon } from "@heroicons/react/solid";
import { useRecoilValue } from "recoil";
import { userAtom } from "~/store/userAtom";
import { Logo } from "~/components/Logo";
import { NavLink } from "remix";

export function links() {
  return [...basicMapLinks()];
}

export default function Index() {
  const user = useRecoilValue(userAtom);

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
        <BasicMap />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="p-4 overflow-y-auto w-80 bg-base-100 text-base-content flex flex-col justify-between">
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
