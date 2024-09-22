import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href="/">
          <Image
            src="/assets/images/google.svg"
            alt="logo"
            width={38}
            height={38}
          />
        </Link>

        <p>2024 GDSC Events. All Rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
