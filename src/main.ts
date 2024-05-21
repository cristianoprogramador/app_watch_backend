import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("App Watch API")
    .setDescription(
      "API documentation for the application monitoring called App Watch API"
    )
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      tagsSorter: "alpha",
      defaultModelsExpandDepth: -1,
      operationsSorter: function (a: any, b: any) {
        const order = {
          post: "0",
          get: "1",
          put: "2",
          delete: "3",
          patch: "4",
        };
        return (
          order[a.get("method")].localeCompare(order[b.get("method")]) ||
          a.get("path").localeCompare(b.get("path"))
        );
      },
    },
  });

  await app.listen(3000);
}

bootstrap();
