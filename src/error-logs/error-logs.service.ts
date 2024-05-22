// src/error-logs/error-logs.service.ts
import { Injectable, HttpStatus } from "@nestjs/common";

@Injectable()
export class ErrorLogsService {
  handleException(exception: any) {
    // Aqui você pode adicionar lógica para processar ou logar os erros
    // Exemplo: Enviar para um serviço de monitoramento de erros ou logar em um arquivo
    console.error(exception);
  }

  formatResponse(exception: any) {
    // Formatar a resposta com base no tipo de erro
    if (exception.response) {
      return exception.response;
    } else if (exception instanceof Error && exception.message) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        error: "Internal Server Error",
      };
    } else {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Unexpected error occurred",
        error: "Internal Server Error",
      };
    }
  }
}
