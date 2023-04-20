import {
  FilterIcon,
  MenuIcon,
  UserCircleIcon,
  HeartIcon,
  ViewListIcon,
  ChevronLeftIcon
} from "@heroicons/react/solid";
import { Outlet, NavLink } from "remix";
import { Logo } from "~/components/Logo";

export default function Dashboard() {
  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center">
        <label
          htmlFor="my-drawer"
          className="fixed left-0 top-0 z-10 mt-2 ml-2 btn btn-square btn-ghost drawer-button"
        >
          <MenuIcon className="h-9 w-9" />
        </label>
        <Outlet />
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="p-4 overflow-y-auto w-80 bg-base-200 text-base-content flex flex-col justify-between">
          <NavLink className="normal-case text-xl link link-hover" to="/">
            <h1 className="text-xl font-light gap-2 flex items-center">
              <Logo className="h-12 w-12" />
              Следовые поля
            </h1>
          </NavLink>
          <div className="divider"></div>
          <div className="grow">
            <h2 className="text-lg font-bold inline-flex items-center gap-2">
              Личный кабинет
            </h2>
            <ul className="menu p-2">
              <li>
                <NavLink to="/dashboard/my/">
                  <ViewListIcon className="h-5 w-5" />
                  Мои поля
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/starred/">
                  <HeartIcon className="h-5 w-5" />
                  Избранное
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="divider mb-0"></div>
          <NavLink className="btn gap-2 btn-link btn-s pl-0 place-self-start" to ="/">
            <ChevronLeftIcon className="h-5 w-5" />
            Назад
          </NavLink>
        </div>
      </div>
    </div>
  );
}
