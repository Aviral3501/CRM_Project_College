import React, { useEffect, useState } from "react";

const useMousePosition = () => {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return pos;
};

const HighlightCursor = () => {
  const { x, y } = useMousePosition();
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        background: `radial-gradient(200px 200px at ${x}px ${y}px, rgba(16,185,129,0.25), rgba(16,185,129,0.1) 40%, transparent 65%)`,
        transition: "background 100ms linear",
      }}
    />
  );
};

export default HighlightCursor;
