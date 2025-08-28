const Pet = require('../models/Pet');
const User = require('../models/User');

// Get all pets for authenticated user
const getUserPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    
    // Update all pets' stats over time before returning
    for (let pet of pets) {
      pet.updateStatsOverTime();
      await pet.save();
    }

    res.json({
      success: true,
      data: { pets }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new pet
const createPet = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Create pet
    const pet = await Pet.create({
      name,
      type,
      owner: req.user.id
    });

    // Add pet to user's pets array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { pets: pet._id } },
      { new: true }
    );


    // Unlock achievement 'first_pet' nếu user chưa có
    const Achievement = require('../models/Achievement');
    const firstPetAch = await Achievement.findOne({ code: 'first_pet' });
    if (firstPetAch && !user.achievements.includes(firstPetAch._id)) {
      user.achievements.push(firstPetAch._id);
      await user.save();
    }

    // Unlock achievement 'pet_lover' nếu user có >= 5 pets
    const petLoverAch = await Achievement.findOne({ code: 'pet_lover' });
    const updatedUser = await User.findById(req.user.id);
    if (petLoverAch && updatedUser.pets.length >= 5 && !updatedUser.achievements.includes(petLoverAch._id)) {
      updatedUser.achievements.push(petLoverAch._id);
      await updatedUser.save();
    }

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: { pet }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Feed pet
const feedPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user owns this pet
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to feed this pet'
      });
    }

    // Store old level to check for level up
    const oldLevel = pet.level;

    // Feed the pet
    await pet.feed();

    // Unlock achievement 'feeder' nếu pet feedCount >= 100
    if (pet.feedCount >= 100) {
      const Achievement = require('../models/Achievement');
      const feederAch = await Achievement.findOne({ code: 'feeder' });
      const user = await User.findById(req.user.id);
      if (feederAch && !user.achievements.includes(feederAch._id)) {
        user.achievements.push(feederAch._id);
        await user.save();
      }
    }


    // Check if leveled up
    const leveledUp = pet.level > oldLevel;
    let message = '🍖 Pet đã no rồi!';
    if (leveledUp) {
      message += ` 🎉 Level lên ${pet.level}!`;
      // Unlock achievement 'pet_master' nếu pet đạt level 10
      if (pet.level >= 10) {
        const Achievement = require('../models/Achievement');
        const petMasterAch = await Achievement.findOne({ code: 'pet_master' });
        const user = await User.findById(req.user.id);
        if (petMasterAch && !user.achievements.includes(petMasterAch._id)) {
          user.achievements.push(petMasterAch._id);
          await user.save();
        }
      }
    }

    // Unlock achievement 'trainer' nếu tổng XP của user >= 1000
    const userForXP = await User.findById(req.user.id).populate('pets');
    const totalXP = (userForXP.pets || []).reduce((sum, p) => sum + (p.xp || 0), 0);
    const Achievement = require('../models/Achievement');
    const trainerAch = await Achievement.findOne({ code: 'trainer' });
    if (trainerAch && totalXP >= 1000 && !userForXP.achievements.includes(trainerAch._id)) {
      userForXP.achievements.push(trainerAch._id);
      await userForXP.save();
    }

    res.json({
      success: true,
      message,
      data: { 
        pet,
        leveledUp,
        xpGained: 10,
        coinsGained: 5
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Play with pet
const playWithPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user owns this pet
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to play with this pet'
      });
    }

    // Store old level to check for level up
    const oldLevel = pet.level;

    // Play with the pet
    await pet.play();

    // Unlock achievement 'player' nếu pet playCount >= 100
    if (pet.playCount >= 100) {
      const Achievement = require('../models/Achievement');
      const playerAch = await Achievement.findOne({ code: 'player' });
      const user = await User.findById(req.user.id);
      if (playerAch && !user.achievements.includes(playerAch._id)) {
        user.achievements.push(playerAch._id);
        await user.save();
      }
    }


    // Check if leveled up
    const leveledUp = pet.level > oldLevel;
    let message = '🎾 Pet rất vui!';
    if (leveledUp) {
      message += ` 🎉 Level lên ${pet.level}!`;
      // Unlock achievement 'pet_master' nếu pet đạt level 10
      if (pet.level >= 10) {
        const Achievement = require('../models/Achievement');
        const petMasterAch = await Achievement.findOne({ code: 'pet_master' });
        const user = await User.findById(req.user.id);
        if (petMasterAch && !user.achievements.includes(petMasterAch._id)) {
          user.achievements.push(petMasterAch._id);
          await user.save();
        }
      }
    }

    // Unlock achievement 'trainer' nếu tổng XP của user >= 1000
    const userForXP2 = await User.findById(req.user.id).populate('pets');
    const totalXP2 = (userForXP2.pets || []).reduce((sum, p) => sum + (p.xp || 0), 0);
    const Achievement2 = require('../models/Achievement');
    const trainerAch2 = await Achievement2.findOne({ code: 'trainer' });
    if (trainerAch2 && totalXP2 >= 1000 && !userForXP2.achievements.includes(trainerAch2._id)) {
      userForXP2.achievements.push(trainerAch2._id);
      await userForXP2.save();
    }

    res.json({
      success: true,
      message,
      data: { 
        pet,
        leveledUp,
        xpGained: 15,
        coinsGained: 8
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete pet
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user owns this pet
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pet'
      });
    }

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { pets: pet._id } }
    );

    // Delete the pet
    await Pet.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserPets,
  createPet,
  feedPet,
  playWithPet,
  deletePet
};
