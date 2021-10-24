import React, { useEffect, useState } from 'react';
import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import SelectCharacter from './Components/SelectCharacter'
import Arena from './Components/Arena'
import LoadingIndicator from './Components/LoadingIndicator';
// contract stuff
import BattleCats from './utils/GameABI.json'
import {transformCharacterData} from './utils/transformCharacterData'
import {CONTRACT_ADDRESS} from './constants'
// web3 dark magic
import {ethers} from 'ethers'
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
/*
 * Right under current account, setup this new state property
 */
const [characterNFT, setCharacterNFT] = useState(null);
/*
* New state property added here
*/
const [isLoading, setIsLoading] = useState(false);
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
const renderContent = () => {
  /*
   * Scenario #1
   */
    if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!currentAccount) {
    return (
       <div className="connect-wallet-container">
            <img
              src="https://media0.giphy.com/media/Yq5gG91kM4Yko/giphy.gif?cid=ecf05e47pqvmchjv45qllcilpbtvplt604ddbujlnu93ock3&rid=giphy.gif&ct=g"
              alt="wonder cat"
            />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    /*
     * Scenario #2
     */
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  }else if (currentAccount && characterNFT) {
    return <Arena setCharacterNFT={setCharacterNFT} characterNFT={characterNFT} />;
  }
};

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
      setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);
  /*
 * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
 */
useEffect(() => {
  /*
   * The function we will call that interacts with out smart contract
   */
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      BattleCats.abi,
      signer
    );
    console.log(gameContract)

    const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log('User has character NFT');
      // setCharacterNFT(transformCharacterData(txn));
    }
    console.log(txn)
    setIsLoading(false)
  };

  /*
   * We only want to run this, if we have a connected wallet
   */
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🐱 BattleCats</p>
          <p className="sub-text">Join the quest for feline domination!</p>
           {renderContent()}
          </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;