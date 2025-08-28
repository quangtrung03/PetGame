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
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { pets: pet._id } }
    );

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

    // Check if leveled up
    const leveledUp = pet.level > oldLevel;
    let message = '🍖 Pet đã no rồi!';
    if (leveledUp) {
      message += ` 🎉 Level lên ${pet.level}!`;
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

    // Check if leveled up
    const leveledUp = pet.level > oldLevel;
    let message = '🎾 Pet rất vui!';
    if (leveledUp) {
      message += ` 🎉 Level lên ${pet.level}!`;
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
