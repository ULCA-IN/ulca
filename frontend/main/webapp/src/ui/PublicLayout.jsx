import React, { Suspense } from "react";

import Theme from "./theme/theme-default";
import { withStyles, MuiThemeProvider } from "@material-ui/core/styles";
import GlobalStyles from "./styles/Styles";

const Header = React.lazy(() => import("./components/common/Header"));
const Footer = React.lazy(() => import("./components/common/Footer"));

function App(props) {
  const Component = props.component;
  const { type, index } = props;

  const fallback = () => <div>Loading...</div>;

  return (
    <MuiThemeProvider theme={Theme}>
      <Suspense fallback={fallback}>
        <Header type={type} index={index} style={{ marginBottom: "10px" }} />
      </Suspense>
      <Component />
      <Suspense fallback={fallback}>
        <Footer />
      </Suspense>
    </MuiThemeProvider>
  );
}
export default withStyles(GlobalStyles(Theme), { withTheme: true })(App);
