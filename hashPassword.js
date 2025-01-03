const bcrypt = require('bcryptjs');

// Replace these passwords with the ones you want to hash
const samplePasswords = ['mypassword123', 'securepassword', 'hashedpassword'];

samplePasswords.forEach(async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Original: ${password}, Hashed: ${hashedPassword}`);
});
