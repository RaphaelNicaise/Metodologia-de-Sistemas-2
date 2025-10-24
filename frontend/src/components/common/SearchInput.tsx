import React from 'react';
import './SearchInput.css';

interface Props {
  onSearch?: (searchValue: string) => void;
  placeholder?: string;
}

const SearchInput = ({ onSearch, placeholder = "search your chats" }: Props) => {
  
  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onSearch) onSearch('');
  };

  return (
    <form className="form">
      <label htmlFor="search">
        <input
          required
          autoComplete="off"
          placeholder={placeholder}
          id="search"
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onSearch && onSearch(e.target.value)
          }
        />
        <div className="icon">
          <svg strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="swap-on">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <svg strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="swap-off">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <button type="reset" className="close-btn" onClick={handleReset}>
          <svg viewBox="0 0 20 20" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fillRule="evenodd" />
          </svg>
        </button>
      </label>
    </form>
  );
};

export default SearchInput;