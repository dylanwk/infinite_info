"use client";
import Image from "next/image";
import Link from "next/link";

import Container from "./Container";

import { infiniteInfoSignIn, getUserToken } from "@/lib/firebase/auth";

const Header = () => {

  const handleSignIn = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    infiniteInfoSignIn();
  }

  const handleGetToken = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const token = await getUserToken()
    console.log(token)
  }

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
          
        {/* Button on the right */}
        <div className="flex items-center gap-x-1 md:gap-x-2 ms-auto py-1 md:ps-6">
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-xl bg-white border border-gray-200 text-black hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-white/10 dark:text-white dark:hover:text-white dark:focus:text-white"
            onClick={handleSignIn}
          >
            Sign in
          </button>
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-xl bg-white border border-gray-200 text-black hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-white/10 dark:text-white dark:hover:text-white dark:focus:text-white"
            onClick={handleGetToken}
          >
            Token
          </button>
        </div>
      </Container>
    </div>
  );
};

export default Header;
