export namespace Twilio {
	export interface TokensResponse {

	}

	export interface CallbackResponse {
		user: UserResponse,
		tokens: TokensResponse
	}

	export interface UserResponse {

	}

	export type SendResponse = Message

	export type MessageDirection = "inbound" | "outbound-api" | "outbound-call" | "outbound-reply"

	export interface Message {
		body: string,
		numSegments: string,
		direction: MessageDirection,
		from: string,
		to: string,
		dateUpdated: string,
		price: string,
		errorMessage: string,
		uri: string,
		accountSid: string,
		numMedia: string,
		status: string,
		messagingServiceSid: string,
		sid: string,
		dateSent: string,
		dateCreated: string,
		errorCode: number,
		priceUnit: string,
		apiVersion: string,
		subresourceUris: string[]
	}
}