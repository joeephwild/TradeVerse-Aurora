
import { ParticleNetwork, WalletEntryPosition } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { ethers } from "ethers";

const particle = new ParticleNetwork({
  projectId: "075b5f9c-7c47-4177-9583-f60057f71215",
  clientKey: "cgfAoPq26pMSvlv0sGJL4BjMEeM8GGPSD8YfWtss",
  appId: "dbe8ea35-c8e2-4699-a710-02dcc1413549",
  chainName: "Aurora", //optional: current chain name, default Ethereum.
  chainId: 1313161555, //optional: current chain id, default 1.
  wallet: {
    //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
    displayWalletEntry: true, //show wallet entry when connect particle.
    defaultWalletEntryPosition: WalletEntryPosition.BL, //wallet entry position
    uiMode: "light", //optional: light or dark, if not set, the default is the same as web auth.
    supportChains: [
      { id: 1, name: "AuroraTestnet" },
      { id: 5, name: "Aurora" },
    ], // optional: web wallet support chains.
    customStyle: {}, //optional: custom wallet style
  },
});

const particleProvider = new ParticleProvider(particle.auth);

export default function connectWithContract(
  contractAddress: string,
  contractAbi: any
) {
  // Creating a new web3 provider with window.ethereum
  const provider = new ethers.providers.Web3Provider(particleProvider, "any");


  // Getting the signer
  const signer = provider.getSigner();

  // Creating a new contract factory with the signer, address and ABI
  const contract = new ethers.Contract(contractAddress, contractAbi, signer);

  return contract;
}

export { connectWithContract };
