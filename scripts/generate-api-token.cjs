#!/usr/bin/env node

/**
 * Script to generate a secure random API token
 * Usage: node scripts/generate-api-token.cjs [length]
 * Default length: 64 characters
 */

const crypto = require('crypto')

const length = process.argv[2] ? parseInt(process.argv[2], 10) : 64

if (isNaN(length) || length < 32) {
  console.error('Error: Token length must be at least 32 characters')
  process.exit(1)
}

// Generate a cryptographically secure random token
// Using base64 encoding for URL-safe characters
const token = crypto.randomBytes(Math.ceil(length * 3 / 4))
  .toString('base64')
  .replace(/[+/=]/g, '') // Remove URL-unsafe characters
  .substring(0, length)

console.log('\n🔐 Generated API Token:')
console.log('─'.repeat(80))
console.log(token)
console.log('─'.repeat(80))
console.log('\n📝 Add this to your .env file:')
console.log(`API_TOKEN=${token}\n`)
console.log('⚠️  Security reminders:')
console.log('  • Never commit this token to version control')
console.log('  • Store it securely in your environment variables')
console.log('  • Rotate the token if it may have been compromised')
console.log('  • Use HTTPS only for API requests\n')
