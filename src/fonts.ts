import { EB_Garamond } from "next/font/google";
import localFont from "next/font/local";

export const gothic = localFont({
  src: [
    { path: '../fonts/GothicA1-ExtraLight.woff', weight: '200' },
    { path: '../fonts/GothicA1-Regular.woff', weight: '400' },
    { path: '../fonts/GothicA1-Medium.woff', weight: '500' },
    { path: '../fonts/GothicA1-SemiBold.woff', weight: '600' },
  ],
  display: 'swap',
});

export const garamond = EB_Garamond({
  weight: ["500", "600", "400"],
  subsets: ["latin"],
});
