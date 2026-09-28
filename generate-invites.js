const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function generateInvites() {
  console.log("Generating 10 Secure Invite Codes...");
  const invites = [];
  
  for (let i = 0; i < 10; i++) {
    // Generate a random 8-character hex code (e.g. "a1b2c3d4")
    const code = crypto.randomBytes(4).toString('hex');
    invites.push({ code });
  }

  await prisma.invite.createMany({
    data: invites
  });

  console.log("\n--- YOUR INVITE CODES ---");
  invites.forEach((inv, index) => {
    console.log(`User ${index + 1}: ${inv.code}`);
  });
  console.log("-------------------------\n");
  console.log("Give one of these codes to each of your friends/family so they can register.");
}

generateInvites().catch(console.error).finally(() => prisma.$disconnect());
