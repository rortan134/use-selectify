import { type AppType } from "next/dist/shared/lib/utils";
import localFont from "@next/font/local";

import "~/styles/globals.css";

const SegoeUI = localFont({ src: "../../public/fonts/SegoeUI.woff" });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={SegoeUI.className}>
      <Component {...pageProps} />
    </main>
  );
};

export default MyApp;
