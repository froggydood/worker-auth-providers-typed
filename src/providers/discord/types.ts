import { OAuthTokens } from "../../types"

export namespace Discord {
	export interface GetTokenFromCodeOptions {
		clientId: string,
		clientSecret: string,
		redirectUrl?: string,
		scope?: string
	}

	export interface UserResponse {
		id: string,
		username: string,
		discriminator: string,
		avatar?: string,
		bot?: boolean,
		system?: boolean,
		mfa_enabled?: boolean,
		banner?: string,
		accent_color?: number,
		locale?: string
		verified?: boolean,
		email?: string,
		flags?: number,
		premium_type?: number,
		public_flags?: number
	}

	export interface CallbackResponse {
		user: UserResponse,
		tokens: OAuthTokens
	}

	export interface RedirectOptions {
		options: {
			clientId: string,
			redirectUrl?: string,
			scope?: string,
			responseType?: string,
			prompt: string,
			permissions: string,
			guildId: string,
			disableGuildSelect: string,
			state: string
		}
	}
}