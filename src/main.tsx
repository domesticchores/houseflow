import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";
import Authenticating from "./callbacks/Authenticating.tsx";
import AuthenticationError from "./callbacks/AuthenticationError.tsx";
import Loading from "./callbacks/Loading.tsx";
import SessionLost from "./callbacks/SessionLost.tsx";
import configuration, { SSOEnabled } from "./configuration.ts";

import {OidcProvider, OidcSecure} from "@axa-fr/react-oidc";
import {HelmetProvider} from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
    <HelmetProvider>
      {SSOEnabled ? (
        <OidcProvider
          configuration={configuration}
          authenticatingComponent={Authenticating}
          authenticatingErrorComponent={AuthenticationError}
          loadingComponent={Loading}
          sessionLostComponent={SessionLost}
        >
          <OidcSecure>
            <App />
          </OidcSecure>
        </OidcProvider>
      ) : (
        <App />
      )}
    </HelmetProvider>
  </StrictMode>,
);
