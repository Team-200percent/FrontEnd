import React from "react";
import styled from "styled-components";

export default function ProgressBar({ total, current }) {
  return (
    <Bar>
      <Fill style={{ width: `${(current / total) * 100}%` }} />
    </Bar>
  );
}

const Bar = styled.div`
  width: 100%;
  height: 6px;
  background: #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const Fill = styled.div`
  height: 100%;
  background: white;
  transition: width 0.3s ease;
`;