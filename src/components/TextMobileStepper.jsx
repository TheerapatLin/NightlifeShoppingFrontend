import React, { useState } from "react";

function NumberStepper({ defaultValue = 0, min = 0, max = 500, step = 1 }) {
  const [value, setValue] = useState(defaultValue);

  const handleIncrement = () => {
    setValue((prevValue) => Math.min(prevValue + step, max));
  };

  const handleDecrement = () => {
    setValue((prevValue) => Math.max(prevValue - step, min));
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        onClick={handleDecrement}
        style={{
          borderRadius: "50px",
          minWidth: "20px",
          fontSize: "22px",
          height: "35px",
          width: "35px",
          background: "rgb(200,0,100)",
          color: "white",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        -
      </div>
      <div
        style={{
          margin: "0 10px",
          fontSize: "22px",
          fontWeight: 500,
          border: "1px solid rgba(0,0,0,.1)",
          backgroundColor: "white",
          borderRadius: "50px",
          padding: "5px",
          minWidth: "70px",
        }}
      >
        {value}
      </div>
      <div
        onClick={handleIncrement}
        style={{
          borderRadius: "50px",
          minWidth: "20px",
          fontSize: "22px",
          height: "35px",
          width: "35px",
          background: "rgb(200,0,100)",
          color: "white",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        +
      </div>
    </div>
  );
}

export default NumberStepper;
