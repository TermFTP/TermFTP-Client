import { doSearch } from "@store/filemanager";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import "./SearchBox.scss";

export interface SearchProps {
  // value: string;
  // onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setSearching: (searching: boolean) => void;
  searching: boolean;
}

const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
  event.target.select();

export function SearchBox({
  setSearching,
  searching,
}: SearchProps): JSX.Element {
  const dispatch = useDispatch();
  const ref = useRef<HTMLInputElement>(undefined);
  // const [listening, setListening] = useState<boolean>(false);
  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearching(false);
      if (ref.current) ref.current.value = "";
    }
  };
  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // put matches in store
    // if no matches, show nothing
    // on search-box close: show all again
    dispatch(doSearch({ searching: true, query: event.target.value }));
  };

  if (searching) {
    ref.current?.focus();
  } else {
    // ref.current?.parentElement.parentElement.focus();
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
        onBlur={() => setSearching(false)}
        onKeyUp={onKeyUp}
        onFocus={handleFocus}
        onChange={onSearch}
        // onBlur={e => setSearching(false)}
        // onBlur={e => setSearching(false)}
      />
    </div>
  );
}

export default SearchBox;
