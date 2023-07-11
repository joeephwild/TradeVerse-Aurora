import { TradeVerseProvider } from "@/context";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { ModalProvider } from "@particle-network/connect-react-ui";
import { WalletEntryPosition } from "@particle-network/auth";
import { Aurora, AuroraTestnet } from "@particle-network/common";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ContractProvider } from "@/context/ContractProvider";
import { StoreProvider } from "@/context/StoreContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModalProvider
      options={{
        projectId: "075b5f9c-7c47-4177-9583-f60057f71215",
        clientKey: "cgfAoPq26pMSvlv0sGJL4BjMEeM8GGPSD8YfWtss",
        appId: "dbe8ea35-c8e2-4699-a710-02dcc1413549",
        chains: [Aurora, AuroraTestnet],
        particleWalletEntry: {
          //optional: particle wallet config
          displayWalletEntry: true, //display wallet button when connect particle success.
          defaultWalletEntryPosition: WalletEntryPosition.BR,
          supportChains: [Aurora, AuroraTestnet],
          customStyle: {}, //optional: custom wallet style
        },
        securityAccount: {
          //optional: particle security account config
          //prompt set payment password. 0: None, 1: Once(default), 2: Always
          promptSettingWhenSign: 1,
          //prompt set master password. 0: None(default), 1: Once, 2: Always
          promptMasterPasswordSettingWhenLogin: 1,
        },
        // wallets: evmWallets({ qrcode: false }),
      }}
      theme={"light"}
      language={"en"} //optional：localize, default en
      walletSort={["Particle Auth", "Wallet"]} //optional：walelt order
      particleAuthSort={[
        //optional：display particle auth items and order
        "email",
        "phone",
        "google",
        "apple",
        "facebook",
      ]}
    >
      <Provider store={store}>
        <ContractProvider>
          <TradeVerseProvider>
            <StoreProvider>
              <Component {...pageProps} />
            </StoreProvider>
            <ToastContainer />
          </TradeVerseProvider>
        </ContractProvider>
      </Provider>
    </ModalProvider>
  );
}
