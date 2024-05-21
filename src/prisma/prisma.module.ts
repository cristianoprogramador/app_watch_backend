import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // Torna este módulo globalmente acessível em qualquer lugar do app sem precisar importar explicitamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta PrismaService para que possa ser injetado em outros módulos
})
export class PrismaModule {}
