import { EB_Garamond, Gothic_A1 } from "next/font/google";

export const gothic = Gothic_A1({
  weight: ["400", "500", "600", "800"],
  display: "swap",
  subsets: ["latin"],
});

export const garamond = EB_Garamond({
  weight: ["500", "600", "400"],
  subsets: ["latin"],
});
