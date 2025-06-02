import React from "react";
import "./ButtonChecks.css"; // Assuming you have some styles for the component

const ButtonChecks = ({ name, options = [], value, onChange }) => (
  <div >
    {options.map((opt, idx) => (
      <div className="form-check"  key={idx} >
        <input 
          className="form-check-input" 
          type="radio"
          name={name}
          id={`${name}_${idx}`}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
        />
        <label className="form-check-label" htmlFor={`${name}_${idx}`} >
          {opt.label}
        </label>
      </div>
    ))}
  </div>
);

export default ButtonChecks;
