import Image from "next/image";
import Logo from "../../public/logo.svg";

export default function loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Image
        src={Logo}
        className="aspect-square mix-blend-difference"
        alt="use-selectify package logo"
        height={46}
        width={46}
      />
    </div>
  );
}
