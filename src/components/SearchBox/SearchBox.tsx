import React, { useRef } from "react";
import "./SearchBox.scss";

export interface SearchProps {
  // value: string;
  // onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSearching: (searching: boolean) => void;
  searching: boolean;
}

const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
  event.target.select();

export function SearchBox({
  // value,
  setSearching,
  onSearch,
  searching,
}: SearchProps): JSX.Element {
  const ref = useRef<HTMLInputElement>(undefined);
  // const [listening, setListening] = useState<boolean>(false);
  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearching(false);
      if (ref.current) ref.current.value = "";
    }
  };
  if (searching) {
    ref.current?.focus();
  } else {
    ref.current?.parentElement.parentElement.focus();
  }
  return (
    <div
      id="search-box"
      className={`${searching ? "search-box-searching" : ""}`}
    >
      <input
        ref={ref}
        type="text"
        // defaultValue={value}
        placeholder="search..."
        autoFocus
        onKeyUp={onKeyUp}
        onFocus={handleFocus}
        onChange={onSearch}
        // onBlur={e => setSearching(false)}
      />
    </div>
  );
}

export default SearchBox;
