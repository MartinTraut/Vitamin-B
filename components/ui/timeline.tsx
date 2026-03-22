"use client";
import {
  useScroll,
  useTransform,
  motion,
  useMotionValueEvent,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    observer.observe(ref.current);
    setHeight(ref.current.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  // Track which dots the beam has reached
  useMotionValueEvent(heightTransform, "change", (latestHeight) => {
    if (!ref.current) return;
    const containerTop = ref.current.getBoundingClientRect().top;

    let newActive = -1;
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const dotRect = dot.getBoundingClientRect();
      const dotRelativeTop = dotRect.top - containerTop + dotRect.height / 2;

      if (latestHeight >= dotRelativeTop) {
        newActive = i;
      }
    });

    if (newActive !== activeIndex) {
      setActiveIndex(newActive);
    }
  });

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20 px-4 md:px-8 lg:px-10">
        {data.map((item, index) => {
          const isActive = index <= activeIndex;

          return (
            <div key={index} className="flex justify-start pt-10 md:pt-24 md:gap-10">
              {/* Left sticky column */}
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                {/* Dot */}
                <div
                  className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-[#050505] flex items-center justify-center"
                  ref={(el) => { dotRefs.current[index] = el; }}
                >
                  <motion.div
                    animate={isActive ? {
                      scale: [1, 1.4, 1],
                      backgroundColor: "rgba(255, 106, 0, 0.6)",
                      borderColor: "rgba(255, 106, 0, 0.8)",
                      boxShadow: "0 0 16px rgba(255, 106, 0, 0.5)",
                    } : {
                      scale: 1,
                      backgroundColor: "rgba(255, 106, 0, 0.1)",
                      borderColor: "rgba(255, 106, 0, 0.2)",
                      boxShadow: "0 0 0px rgba(255, 106, 0, 0)",
                    }}
                    transition={isActive ? {
                      scale: { duration: 0.5, times: [0, 0.5, 1] },
                      default: { duration: 0.4 },
                    } : { duration: 0.3 }}
                    className="h-4 w-4 rounded-full border-2"
                  />
                </div>
                {/* Step number */}
                <motion.h3
                  animate={isActive ? { opacity: 1, x: 0, color: "rgba(255, 106, 0, 0.3)" } : { opacity: 0.5, x: -10, color: "rgba(255, 106, 0, 0.08)" }}
                  transition={{ duration: 0.5 }}
                  className="hidden md:block text-xl md:pl-20 md:text-6xl font-bold"
                >
                  {item.title}
                </motion.h3>
              </div>

              {/* Right content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative pl-20 pr-4 md:pl-4 w-full"
              >
                <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-[#ff6a00]/20">
                  {item.title}
                </h3>
                <motion.div
                  animate={isActive ? { borderColor: "rgba(255, 106, 0, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.02)" } : { borderColor: "rgba(255, 255, 255, 0.05)", backgroundColor: "rgba(255, 255, 255, 0.01)" }}
                  transition={{ duration: 0.5 }}
                  className="p-6 md:p-8 rounded-2xl border hover:border-[#ff6a00]/10 transition-all duration-500 hover:bg-white/[0.03]"
                >
                  {item.content}
                </motion.div>
              </motion.div>
            </div>
          );
        })}

        {/* Timeline line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-white/[0.06] to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[#ff6a00] via-[#ff8c33] to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
