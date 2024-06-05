import { PrismaClient, UserType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      password: hashedPassword,
      type: UserType.admin,
      userDetails: {
        create: {
          name: "Admin User",
          email: "admin@admin.com",
          document: "000.000.000-00",
          typeDocument: "CPF",
          profileImageUrl:
            "https://starsmedia.ign.com/stars/image/object/143/14319359/Chris-Sawyer_BIOboxart_160w.jpg",
        },
      },
    },
  });

  console.log({ adminUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
