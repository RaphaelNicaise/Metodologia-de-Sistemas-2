import Box from '@mui/material/Box';

interface Props {
  isActive: boolean;
  direction: 'asc' | 'desc'; 
}

const SortIndicator = ({ isActive, direction }: Props) => {
  return (
    <Box component="span" className="sort-indicator">
      {isActive ? (
        direction === 'asc' ?
          <span className="sort-arrow asc">▲</span> :
          <span className="sort-arrow desc">▼</span>
      ) : (
        <Box className="sort-indicator-inactive">
          <span className="sort-arrow-small up">▲</span>
          <span className="sort-arrow-small down">▼</span>
        </Box>
      )}
    </Box>
  );
};

export default SortIndicator;