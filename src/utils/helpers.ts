import { BaseProvider } from "../types";
import { HTTPError, TokenError } from "./errors";

export interface ParsedQueryString {
	url: URL,
	query: Record<string, string>
}
export function parseQuerystring(request: Request): ParsedQueryString  {
	const replacedUrl = request.url.replace(/#/g, '?');

	const url = new URL(replacedUrl);
	const query = Array.from(url.searchParams.entries()).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: value
		}),
		{}
	);

	return { url, query };
}

export function getFixedDigitRandomNumber(n: number): string {
	return (`${  Math.random()}`).substring(2, 2 + n);
}

export function get24HourExpiry(): number {
	return Math.floor(Date.now() / 1000) + 24 * 3600
}

export function checkTokenResponseError (result: unknown): void {
	if (typeof result === "object") {
		
		const errorRes = result as BaseProvider.ApiError
		if ((errorRes as BaseProvider.ApiError).error) {
			throw new TokenError({
				message: errorRes.error_description,
			});
		}
	}
}

export async function checkValidResponse(response: Response) {
	if (response.status >= 400) {
		let body: string
		try {
			body = await response.text()
		} catch {body = response.statusText}
		throw new HTTPError({
			message: body
		})
	}
}