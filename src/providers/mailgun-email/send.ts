import { checkValidResponse, getFixedDigitRandomNumber } from '../../utils/helpers';
import { ConfigError, UnknownError } from '../../utils/errors';
import { MailgunEmail } from './types';

function urlEncodeObject(obj: Record<string, unknown>): string {
	return Object.keys(obj)
		.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k] as string)}`)
		.join('&');
}

async function sendMail({
	params, apiKey, baseUrl
}: MailgunEmail.SendMailOptions): Promise<MailgunEmail.SendMailResponse> {
	const dataUrlEncoded = urlEncodeObject(params);
	const opts = {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': dataUrlEncoded.length.toString()
		},
		body: dataUrlEncoded
	};

	const res = await fetch(`${baseUrl}/messages`, opts);
	await checkValidResponse(res)
	return await res.json() as MailgunEmail.SendMailResponse

}

export default async function send({
	options
}: MailgunEmail.SendOptions): Promise<MailgunEmail.SendMailResponse> {
	const {
		from,
		to,
		subject,
		otpLength = 4,
		text = 'Your verification code is: {OTP}',
		html,
		kvProvider,
		expirationTtl = 60,
		baseUrl,
		apiKey
	} = options;
	const otp = getFixedDigitRandomNumber(otpLength);

	if (otpLength < 4) {
		throw new ConfigError({
			message: 'OTP length can not be less then 4'
		});
	}

	const otpMessage = html
		? html.replace('{OTP}', otp)
		: text.replace('{OTP}', otp);

	const params = {
		from,
		to,
		subject,
		html: otpMessage,
	};

	try {
		const res = await sendMail({ params, baseUrl, apiKey });
		
		const savedData = await kvProvider.put(to, otp, {
			expirationTtl
		});
		
		return res;
	} catch (e) {
		throw new UnknownError({
			message: (e as {stack: string})?.stack
		});
	}
}
