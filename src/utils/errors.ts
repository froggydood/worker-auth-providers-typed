export interface ErrorArgs  {
	name?: string,
	message: string
}
export class UnknownError extends Error {
	constructor({ name = 'UnknownError', message }: ErrorArgs) {
		super(message);
		this.name = name;
	}
}

export class HTTPError extends UnknownError {
	name = 'HTTPError'
}

export class ConfigError extends UnknownError {
	name = 'ConfigError';
}

export class TokenError extends UnknownError {
	name = 'TokenError';
}

export class ProviderGetUserError extends UnknownError {
	name = 'ProviderGetUserError';
}

export class ProviderSendOtpError extends UnknownError {
	name = 'ProviderSendOtpError';
}

export class ProviderVerifyOtpError extends UnknownError {
	name = 'ProviderVerifyOtpError';
}
