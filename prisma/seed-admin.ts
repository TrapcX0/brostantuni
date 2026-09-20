import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error("ADMIN_EMAIL ve en az 12 karakterlik ADMIN_PASSWORD geçici olarak ayarlanmalıdır.");
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await hashPassword(password), isActive: true },
    create: { email, passwordHash: await hashPassword(password) }
  });

  console.info(`Admin hesabı oluşturuldu/güncellendi: ${email}`);
}

main()
  .catch((error) => {
    console.error("Admin seed başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
