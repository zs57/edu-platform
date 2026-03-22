import bcrypt from 'bcryptjs';

async function test() {
  try {
    const res = await bcrypt.compare("password123", "password123");
    console.log("Plaintext vs Plaintext compare result:", res);
  } catch(e: unknown) {
    if (e instanceof Error) {
      console.error("Plaintext check threw error:", e.message);
    }
  }
}
test();
