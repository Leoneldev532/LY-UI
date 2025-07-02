"use client"
import ResizableSeparator from "@/components/LY UI/AI/resizableSeparator";
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
                style={{ width: size, minWidth: 100, maxWidth: 300, height: "100%" }}
                className="flex items-center justify-center "
            >
                Partie 1 ({size}px)
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
                Partie 2 ({400 - size}px)
            </div>
        </div>
    );
}

export default ResizableSeparatorExample