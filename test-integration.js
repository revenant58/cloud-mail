#!/usr/bin/env node

/**
 * CloudMail Integration Test Script
 * 
 * Script ini menguji integrasi antara Discord Bot dan CloudMail Worker API
 * 
 * Usage:
 *   node test-integration.js
 * 
 * Prerequisites:
 *   - CloudMail Worker deployed
 *   - API Key generated
 *   - .env file di cloud-mail-store-bot/ sudah dikonfigurasi
 */

import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors untuk console output
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
	log(`✅ ${message}`, 'green');
}

function logError(message) {
	log(`❌ ${message}`, 'red');
}

function logWarning(message) {
	log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
	log(`ℹ️  ${message}`, 'blue');
}

function logSection(title) {
	log(`\n${'='.repeat(60)}`, 'cyan');
	log(title, 'cyan');
	log('='.repeat(60), 'cyan');
}

// Load .env dari bot directory
const botEnvPath = join(__dirname, 'cloud-mail-store-bot', '.env');
if (!existsSync(botEnvPath)) {
	logError('.env file not found in cloud-mail-store-bot/');
	logInfo('Copy .env.example to .env and configure it first');
	process.exit(1);
}

// Import .env from bot
import dotenv from 'dotenv';
dotenv.config({ path: botEnvPath });

const CLOUDMAIL_BASE = process.env.CLOUDMAIL_BASE;
const CLOUDMAIL_API_KEY = process.env.CLOUDMAIL_API_KEY;

async function testCloudMailAPI() {
	logSection('Testing CloudMail API Connection');
	
	// Test 1: Check API key exists
	if (!CLOUDMAIL_API_KEY || CLOUDMAIL_API_KEY === 'your_cloudmail_api_key_here') {
		logError('CLOUDMAIL_API_KEY not configured in .env');
		logInfo('Generate API key from mail-vue Settings → API Keys');
		return false;
	}
	logSuccess('API key configured');
	
	// Test 2: Check base URL
	if (!CLOUDMAIL_BASE || CLOUDMAIL_BASE === 'https://mail.revmail.my.id/api') {
		logWarning('Using default CLOUDMAIL_BASE. Make sure this is correct.');
	}
	logInfo(`Base URL: ${CLOUDMAIL_BASE}`);
	
	// Test 3: Test stats endpoint
	logInfo('Testing GET /v1/stats...');
	try {
		const response = await fetch(`${CLOUDMAIL_BASE}/v1/stats`, {
			headers: {
				'x-api-key': CLOUDMAIL_API_KEY,
			},
		});
		
		const data = await response.json();
		
		if (data.code === 200) {
			logSuccess('Stats endpoint working');
			logInfo(`Users: ${data.data.userCount || 0}`);
			logInfo(`Emails: ${data.data.emailCount || 0}`);
		} else {
			logError(`API returned code: ${data.code}`);
			logError(`Message: ${data.message || 'Unknown error'}`);
			return false;
		}
	} catch (error) {
		logError(`Failed to connect: ${error.message}`);
		return false;
	}
	
	// Test 4: Test create user (dengan test data)
	logInfo('\nTesting POST /v1/users (create test user)...');
	const testEmail = `test${Date.now()}@${process.env.CLOUDMAIL_EMAIL_DOMAIN || 'revmail.my.id'}`;
	const testPassword = 'TestPassword123!';
	
	try {
		const response = await fetch(`${CLOUDMAIL_BASE}/v1/users`, {
			method: 'POST',
			headers: {
				'x-api-key': CLOUDMAIL_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: testEmail,
				password: testPassword,
			}),
		});
		
		const data = await response.json();
		
		if (data.code === 200) {
			logSuccess('User creation working');
			logInfo(`Test email created: ${testEmail}`);
			logInfo(`Test password: ${testPassword}`);
			logInfo('You can login with these credentials to test');
		} else {
			logError(`Failed to create user: ${data.message || 'Unknown error'}`);
			if (data.message?.includes('scope')) {
				logError('API key missing required scope: users');
				logInfo('Regenerate API key with scope: users');
			}
			return false;
		}
	} catch (error) {
		logError(`Failed to create user: ${error.message}`);
		return false;
	}
	
	return true;
}

async function testBotConfiguration() {
	logSection('Testing Bot Configuration');
	
	const requiredVars = {
		'DISCORD_TOKEN': process.env.DISCORD_TOKEN,
		'CLIENT_ID': process.env.CLIENT_ID,
		'PAYINAJA_API_KEY': process.env.PAYINAJA_API_KEY,
		'CLOUDMAIL_API_KEY': process.env.CLOUDMAIL_API_KEY,
		'CLOUDMAIL_BASE': process.env.CLOUDMAIL_BASE,
		'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY,
		'JWT_SECRET': process.env.JWT_SECRET,
	};
	
	let allConfigured = true;
	
	for (const [key, value] of Object.entries(requiredVars)) {
		if (!value || value.startsWith('your_')) {
			logError(`${key} not configured`);
			allConfigured = false;
		} else {
			logSuccess(`${key} configured`);
		}
	}
	
	// Check optional but recommended
	const optionalVars = {
		'ADMIN_NOTIFICATION_CHANNEL': process.env.ADMIN_NOTIFICATION_CHANNEL,
		'TRANSACTION_LOG_CHANNEL': process.env.TRANSACTION_LOG_CHANNEL,
		'WEBHOOK_PORT': process.env.WEBHOOK_PORT,
	};
	
	log('\nOptional Configuration:');
	for (const [key, value] of Object.entries(optionalVars)) {
		if (!value) {
			logWarning(`${key} not configured (optional)`);
		} else {
			logInfo(`${key} configured`);
		}
	}
	
	return allConfigured;
}

