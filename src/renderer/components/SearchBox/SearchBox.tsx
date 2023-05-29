import { focusFilesElement } from "@pages";
import { RootState } from "@store";
import { doSearch } from "@store/filemanager";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SearchBox.scss";

export function SearchBox(): JSX.Element {
  const { searching, query } = useSelector(
    ({
      fmReducer: {
        search: { searching, query },
      },
    }: RootState) => ({
      searching,
      query,
    }),
  );
  const dispatch = useDispatch();
  const ref = useRef<HTMLInputElement>(undefined);
  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      dispatch(doSearch({ searching: false, query: "" }));
    }
  };
  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // put matches in store
    // if no matches, show nothing
    // on search-box close: show all again
    dispatch(doSearch({ searching: true, query: event.target.value }));
  };

  useEffect(() => {
    if (searching) {
      ref.current?.select();
    } else {
      focusFilesElement();
    }
  }, [searching]);

  return (
    <div
      id='search-box'
      className={`${searching ? "search-box-searching" : ""}`}
    >
      <input
        ref={ref}
        type='text'
        placeholder='search...'
        onKeyUp={onKeyUp}
        onChange={onSearch}
        value={query}
      />
    </div>
  );
}

export default SearchBox;
