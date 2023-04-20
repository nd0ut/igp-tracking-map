import type { UserSession } from "../util/auth.server";
import { atom } from "recoil";

export const userAtom = atom<UserSession | null>({
  key: "userState",
  default: null,
});
