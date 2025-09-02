import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

const ShipMap = lazy(() => import("./ShipMap"));

export default function LazyShipMap(props) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-[400px]">
      {isVisible ? (
        <Suspense
          fallback={<div className="h-[400px] w-full bg-gray-200 animate-pulse" />}
        >
          <ShipMap {...props} />
        </Suspense>
      ) : (
        <div className="h-[400px] w-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
