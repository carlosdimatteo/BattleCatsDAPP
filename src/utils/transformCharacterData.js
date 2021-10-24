export  /*
 * Add this method and make sure to export it on the bottom!
 */
function transformCharacterData (characterData,isBoss=false) {
  let baseStats = {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber() || characterData.hp,
    maxHp: characterData.maxHp.toNumber() || characterData.maxHp,
    attackDamage: characterData.attackDamage.toNumber() || characterData.attackDamage,
  }
  if(!isBoss){
    baseStats = {...baseStats,    criticalChance : characterData.criticalChance.toNumber() || characterData.criticalChance,
    criticalMultiplier : characterData.criticalMultiplier.toNumber() || characterData.criticalMultiplier,
    defense : characterData.defense.toNumber() || characterData.defense,}
  }
  return baseStats;
};