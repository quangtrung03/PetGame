// Abilities service để tách logic abilities khỏi controller
const Pet = require('../models/Pet');

const ABILITIES_CONFIG = {
  cat: ['Heal', 'Lucky'],
  dog: ['Guard', 'Fetch'],
  rabbit: ['Speed Up', 'Double Feed'],
  bird: ['Sing', 'Scout'],
  fish: ['Splash', 'Treasure']
};

const ABILITY_EFFECTS = {
  'Heal': { happiness: 20, message: 'Pet happiness restored!' },
  'Lucky': { coins: 10, message: 'Bonus coins received!' },
  'Guard': { message: 'Hunger decay reduced!' },
  'Fetch': { coins: 5, message: 'Pet found some coins!' },
  'Speed Up': { xp: 15, message: 'XP boosted!' },
  'Double Feed': { hunger: 30, message: 'Double feed effect!' },
  'Sing': { happiness: 10, message: 'All pets feel happier!' },
  'Scout': { message: 'Pet scouted and found something!' },
  'Splash': { hunger: 20, message: 'Pet hunger restored!' },
  'Treasure': { coins: 20, message: 'Rare treasure found!' }
};

class AbilityService {
  static getAbilitiesForType(type) {
    return ABILITIES_CONFIG[type] || [];
  }

  static async useAbility(pet, ability) {
    if (!pet.abilities.includes(ability)) {
      throw new Error('Ability not found for this pet');
    }

    const effect = ABILITY_EFFECTS[ability];
    if (!effect) {
      throw new Error('Invalid ability');
    }

    // Apply effects to pet
    if (effect.happiness) {
      pet.happiness = Math.min(100, pet.happiness + effect.happiness);
    }
    if (effect.hunger) {
      pet.hunger = Math.min(100, pet.hunger + effect.hunger);
    }
    if (effect.xp) {
      pet.xp += effect.xp;
    }

    await pet.save();
    return effect.message;
  }
}

module.exports = AbilityService;
