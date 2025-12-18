"use client";

import Snowfall from "react-snowfall";

export default function SnowEffect() {
  return (
    <Snowfall
      color="#fff"
      snowflakeCount={100}
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
