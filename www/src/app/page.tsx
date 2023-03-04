import {redirect} from "next/navigation"
import Image from "next/image";

import Logo from "../../public/logo.svg";

export default function Page() {
    redirect("/introduction");
}
