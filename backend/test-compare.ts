// test-compare.ts
import * as bcrypt from 'bcrypt';

async function testCompare() {
    // The hash currently in your database
    const dbHash = '$2b$10$vnk0WZehgB153QCk1MZNnuKukd1KYwCKrkkqWvCb4LyYxqF25Mtzy';
    const password = 'Tasmim123';
    
    console.log('🔑 Password:', password);
    console.log('🔑 Hash from DB:', dbHash);
    
    // Test if the password matches the hash
    const isValid = await bcrypt.compare(password, dbHash);
    console.log('✅ Is valid:', isValid);
    
    // Generate a new hash for comparison
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    console.log('🔑 New Hash:', newHash);
    
    // Check if new hash matches
    const isNewValid = await bcrypt.compare(password, newHash);
    console.log('✅ New hash valid:', isNewValid);
}

testCompare();