import { DefaultDispatch, RootState } from "@store";
import { setPrompt } from "@store/app";
import React, { createRef, Ref } from "react";
import { connect, ConnectedProps } from "react-redux";
import "./Prompt.scss";

const mapState = ({ appReducer: { prompt } }: RootState) => ({ prompt });

const mapDispatch = (dispatch: DefaultDispatch) => ({
  setPrompt: (prompt: PromptProps) => dispatch(setPrompt(prompt)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export interface PromptProps {
  callback: (value: string) => void;
  fieldName: string;
  initial?: string;
}

interface State {
  initial: string;
  value: string;
}

class PromptUI extends React.Component<Props, State> {
  input = createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      value: "",
      initial: undefined,
    };
  }

  componentDidUpdate() {
    const { prompt } = this.props;
    prompt && this.input.current.focus();
    if (prompt && prompt.initial && prompt.initial !== this.state.initial) {
      this.setState({
        initial: prompt.initial,
        value: prompt.initial,
      });
    } else if (!prompt && this.state.initial && this.state.value) {
      this.setState({
        initial: undefined,
        value: "",
      });
      this.input.current && this.input.current.blur();
    }
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      value: event.target.value,
    });
  };

  onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      this.props.setPrompt(undefined);
    }
  };

  render() {
    const {
      state: { value },
      props: { prompt, setPrompt },
    } = this;

    return (
      <div className={`prompt-wrapper ${prompt ? "shown" : ""}`}>
        <div
          className="prompt-background"
          onClick={() => setPrompt(undefined)}
        ></div>
        <div className="prompt">
          <div className="prompt-top">
            Enter a value for {prompt?.fieldName}!
          </div>
          <div className="prompt-input">
            <input
              type="text"
              name={prompt?.fieldName}
              placeholder={prompt?.fieldName}
              ref={this.input}
              onChange={this.onChange}
              value={value}
              onKeyUp={this.onKeyUp}
            />
          </div>
          <div className="prompt-buttons">
            <button
              className="prompt-save"
              onClick={() => {
                prompt?.callback(value);
                setPrompt(undefined);
              }}
            >
              Save
            </button>
            <button
              className="prompt-cancel"
              onClick={() => setPrompt(undefined)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export const Prompt = connector(PromptUI);
export default Prompt;
