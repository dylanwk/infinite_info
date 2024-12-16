"use client";
import Image from "next/image";
import Link from "next/link";

import Container from "./Container";

import { infiniteInfoSignIn, getUserToken } from "@/lib/firebase/auth";
import { Button } from "./ui/button";

const Header = () => {
  const handleSignIn = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    infiniteInfoSignIn();
  };

  const handleGetToken = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const token = await getUserToken();
    console.log(token);
  };

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
          {/* Button on the right 
          <div className="flex items-center gap-x-1 md:gap-x-2 ms-auto py-1 md:ps-6">
            <Button
              variant={"outline"}
              onClick={handleSignIn}
            >
              Sign in
            </Button>
            <Button
              variant={"outline"}
              onClick={handleGetToken}
            >
              Token
            </Button>
          </div>
          */}
        </div>
      </Container>
    </div>
  );
};

export default Header;
