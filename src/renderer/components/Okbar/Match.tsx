import { CommandAction } from "@models";
import React from "react";

type Props = {
  match: CommandAction;
  selected: boolean;
  autofillIndex: number;
  autofillHighlight: boolean;
};

export function MatchUI({
  match,
  selected,
  autofillIndex,
  autofillHighlight,
}: Props): JSX.Element {
  return (
    <div className={`match-item ${selected ? "match-selected" : ""}`}>
      <h3>{match.name}</h3>
      <p>
        {match.description[0]}{" "}
        {match.description.slice(1).map((arg) => (
          <span
            key={match.name + "." + arg}
            className={`match-arg ${
              autofillHighlight &&
              autofillIndex + 1 == match.description.findIndex((a) => a === arg)
                ? "match-arg-selected"
                : ""
            }`}
            title={match.references[arg]}
          >
            {arg}
          </span>
        ))}
      </p>
    </div>
  );
}

export default MatchUI;
