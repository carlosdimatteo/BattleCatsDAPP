import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {transformCharacterData} from '../../utils/transformCharacterData'
import {getHTTPIPFSURL} from '../../utils/getHttpIPFSUrl'
import { CONTRACT_ADDRESS } from '../../constants';
import myEpicGame from '../../utils/GameABI.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator'

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({ characterNFT ,setCharacterNFT}) => {
  // State
  const [gameContract, setGameContract] = useState(null);
const [boss, setBoss] = useState(null);
/*
* We are going to use this to add a bit of fancy animations during attacks
*/
const [attackState, setAttackState] = useState('');
/*
* Toast state management
*/
const [showToast, setShowToast] = useState(false);
const [toastMessage,setToastMessage] = useState(null)

const runAttackAction = async () => {
  console.log('heeeyy')
  try {
    if (gameContract) {
      setAttackState('attacking');
      console.log('Attacking boss...');
      const attackTxn = await gameContract.attackBoss();
      await attackTxn.wait();
      console.log('attackTxn:', attackTxn);
      setAttackState('hit');

    }
  } catch (error) {
    console.error('Error attacking boss:', error);
    setAttackState('');
  }
};


// UseEffects
useEffect(() => {
  /*
   * Setup async function that will get the boss from our contract and sets in state
   */
  const fetchBoss = async () => {
    const bossTxn = await gameContract.getBigBoss();
    console.log('Boss:', bossTxn);
    setBoss(transformCharacterData(bossTxn,true));
  };
  		
		/*
		* Setup logic when this event is fired off
		*/
		const onAttackComplete = (newBossHp, newPlayerHp,criticalHit,blocked) => {
	    const bossHp = newBossHp.toNumber();
	    const playerHp = newPlayerHp.toNumber();
	console.log({criticalHit,blocked})
	    console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);
	
		  /*
		   * Update both player and boss Hp
		   */
	     setBoss((prevState) => {
	      return { ...prevState, hp: bossHp };
	    });
      // if(playerHp === 0 ){
      //             setToastMessage(`Your BattleCat was Obliterated, maybe mint another one?`)
	    //   setShowToast(true);
      //           /*
      // * Set your toast state to true and then false 5 seconds later
      // */
      // setTimeout(() => {
      //   setShowToast(false);
      // }, 7000);
      // }
	    setCharacterNFT((prevState) => {
	      return { ...prevState, hp: playerHp };
	    })


      console.log({boss})
       if(boss && newBossHp){
         console.log('battle recap show')
          setToastMessage(`💥 ${boss.name} was hit for ${criticalHit ? `${characterNFT.attackDamage*characterNFT.criticalMultiplier}, Critical HIT!` : `${characterNFT.attackDamage}!`}\n , ${blocked ? 'You also blocked the attack, no damage was recieved' : `boss attacked back, you got hit for ${boss.attackDamage}!`}`)
	      setShowToast(true);
                /*
      * Set your toast state to true and then false 5 seconds later
      */
      setTimeout(() => {
        setShowToast(false);
      }, 7000);
       }
	  };
	  if (gameContract) {
	    fetchBoss();
			gameContract.on('AttackComplete', onAttackComplete);
	  }
	
	/*
	* Make sure to clean up this event when this component is removed
	*/
	return () => {
	  if (gameContract) {
	    gameContract.off('AttackComplete', onAttackComplete);
	  }
  }

}, [gameContract]);
  // UseEffects
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

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);
console.log({boss})
return (
  <div className="arena-container">
      {/* Add your toast HTML right here , change characterNFT.attackDamage with state coming from the succesful attack event data*/}
    {boss &&showToast&& (
      <div id="toast" className="show">
      <div id="desc" >Turn recap: </div>
        <div id="desc">{toastMessage}</div>
      </div>
    )}
      {/* Boss */}
    {boss  &&  (
      <div className="boss-container">
        {/* Add attackState to the className! After all, it's just class names */}
        <div className={`boss-content ${attackState}`}>
          <h2>🔥 {boss.name} 🔥</h2>
          <div className="image-content">
            <img src={getHTTPIPFSURL(boss.imageURI)} alt={`Boss ${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
            {`💥 Attack ${boss.name}`}
          </button>
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}
      </div>
    )}

    {/* Replace your Character UI with this */}
    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={getHTTPIPFSURL( characterNFT.imageURI)}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default Arena;