import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  return (
    <section>
      <div className="grid items-center px-16 py-10 gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center py-32 text-center lg:mx-auto lg:items-start lg:px-0 lg:text-left">
          <h1 className="my-6 text-pretty tracking-tight text-4xl font-bold lg:text-6xl">
            Infinite Info <br /> Now on the Web
          </h1>
          <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
            Infinite Info&apos;s IOS Infinite Flight tracking app is now available on the web. Track your flights, view
            your stats, and much more.
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
        <div className="">
          <Image src="/images/mockupv1.png" alt="Description of image" width={650} height={500} />
        </div>
      </div>
    </section>
  );
};

export default Home;
