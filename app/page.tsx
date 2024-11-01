
export default function Home() {
  return (
    <div className="">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
        {/*<!-- Announcement Banner --> */}
        <div className="flex justify-center">
          <a
            className="group inline-flex items-center bg-white/10 hover:bg-white/10 border border-white/10 p-1 ps-4 rounded-full shadow-md focus:outline-none focus:bg-white/10"
            href="../figma.html"
          >
            <p className="me-2 text-white text-sm">InfiniteInfo Web is not currently live.</p>
            <span className="group-hover:bg-white/10 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/10 font-semibold text-white text-sm">
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
        {/* Title */}{" "}
        <div className="max-w-3xl text-center mx-auto">
          <h1 className="block font-bold tracking-tight text-gray-200 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            Real-Time InfiniteFlight Tracking, Now on the Web
          </h1>
        </div>
        {/* <!-- End Title --> */}
        <div className="max-w-3xl text-center mx-auto">
          <p className="text-lg text-white/70">
            InfiniteInfo&apos;s iOS flight tracking is now on the web
            for real-time access anywhere.{" "}
          </p>
        </div>
        <div className="text-center">
          <a
            className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg shadow-transparent hover:shadow-blue-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:shadow-blue-700/50 py-3 px-6"
            href="/map"
          >
            Get started
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
          </a>
        </div>
      </div>
    </div>
  );
}
