interface Props {
  isActive: boolean;
  direction: 'asc' | 'desc';
}

const SortIndicator = ({ isActive, direction }: Props) => {
  return (
    <span className="sort-indicator">
      {isActive ? (
        direction === 'asc' ? (
          <span className="sort-arrow asc">▲</span>
        ) : (
          <span className="sort-arrow desc">▼</span>
        )
      ) : (
        <span className="sort-indicator-inactive">
          <span className="sort-arrow-small up">▲</span>
          <span className="sort-arrow-small down">▼</span>
        </span>
      )}
    </span>
  );
};

export default SortIndicator;