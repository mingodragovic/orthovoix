// test-hash.ts (in your project root)
import * as bcrypt from 'bcrypt';

async function testHash() {
  const password = 'Tasmim123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Verify the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
}

testHash();