import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <div className="flex flex-col gap-4 w-full justify-center items-center">
        <div className="flex flex-col gap-y-3 justify-center items-center max-w-xl pt-3">
          <h2 className="text-4xl dark:text-white text-customDarkTwo text-center text-balance">
            Unlock Free Ui Components For Your Next Masterpiece
          </h2>
          <span className="text-lg text-customDarkTwo/30 max-w-sm text-center dark:text-customGrayTwo/70">
            Seamlessly access all your UI components in one place and build with
            ease
          </span>
        </div>

        <Link href="/" className="relative">
          <button className="flex gap-x-3 bg-white shadow-sm shadow-white text-black justify-center cursor-pointer items-center customGrayTwo border-customGrayTwoBorder rounded-xl mt-8 border dark:border-customDarkTwoBorder dark:hover:bg-transparent hover:bg-transparent bg-customGrayTwo dark:bg-customDarkTwo text-customDarkTwo dark:text-black px-4 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="11"
              viewBox="0 0 12 11"
              fill="none"
            >
              <circle cx="6" cy="5.5" r="5" fill="#5E5E5E" stroke="white" />
            </svg>
            <span>Explore components</span>
          </button>
        </Link>

        <div className="flex flex-col mt-32 gap-3  relative justify-center items-center max-w-xl pt-3">
          <div className="flex flex-col justify-center w-full relative  h-36 items-center">
            <img
              src="/pattern.png"
              alt="Descriptive text for the image"
              className="w-full inset-0 z-0 object-cover"
            />
          </div>
          <div className="w-full flex flex-col  items-center">
            <div className="flex gap-x-3 justify-center items-center  text-lg">
              <span className="text-neutral-300/50">Powered by</span>
              <span className="text-white">Leonel Yimga</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
