import { PrismaMenuRepository } from "@/lib/data/prisma-menu-repository";
import { prisma } from "@/lib/db/prisma";

export const menuRepository = new PrismaMenuRepository(prisma);
