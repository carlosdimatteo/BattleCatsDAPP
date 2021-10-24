import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import {transformCharacterData} from '../../utils/transformCharacterData'
import {getHTTPIPFSURL} from '../../utils/getHttpIPFSUrl'
import { CONTRACT_ADDRESS } from '../../constants';
import myEpicGame from '../../utils/GameABI.json';
import LoadingIndicator from '../LoadingIndicator'

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
function SelectCharacter  ({ setCharacterNFT }) {
    const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  /*
 * New minting state property we will be using
 */
const [mintingCharacter, setMintingCharacter] = useState(false);
// Actions
const mintCharacterNFTAction = (characterId) => async () => {
  try {
    if (gameContract) {
      setMintingCharacter(true)
      console.log('Minting character in progress...');
      const mintTxn = await gameContract.mintCharacterNFT(characterId);
      await mintTxn.wait();
      console.log('mintTxn:', mintTxn);
      setMintingCharacter(false)
    }
  } catch (error) {
    setMintingCharacter(false)
    console.warn('MintCharacterAction Error:', error);
  }
};

// UseEffect
useEffect(() => {
  const { ethereum } = window;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

    /*
     * This is the big difference. Set our gameContract in state.
     */
    setGameContract(gameContract);
  } else {
    console.log('Ethereum object not found');
  }
}, []);


useEffect(() => {
  const getCharacters = async () => {
    try {
      console.log('Getting contract characters to mint');

      /*
       * Call contract to get all mint-able characters
       */
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log('charactersTxn:', charactersTxn);

      /*
       * Go through all of our characters and transform the data
       */
      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );

      /*
       * Set all mint-able characters in state
       */
      setCharacters(characters);
    } catch (error) {
      console.error('Something went wrong fetching characters:', error);
    }
  };

  /*
   * Add a callback method that will fire when this event is received
   */
  const onCharacterMint = async (sender, tokenId, characterIndex) => {
    console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );

    /*
     * Once our character NFT is minted we can fetch the metadata from our contract
     * and set it in state to move onto the Arena
     */
    if (gameContract) {
      const mintedNFT = characters[characterIndex.toNumber()]
      console.log({characterIndex,characterindexnumber:characterIndex.toNumber(),mintedNFT})
      setCharacterNFT(mintedNFT);
      window.open(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`,'_blank')
    }
  };

  if (gameContract) {
    getCharacters();

    /*
     * Setup NFT Minted Listener
     */
    gameContract.on('CharacterNFTMinted', onCharacterMint);
  }

  return () => {
    /*
     * When your component unmounts, let;s make sure to clean up this listener
     */
    if (gameContract) {
      gameContract.off('CharacterNFTMinted', onCharacterMint);
    }
  };

}, [gameContract]);
console.log({characters})
// Render Methods
const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>AD: {character.attackDamage}</p>
        <p>HP: {character.hp}</p>
        <p>Critical Chance: {character.criticalChance}%</p>
        <p>Critical Damage: {character.criticalMultiplier}x</p>
        <p>Defense: {character.defense}</p>
      </div>
      <img src={getHTTPIPFSURL(character.imageURI)} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >Mint <strong>{character.name}</strong></button>
    </div>
  ));

  return (
    <div className="select-character-container">
      <h2>Mint a BattleCat! Choose wisely.</h2>
          {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
    )}
    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>BattleCat is Pouncing...</p>
        </div>
        <img
          src="https://media1.giphy.com/media/5Lz9LlAaFbrS8/giphy.gif?cid=ecf05e47bfjquez1a7p56l5uv3t4mlogr8urc671veokdvg9&rid=giphy.gif&ct=g"
          alt="Minting loading indicator"
        />
      </div>
    )}
    </div>
  );
};

export default SelectCharacter;