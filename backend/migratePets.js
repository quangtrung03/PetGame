const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Pet = require('./src/models/Pet');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const migratePets = async () => {
  try {
    console.log('Starting pet migration...');
    
    // Get all users with pets
    const users = await User.find({ pets: { $exists: true, $ne: [] } });
    console.log(`Found ${users.length} users with pets`);
    
    for (const user of users) {
      console.log(`Migrating pets for user: ${user.username}`);
      console.log('User pets structure:', JSON.stringify(user.pets, null, 2));
      
      for (const petData of user.pets) {
        console.log('Pet data:', JSON.stringify(petData, null, 2));
        
        // Check if pet already exists as separate document
        const existingPet = await Pet.findOne({ 
          owner: user._id, 
          name: petData.name || 'Unknown Pet' 
        });
        
        if (existingPet) {
          console.log(`Pet already exists: ${existingPet.name}`);
          continue;
        }
        
        // Create new Pet document
        const newPet = new Pet({
          name: petData.name || `Pet_${Date.now()}`,
          type: petData.type || 'cat',
          hunger: petData.hunger || 50,
          happiness: petData.happiness || 50,
          level: petData.level || 1,
          xp: petData.xp || 0,
          owner: user._id
        });
        
        await newPet.save();
        console.log(`Created pet: ${newPet.name}`);
      }
      
      // Clear pets array from user (optional - backup first)
      // user.pets = [];
      // await user.save();
    }
    
    console.log('Migration completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePets();
