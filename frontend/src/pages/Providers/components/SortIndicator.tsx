import React from "react";

interface Props {
  isActive: boolean;
  direction: 'asc' | 'desc';
}

const SortIndicator: React.FC<Props> = ({ isActive, direction }) => {
  return (
    <span className="sort-indicator">
      {isActive ? (
        direction === 'asc' ?
          <span className="sort-arrow asc">▲</span> :
          <span className="sort-arrow desc">▼</span>
      ) : (
        <span className="sort-indicator-inactive">
          <span className="sort-arrow-small">▲</span>
          <span className="sort-arrow-small">▼</span>
        </span>
      )}
    </span>
  );
};

export default SortIndicator;
