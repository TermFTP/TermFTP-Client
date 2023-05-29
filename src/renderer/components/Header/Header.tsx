import React, { useState } from "react";
import "./Header.scss";
import { DefaultDispatch, RootState } from "@store";
import { connect, ConnectedProps } from "react-redux";
import { push } from "connected-react-router";
import { TabBar } from "@components";

const mapState = ({ router }: RootState) => ({
  router,
});

const mapDispatch = (dispatch: DefaultDispatch) => ({
  push: (route: string) => dispatch(push(route)),
});

const connector = connect(mapState, mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

function HeaderUI({ router }: Props) {
  const [prevPath, setPrevPath] = useState("");

  const { location } = router;
  const pathname = location.pathname || "";

  if (pathname !== prevPath) setPrevPath(pathname);

  const id = process.platform === "darwin" ? "darwin" : "";

  return (
    <div id='headerBar'>
      <div id='headerResizableTop' className='headerDragPadder'></div>
      <div id='headerMain'>
        <div className='headerResizableVert headerDragPadder'></div>

        <div className='headerContent' id={id}>
          <div id='headerTitle'>
            {/* <button
              onClick={() => {
                if (Endpoints.getInstance().headers["Access-Token"])
                  push("/main");
                else push("/");
              }}
              className="navBtn"
            >
              <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
            </button> */}
            {!(
              pathname.includes("login") ||
              pathname.includes("register") ||
              pathname === "/"
            ) && <TabBar></TabBar>}
          </div>
          {/* <div className='headerDock'>
            <GetWindowControls id={id}></GetWindowControls>
          </div> */}
        </div>

        <div className='headerResizableVert headerDragPadder'></div>
      </div>
    </div>
  );
}

// const GetWindowControls = ({ id }: { id: "darwin" | "" }) => {
//   function closeWindow() {
//     // const window = getCurrentWindow();
//     // window.close();
//     context.exit();
//   }

//   function resizeWindow() {
//     // const window = getCurrentWindow();
//     // if (window.isMaximized()) {
//     //   window.unmaximize();
//     // } else {
//     //   window.maximize();
//     // }
//     context.toggle_maximize();
//   }

//   function minimizeWindow() {
//     // const window = getCurrentWindow();
//     context.minimize();
//   }
//   if (id === "darwin") {
//     return (
//       <>
//         <button
//           className='headerButton'
//           id='close'
//           tabIndex={-1}
//           onClick={closeWindow}
//         ></button>
//         <button
//           className='headerButton'
//           id='minimize'
//           tabIndex={-1}
//           onClick={minimizeWindow}
//         ></button>
//         <button
//           className='headerButton'
//           id='resize'
//           tabIndex={-1}
//           onClick={resizeWindow}
//         ></button>
//       </>
//     );
//   }

//   return (
//     <>
//       <button
//         className='headerButton btM'
//         id='fb_minimize'
//         tabIndex={-1}
//         onClick={minimizeWindow}
//       >
//         <FontAwesomeIcon icon={faWindowMinimize} />
//       </button>
//       <button
//         className='headerButton btR'
//         id='fb_resize'
//         tabIndex={-1}
//         onClick={resizeWindow}
//       >
//         <FontAwesomeIcon icon={faWindowMaximize} />
//       </button>
//       <button
//         className='headerButton btC'
//         id='fb_close'
//         tabIndex={-1}
//         onClick={closeWindow}
//       >
//         <FontAwesomeIcon icon={faTimes} />
//       </button>
//     </>
//   );
// };

export const Header = connector(HeaderUI);

export default Header;
