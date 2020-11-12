import React from "react";

import "./Register.scss";
import { RootState, DefaultDispatch } from "@store";
import { ConnectedProps, connect } from "react-redux";
import { OwnError } from "@models";
import { putError } from "@store/app";

import { remote } from "electron";
import { Endpoints } from "@lib";

const mapState = () => ({});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  putError: (error: OwnError) => dispatch(putError(error)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function RegisterUI({ putError }: Props) {
  return (
    <div id="register-wrapper">
      <div id="register-ticks">
        <p>
          I have read and agree to the <a href="..">Terms of Service</a>{" "}
          agreement.
        </p>
        <input id="register-terms-tick" type="checkbox" />
      </div>
    </div>
  );
}

export const Register = connector(RegisterUI);

export default Register;
