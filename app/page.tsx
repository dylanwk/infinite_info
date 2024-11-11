import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  return (
    <section>
      <div className="grid items-center px-16 py-10 gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center py-32 text-center lg:mx-auto lg:items-start lg:px-0 lg:text-left">
          <div className="flex justify-center">
            <a
              className="inline-flex font-semibold items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 focus:outline-none focus:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:focus:border-neutral-600"
              href="#"
            >
              InfoPlus Release - Learn More
              <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-gray-200 font-semibold text-sm text-gray-600 dark:bg-neutral-700 dark:text-neutral-400">
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </div>
          <h1 className="my-6 text-pretty tracking-tight text-4xl font-bold lg:text-6xl">
            Welcome to InfiniteInfo Web
          </h1>
          <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
            doloremque mollitia fugiat omnis! Porro facilis quo animi
            consequatur. Explicabo.
          </p>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
            <Link href={"/map"}>
              <Button className="w-full sm:w-auto">
                <ArrowRight className="mr-2 -ml-2 size-4" />
                Flight Map
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </div>
        </div>
        <div className="relative aspect-[3/4]">
          <div className="absolute inset-0  flex items-center justify-center">
            {" "}
             
          </div>
          <div className="absolute left-[8%] top-[10%] flex aspect-[5/6] w-[38%] justify-center rounded-lg border border-border bg-accent"></div>
          <div className="absolute right-[12%] top-[20%] flex aspect-square w-1/5 justify-center rounded-lg border border-border bg-accent"></div>
          
          <div className="absolute bottom-[24%] right-[24%] flex aspect-[5/6] w-[38%] justify-center rounded-lg border border-border bg-accent">* Computer and IPhone Mockup Here *</div>
        </div>
      </div>
    </section>
  );
};

export default Home;
