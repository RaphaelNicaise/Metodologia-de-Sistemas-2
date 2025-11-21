import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import './SearchInput.css';

interface Props {
  onSearch?: (searchValue: string) => void;
  placeholder?: string;
}

const SearchInput = ({ onSearch, placeholder = "search your chats" }: Props) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const showActiveState = isFocused || value.length > 0;
  const showClearButton = value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <Form className="my-3" onSubmit={(e) => e.preventDefault()}>

      <InputGroup className="search-input-group">
        
        <div 
          className={`search-icon-container ${showActiveState ? 'active' : ''}`}
        >
          <svg strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon swap-on">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <svg strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon swap-off">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>

        <Form.Control
          required
          autoComplete="off"
          placeholder={placeholder}
          id="search"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input-control" 
        />

        <button
          type="reset"
          onClick={handleReset}
          className={`search-close-btn ${showClearButton ? 'visible' : ''}`}
          aria-label="Clear search"
        >
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fillRule="evenodd" />
          </svg>
        </button>

      </InputGroup>
    </Form>
  );
};

export default SearchInput;