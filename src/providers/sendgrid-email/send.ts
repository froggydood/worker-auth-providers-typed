import { getFixedDigitRandomNumber } from '../../utils/helpers';
import { ConfigError, UnknownError } from '../../utils/errors';
import { SendgridEmail } from './types';

async function sendMail({ body, apiKey }: SendgridEmail.SendMailOptions) {
	const email = await fetch('https://api.sendgrid.com/v3/mail/send', {
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});
	return email;
}
export default async function send({ options }: SendgridEmail.SendOptions) {
	const {
		from,
		to,
		subject = 'Varification OTP',
		otpLength = 4,
		kvProvider,
		expirationTtl = 60,
		apiKey,
		templateId,
		dynamicTemplateData,
		text = 'Your verification code is: {OTP}'
	} = options;
	const otp = getFixedDigitRandomNumber(otpLength);

	if (otpLength < 4) {
		throw new ConfigError({
			message: 'OTP length can not be less then 4'
		});
	}

	const templateContent = templateId ? {
		template_id: templateId
	} : {
		content: [
			{
				type: 'text/plain',
				value: text.replace('{OTP}', otp)
			}
		]
	};

	const personalizedData = templateId ? {
		dynamic_template_data: dynamicTemplateData
	} : {
		subject
	};
	const body: SendgridEmail.SendBody = {
		from: {
			email: from
		},
		personalizations: [
			{
				to: [
					{
						email: to
					}
				],
				...personalizedData
			}
		],
		...templateContent
	};

	try {
		const res = await sendMail({ body, apiKey });
		
		const savedData = await kvProvider.put(to, otp, {
			expirationTtl
		});
		
		return res;
	} catch (e) {
		throw new UnknownError({
			message: (e as {stack: string})?.stack.toString()
		});
	}
}
