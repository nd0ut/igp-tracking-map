import type { User } from "../util/auth.server";
import { atom } from "recoil";

export const userAtom = atom<User | null>({
  key: "userState",
  default: null,
});
