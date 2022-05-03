import {
  FilterIcon,
  MenuIcon,
  UserCircleIcon,
  HeartIcon,
  ViewListIcon,
  ChevronLeftIcon,
  PlusIcon,
} from "@heroicons/react/solid";
import { Outlet, Link } from "remix";
import { Logo } from "~/components/Logo";

function AddButton() {
  return (
    <Link className="btn btn-primary gap-2" to="/dashboard/create-field">
      Добавить новое поле
      <PlusIcon className="h-5 w-5" />
    </Link>
  );
}

export default function My() {
  const fields = [];

  if (!fields.length) {
    return (
      <div className="flex items-center justify-center h-full w-full p-6">
        <div>
          <AddButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full w-full p-6">
      <div>
        <AddButton />
      </div>
    </div>
  );
}
