import { atom } from "recoil";

export type Env = {
  MAPBOX_ACCESS_TOKEN_PUBLIC?: string;
};

export const envAtom = atom<Env>({
  key: "envState",
  default: {}
});
