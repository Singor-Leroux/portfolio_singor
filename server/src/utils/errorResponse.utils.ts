// c:\Users\Singor.KPATCHOU\Desktop\my_portfolio\server\src\utils\errorResponse.utils.ts
class ErrorResponse extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Pour distinguer les erreurs opérationnelles des erreurs de programmation

    // S'assure que le nom de la classe est ErrorResponse
    Object.setPrototypeOf(this, ErrorResponse.prototype);
    // Capture la pile d'appels, en excluant le constructeur de ErrorResponse de la pile
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ErrorResponse };
