import { KVProvider } from "../../types"

export namespace SendgridEmail {
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

	export type Recipient<Required extends boolean = false> = Required extends true ? {
		email: string,
		name?: string
	} : {
		email: string,
		name?: string
	}

	export interface Content {
		type: string,
		value: string
	}

	export interface Attachment {
		content: string,
		type: string,
		filename: string,
		disposition: string,
		content_id: string
	}

	export interface Personalization {
		to: Recipient<true>[],
		cc?: Recipient[],
		bcc?: Recipient[],
		send_at?: number,
		from?: Recipient,
		custom_args?: Record<string, unknown>,
		subject?: string,
		headers?: Record<string, unknown>,
		substitutions?: Record<string, string>,
		dynamic_template_data?: Record<string, string | number | boolean>
	}

	export interface Asm {
		group_id?: number,
		groups_to_display?: number[],
	}

	export type Setting<Rest extends {} = {}> = {
		enable?: boolean,
	} & Rest

	export interface MailSettings {
		bypass_list_management?: Setting,
		bypass_spam_management?: Setting,
		bypass_bounce_management?: Setting,
		bypass_unsubscribe_management?: Setting,
		footer?: Setting<{
			text?: string,
			html?: string
		}>,
		sandbox_mode?: Setting
	}

	export interface TrackingSettings {
		click_tracking?: Setting<{enable_text?: boolean}>,
		open_tracking?: Setting<{substitution_tag?: string}>,
		subscription_tracking?: Setting<{
			text?: string,
			html?: string,
			substitution_tag?: string
		}>,
		ganalytics?: Setting<{
			utm_source?: string,
			utm_medium?: string,
			utm_term?: string,
			utm_content?: string,
			utm_campaign?: string
		}>
	}

	export interface SendBody {
		from: Recipient,
		to?: Recipient,
		reply_to?: Recipient,
		subject?: string,
		content?: Content[],
		attachments?: Attachment[],
		reply_to_list?: Recipient[],
		personalizations?: Personalization[],
		template_id?: string,
		headers?: Record<string, string>,
		categories?: string[],
		custom_args?: string,
		send_at?: number,
		batch_id?: string,
		asm?: Asm,
		ip_pool_name?: string,
		mail_settings?: MailSettings,
		tracking_settings?: TrackingSettings
	}

	export interface SendMailOptions {
		body: SendBody,
		apiKey: string
	}

	export interface SendOptions {
		options: {
			from: string,
			to: string,
			subject?: string,
			otpLength?: number,
			kvProvider: KVProvider,
			expirationTtl?: number,
			apiKey: string,
			templateId: string,
			dynamicTemplateData: Personalization["dynamic_template_data"],
			text?: string
		}
	}
}