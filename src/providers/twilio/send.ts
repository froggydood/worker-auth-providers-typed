import { getFixedDigitRandomNumber } from '../../utils/helpers';
import { ConfigError, UnknownError } from '../../utils/errors';
import { BaseProvider } from '../../types';
import { Twilio } from './types';

export default async function send({
	options
}: BaseProvider.SendOptions): Promise<Twilio.Message> {
	const {
		region,
		otpLength = 4,
		message = 'Your verification code is: {OTP}',
		phone,
		kvProvider,
		expirationTtl = 60,
		accountSid,
		authToken,
		from = '+19388887573'
	} = options;
	const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
	const otp = getFixedDigitRandomNumber(otpLength);

	if (otpLength < 4) {
		throw new ConfigError({
			message: 'OTP length can not be less then 4'
		});
	}

	const otpMessage = message.replace('{OTP}', otp);

	const encoded = new URLSearchParams();
	encoded.append('To', phone);
	encoded.append('From', from);
	encoded.append('Body', otpMessage);

	const token = btoa(`${accountSid}:${authToken}`);

	const request = {
		body: encoded,
		method: 'POST',
		headers: {
			Authorization: `Basic ${token}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	try {
		const result = await fetch(endpoint, request);
		const data = await result.json();
		const savedData = await kvProvider.put(phone, otp, {
			expirationTtl
		});
		
		return data as Twilio.Message;
	} catch (e) {
		
		throw new UnknownError({
			message: 'e.stack'
		});
	}
}
