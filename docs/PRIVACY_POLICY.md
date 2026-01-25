# Privacy Policy

**Last Updated:** January 2026

This Privacy Policy describes how Qualia Solutions ("we", "us", or "our") collects, uses, and protects your personal information when you use the Underdog AI Sales Coach platform ("Service").

## 1. Information We Collect

### 1.1 Account Information

When you create an account, we collect:
- Email address
- Name
- Organization name (optional)

### 1.2 Usage Data

When you use our Service, we collect:
- Session metadata (duration, scenario type)
- Curriculum progress
- Performance scores and feedback

### 1.3 Audio Data

- **Voice Practice:** Real-time audio is processed but NOT stored. Only the resulting transcript is saved.
- **Call Analysis:** Uploaded audio files are stored temporarily (90 days) for analysis purposes only.

### 1.4 Technical Data

We automatically collect:
- IP address
- Browser type and version
- Device information
- Access times and pages viewed

## 2. How We Use Your Information

We use your information to:
- Provide and improve our AI coaching services
- Generate personalized feedback and recommendations
- Track your learning progress through the curriculum
- Communicate with you about your account and services
- Ensure security and prevent fraud
- Comply with legal obligations

## 3. AI Processing

### 3.1 Voice AI (Retell)

Your voice interactions are processed by third-party AI services:
- **Speech-to-Text:** Deepgram
- **Text-to-Speech:** ElevenLabs
- **Language Model:** OpenAI/Anthropic (via OpenRouter)

These providers process data according to their privacy policies and are bound by data processing agreements.

### 3.2 Call Analysis

Uploaded recordings are processed using:
- **Transcription:** OpenAI Whisper
- **Analysis:** OpenAI GPT-4

## 4. Data Sharing

We do NOT sell your personal data. We share data only:

- **With Service Providers:** AI providers (OpenAI, Retell, Anthropic) process data to provide our services
- **For Legal Compliance:** When required by law or legal process
- **With Your Consent:** For any purpose you explicitly approve

## 5. Data Security

We implement industry-standard security measures:
- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256)
- Row-Level Security (RLS) in our database
- Regular security audits
- Access controls and authentication

## 6. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | Until account deletion |
| Session transcripts | 1 year |
| Uploaded audio | 90 days |
| Audit logs | 3 years |

See our [Data Retention Policy](./DATA_RETENTION_POLICY.md) for details.

## 7. Your Rights

### 7.1 Access

You can export all your data at any time via your account settings or the `/api/user/export` endpoint.

### 7.2 Deletion

You can delete your account and all associated data via the `/api/user/delete` endpoint. Data is soft-deleted immediately and permanently removed after 90 days.

### 7.3 Correction

Contact us to correct any inaccurate personal information.

### 7.4 Portability

Your data is exported in standard JSON format, compatible with common data tools.

### 7.5 Objection

You may object to certain processing activities. Contact us to discuss your concerns.

## 8. Cookies and Tracking

We use:
- **Essential Cookies:** For authentication and session management
- **Analytics:** Vercel Analytics for usage statistics (anonymized)
- **Error Tracking:** Sentry for error monitoring

We do NOT use advertising cookies or third-party trackers.

## 9. Children's Privacy

Our Service is not intended for users under 18 years of age. We do not knowingly collect data from children.

## 10. International Transfers

Your data may be processed in:
- United States (Vercel, OpenAI, Supabase)
- European Union (Supabase EU regions if selected)

Transfers are protected by appropriate safeguards including Standard Contractual Clauses.

## 11. Changes to This Policy

We may update this Privacy Policy. We will notify you of material changes via email or through the Service.

## 12. Contact Us

For privacy-related inquiries:

- **Email:** privacy@qualia-solutions.com
- **Address:** Qualia Solutions, [Address]

For GDPR-related requests, specify "GDPR Request" in your subject line.

## 13. Data Protection Officer

For EU users, our Data Protection Officer can be reached at: dpo@qualia-solutions.com
