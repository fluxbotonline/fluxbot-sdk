export class FluxBotError extends Error {
  constructor(message: string, public readonly info?: unknown) {
    super(message);
    this.name = 'FluxBotError';
  }
}

export class FluxBotHttpError extends FluxBotError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly bodyText?: string
  ) {
    super(message, { status, url, bodyText });
    this.name = 'FluxBotHttpError';
  }
}