async function testDatabase() {
	logSection('Testing Database');
	
	const dbPath = join(__dirname, 'cloud-mail-store-bot', 'data', 'store.db');
	
	if (!existsSync(dbPath)) {
		logError('Database not found: data/store.db');
		logInfo('Run: npm run migrate');
		return false;
	}
	
	logSuccess('Database file exists');
	
	// Check if migration was run
	try {
		const Database = await import('better-sqlite3');
		const db = new Database.default(dbPath);
		
		// Check tables exist
		const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
		const tableNames = tables.map(t => t.name);
		
		const requiredTables = ['orders', 'rockstar_stock', 'vouchers', 'referrals'];
		let allTablesExist = true;
		
		for (const table of requiredTables) {
			if (tableNames.includes(table)) {
				logSuccess(`Table '${table}' exists`);
			} else {
				logError(`Table '${table}' missing`);
				allTablesExist = false;
			}
		}
		
		db.close();
		
		if (!allTablesExist) {
			logInfo('Run: npm run migrate');
			return false;
		}
		
	} catch (error) {
		logError(`Failed to check database: ${error.message}`);
		return false;
	}
	
	return true;
}

async function testPayinajaAPI() {
	logSection('Testing Payinaja API');
	
	const apiKey = process.env.PAYINAJA_API_KEY;
	const baseUrl = process.env.PAYINAJA_BASE || 'https://payinaja.com/api/v1';
	
	if (!apiKey || apiKey === 'sk_live_xxxxxx') {
		logError('PAYINAJA_API_KEY not configured');
		return false;
	}
	
	logInfo('Testing Payinaja connection...');
	
	try {
		// Test dengan create dummy QRIS (akan error tapi kita cek response format)
		const response = await fetch(`${baseUrl}/qris`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				amount: 1000,
				referenceId: 'TEST-' + Date.now(),
			}),
		});
		
		const data = await response.json();
		
		if (response.ok) {
			logSuccess('Payinaja API working');
			logInfo('QRIS generation endpoint accessible');
		} else {
			if (response.status === 401) {
				logError('Invalid API key');
				logInfo('Check your Payinaja dashboard for correct key');
				return false;
			} else if (response.status === 400) {
				logWarning('API key works but request validation failed (expected)');
				logSuccess('Payinaja connection OK');
			} else {
				logError(`Unexpected response: ${response.status}`);
				logError(JSON.stringify(data, null, 2));
			}
		}
	} catch (error) {
		logError(`Failed to connect to Payinaja: ${error.message}`);
		return false;
	}
	
	return true;
}

async function printSummary(results) {
	logSection('Integration Test Summary');
	
	const tests = [
		{ name: 'Bot Configuration', result: results.botConfig },
		{ name: 'Database Setup', result: results.database },
		{ name: 'CloudMail API', result: results.cloudmailAPI },
		{ name: 'Payinaja API', result: results.payinajaAPI },
	];
	
	let allPassed = true;
	
	for (const test of tests) {
		if (test.result) {
			logSuccess(`${test.name}: PASSED`);
		} else {
			logError(`${test.name}: FAILED`);
			allPassed = false;
		}
	}
	
	log('\n');
	
	if (allPassed) {
		logSuccess('🎉 All integration tests PASSED!');
		logInfo('\nYou can now start the bot:');
		log('  cd cloud-mail-store-bot', 'cyan');
		log('  npm start', 'cyan');
		log('\nTest in Discord:', 'cyan');
		log('  /store', 'cyan');
	} else {
		logError('❌ Some tests FAILED');
		logInfo('\nPlease fix the issues above before running the bot');
		logInfo('See SETUP.md for detailed instructions');
	}
	
	log('\n');
}

// Main execution
async function main() {
	log('\n╔═══════════════════════════════════════════════════════╗', 'magenta');
	log('║         CloudMail Integration Test Suite            ║', 'magenta');
	log('╚═══════════════════════════════════════════════════════╝', 'magenta');
	
	const results = {
		botConfig: false,
		database: false,
		cloudmailAPI: false,
		payinajaAPI: false,
	};
	
	// Run tests
	results.botConfig = await testBotConfiguration();
	results.database = await testDatabase();
	results.cloudmailAPI = await testCloudMailAPI();
	results.payinajaAPI = await testPayinajaAPI();
	
	// Print summary
	await printSummary(results);
}

main().catch((error) => {
	logError(`Test suite failed: ${error.message}`);
	console.error(error);
	process.exit(1);
});
