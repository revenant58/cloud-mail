import { describe, it, expect } from 'vitest';
import emailUtils from '../src/utils/email-utils.js';
import verifyUtils from '../src/utils/verify-utils.js';

describe('email-utils', () => {

	it('getDomain extracts the domain part', () => {
		expect(emailUtils.getDomain('user@example.com')).toBe('example.com');
		expect(emailUtils.getDomain('invalid')).toBe('');
		expect(emailUtils.getDomain(null)).toBe('');
	});

	it('getName extracts the local part', () => {
		expect(emailUtils.getName('user@example.com')).toBe('user');
		expect(emailUtils.getName(' user@example.com ')).toBe('user');
		expect(emailUtils.getName('invalid')).toBe('');
	});

	it('formatText collapses invisible characters and blank runs', () => {
		const dirty = 'hello\u200B   world\n\n\n\nnext\u00A0line';
		const clean = emailUtils.formatText(dirty);
		expect(clean).toBe('hello world\nnextline');
		expect(emailUtils.formatText('')).toBe('');
	});

	it('htmlToText strips markup, styles and scripts', () => {
		const html = '<div>Hi <b>there</b></div><style>.x{}</style><script>evil()</script>';
		const text = emailUtils.htmlToText(html);
		expect(text).toContain('Hi there');
		expect(text).not.toContain('evil');
		expect(text).not.toContain('.x');
		expect(emailUtils.htmlToText('')).toBe('');
	});
});

describe('verify-utils', () => {

	it('isEmail validates well-formed addresses', () => {
		expect(verifyUtils.isEmail('user@example.com')).toBe(true);
		expect(verifyUtils.isEmail('a.b+tag@mail.example.co.id')).toBe(true);
		expect(verifyUtils.isEmail('not-an-email')).toBe(false);
		expect(verifyUtils.isEmail('user@.com')).toBe(false);
		expect(verifyUtils.isEmail('')).toBe(false);
	});

	it('isDomain validates bare domains', () => {
		expect(verifyUtils.isDomain('example.com')).toBe(true);
		expect(verifyUtils.isDomain('mail.example.co.id')).toBe(true);
		expect(verifyUtils.isDomain('https://example.com')).toBe(false);
		expect(verifyUtils.isDomain('user@example.com')).toBe(false);
	});
});
