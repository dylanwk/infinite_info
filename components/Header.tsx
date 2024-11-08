"use client";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

const Header = () => {
  return (
    <div className="z-10 mt-2 w-full bg-transparent absolute">
      <Container>
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
          <Link className="flex rounded-xl text-xl" href="/">
            <Image
              src={"/images/iilogo.svg"}
              alt={"Logo"}
              width={100}
              height={100}
            />
          </Link>

          
        </div>
      </Container>
    </div>
  );
};

export default Header;
