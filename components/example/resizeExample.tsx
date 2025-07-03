"use client";
import ResizableSeparator from "@/components/LY UI/AI/resizableSeparator";
import Image from "next/image";
import React, { useRef, useState } from "react";

function ResizableSeparatorExample() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(200);

  return (
    <div
      ref={parentRef}
      style={{
        height: 300,
        position: "relative",
        transition: "width 0.2s",
      }}
      className="flex flex-row  light w-full  max-w-lg text-neutral-200 items-stretch"
    >
      <div
        style={{ width: size, maxWidth: 300, height: "100%" }}
        className="flex items-center overflow-hidden breakwordsjustify-center "
      >
        <Image
          width={300}
          height={700}
          src={
            "https://images.unsplash.com/photo-1751514327780-07ea25d993dc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8"
          }
          alt="image part 1 "
          className="w-full object-cover h-full"
        />
      </div>
      <ResizableSeparator
        direction="horizontal"
        onResize={setSize}
        minSize={100}
        maxSize={300}
        parentRef={parentRef}
        showIndicator
        animated
        className="my-auto"
      />
      <div className="flex-1 flex items-center justify-center  h-full">
        <Image
          src={
            "https://images.unsplash.com/photo-1747597197690-de29ae7d998e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMHx8fGVufDB8fHx8fA%3D%3D"
          }
          width={300}
          height={700}
          alt="image part 2 "
          className="w-full object-cover h-full"
        />
      </div>
    </div>
  );
}

export default ResizableSeparatorExample;
