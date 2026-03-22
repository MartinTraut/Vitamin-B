"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.95] : [1.05, 1];
  };

  // Animation finishes early (at 0.45) so card is flat with plenty of scroll room left
  const rotate = useTransform(scrollYProgress, [0.1, 0.45], [20, 0]);
  const scale = useTransform(scrollYProgress, [0.1, 0.45], scaleDimensions());

  return (
    <div
      className="min-h-[90rem] md:min-h-[100rem] relative"
      ref={containerRef}
    >
      {/* Title stays visible at top */}
      <div className="sticky top-28 z-10 pb-8">
        <div className="max-w-5xl mx-auto text-center px-6">
          {titleComponent}
        </div>
      </div>

      {/* Card with 3D animation */}
      <div className="sticky top-52 md:top-56 z-20 px-2 md:px-20 pb-[30rem]">
        <div style={{ perspective: "1000px" }}>
          <Card rotate={rotate} scale={scale}>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-white/10 p-2 md:p-6 bg-[#111] rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0d0d0d] md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
