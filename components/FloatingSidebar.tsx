import React from "react";
import { FlightDrawer } from "./FlightDrawer";
import Link from "next/link";

import FlightIcon from "@mui/icons-material/Flight";

const FloatingSidebar = () => {
  return (
    <>
      <div className="relative bg-gray-50 dark:bg-slate-900  pattern">
        <nav className="z-20 flex shrink-0 grow-0 justify-around gap-4 border-t border-gray-200 bg-white/50 p-2.5 shadow-lg backdrop-blur-lg dark:border-slate-600/60 dark:bg-slate-800/50 fixed top-2/4 -translate-y-2/4 right-6 min-h-[auto] min-w-[64px] flex-col rounded-lg border">
          <FlightDrawer
            trigger={
              <div className="flex aspect-square min-h-[32px] w-16 flex-col items-center justify-center gap-1 rounded-md p-1.5 bg-indigo-50 text-indigo-600 dark:bg-sky-900 dark:text-sky-50">
                <FlightIcon />
                <small className="text-center text-xs font-medium">
                  {" "}
                  Flight
                </small>
              </div>
            }
          />

          <hr className="dark:border-gray-700/60" />

          <Link
            href="/"
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 text-fuchsia-900 dark:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
              />
            </svg>

            <small className="text-xs font-medium">Home</small>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default FloatingSidebar;
