import { KVProvider } from "../../types"

export namespace MailgunEmail {
	export interface JWTOptions {
		secret: string,
		to: string,
		claims: Record<string, string | number>
	}

	export interface VerifyOptions {
		options: {
			kvProvider: KVProvider,
			to: string,
			otp: string,
			secret: string,
			claims: Record<string, string | number>
		}
	}

	export interface VerifyResponse {
		id: string,
		token?: string
	}

	export type StringBool<
		WithTrueAndFalse extends boolean = false
	> = "yes" | "no" | (WithTrueAndFalse extends true ? "true" | "false" | "True" | "False" : never) 

	export interface SendMailOptions {
		params: {
			to?: string,
			from?: string,
			subject?: String,
			cc?: string,
			bcc?: string,
			text?: string,
			html?: string,
			"amp-html"?: string,
			inline?: string,
			template?: string,
			"t:version"?: string,
			"t:text"?: StringBool,
			"t:varaibles"?: string,
			"o:tag"?: string,
			"o:dkim"?: StringBool<true>,
			"o:deliverytime"?: string,
			"o:deliverytime-optimize-period"?: string,
			"o:time-zone-locale"?: string,
			"o:testmode"?: StringBool,
			"o:tracking"?: StringBool<true>,
			"o:tracking-clicks"?: StringBool<true> | "htmlonly",
			"o:tracking-opens"?: StringBool<true>,
			"o:require-tls"?: StringBool<true>,
			"o:skip-verification"?: StringBool<true>,
			"recipient-variables"?: string,
			[key: `h:${string}` | `v:${string}`]: string
		},
		apiKey: string,
		baseUrl: string
	}
	
	export interface SendMailResponse {
		message: string,
		id: string
	}

	export interface SendOptions {
		options: {
			from: string,
			to: string,
			subject: string,
			otpLength?: number,
			text?: string,
			html: string,
			kvProvider: KVProvider,
			expirationTtl?: number,
			baseUrl: string,
			apiKey: string
		}
	}
}