import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NoobNFT from "./utils/NoobNFT.json";

// Constants
const TWITTER_HANDLE = 'paul_can_code';
const TWITTER_LINK = `https://twitter.com/paul_can_code`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x96ccd7Ebb79A2067B9601B035AacAC4B8A16Ec74";

const App = () => {

  // state varaiable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");


  const checkIfWalletIsConnected = async () => {
    // make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask!");
      return;
    } else {
      console.log("We have the ethereum object ", ethereum);
    }

    // check if authorized to access user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // use first account found
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      // if user comes to site with wallet already connected
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  }


  // connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask extension");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      // print out public address once authorized
      console.log("Connected ", accounts[0]);
      setCurrentAccount(accounts[0]);

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You must be connected to the Rinkeby Test Network!");
      }

      // if a user comes to the site and connects their wallet for the first time 
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }


  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NoobNFT.abi, signer);

        // capture the even when contract throws it 
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`We have successfully minted your NFT and sent it to your wallet! It may be blank right now but give it 10 mins or so to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup event listener");
      } else {
        console.log("Could not find Ethereum object");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NoobNFT.abi, signer);

        console.log("display wallet to pay for gas fees...");
        let nftTxn = await connectedContract.makeNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(`Mined successfully, see transaction https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object not found!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  // Runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
    Connect to Wallet
    </button>
  );


  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
    Mint NFT
    </button>
  );


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My n00b_NFT Collection</p>
          <p className="sub-text">
            Three Random Words // 1 Unique NFT // Worthle.. err, I mean PRICELESS
          </p>
          
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}

        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
