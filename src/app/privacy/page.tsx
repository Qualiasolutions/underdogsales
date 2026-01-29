import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/ui/header'
import { ScrollReveal } from '@/components/ui/motion'

export const metadata: Metadata = {
  title: 'Privacy Policy | Underdog Sales',
  description: 'How we collect, use, and protect your personal information',
}

export default function PrivacyPage() {
  const lastUpdated = 'January 29, 2026'

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>
          </ScrollReveal>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Qualia Solutions (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates Underdog Sales, an AI-powered sales coaching platform.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  We are committed to protecting your privacy and complying with applicable data protection regulations,
                  including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA).
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                  <li><strong>Profile Information:</strong> Any additional information you add to your profile</li>
                  <li><strong>Voice Recordings:</strong> Audio from practice sessions and uploaded call recordings for analysis</li>
                  <li><strong>Chat Messages:</strong> Conversations with our AI coaching system</li>
                  <li><strong>Payment Information:</strong> Billing details processed through secure third-party payment processors</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                  <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, session duration, and interaction patterns</li>
                  <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs</li>
                  <li><strong>Cookies:</strong> Essential and analytics cookies (see Section 8)</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-foreground/80 leading-relaxed">We use collected information to:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>Provide, maintain, and improve our AI coaching services</li>
                  <li>Process and analyze your practice sessions and call recordings</li>
                  <li>Generate personalized feedback and coaching recommendations</li>
                  <li>Track your learning progress and curriculum completion</li>
                  <li>Send important account notifications and service updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Ensure platform security and prevent fraudulent activity</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                  <li>Improve our AI models and service quality (using anonymized/aggregated data)</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. AI and Data Processing</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our Service uses artificial intelligence to analyze your voice recordings, provide coaching feedback,
                  and personalize your learning experience. This involves:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li><strong>Speech-to-Text:</strong> Voice recordings are transcribed using secure third-party services</li>
                  <li><strong>AI Analysis:</strong> Transcripts are analyzed by AI models to evaluate sales techniques</li>
                  <li><strong>Feedback Generation:</strong> AI generates personalized coaching recommendations</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  We do not use your personal practice sessions or call recordings to train general AI models without
                  your explicit consent. Analysis is performed solely to provide the Service to you.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-foreground/80 leading-relaxed">We may share your information with:</p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.1 Service Providers</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Third-party vendors who help us operate our Service, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-foreground/80">
                  <li>Cloud hosting providers (e.g., Vercel, Supabase)</li>
                  <li>AI/ML service providers for speech processing and analysis</li>
                  <li>Payment processors for subscription billing</li>
                  <li>Analytics services to understand usage patterns</li>
                  <li>Error monitoring services (e.g., Sentry) for platform reliability</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.2 Legal Requirements</h3>
                <p className="text-foreground/80 leading-relaxed">
                  We may disclose information when required by law, court order, or government request,
                  or when necessary to protect our rights, property, or safety.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.3 Business Transfers</h3>
                <p className="text-foreground/80 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred
                  as part of the transaction. We will notify you of any such change.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.35}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We retain your data for as long as necessary to provide the Service and fulfill the purposes
                  outlined in this policy. Specifically:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li><strong>Account Data:</strong> Retained until you delete your account</li>
                  <li><strong>Practice Sessions:</strong> Retained for 12 months, then automatically deleted</li>
                  <li><strong>Call Recordings:</strong> Retained for 6 months after analysis, unless you delete sooner</li>
                  <li><strong>Chat History:</strong> Retained for 90 days</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized, retained indefinitely</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  You can request deletion of your data at any time through account settings or by contacting support.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.1 GDPR Rights (EU/EEA Residents)</h3>
                <p className="text-foreground/80 leading-relaxed">Under GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-foreground/80">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                  <li><strong>Restriction:</strong> Request limitation of processing</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.2 CCPA/CPRA Rights (California Residents)</h3>
                <p className="text-foreground/80 leading-relaxed">Under CCPA/CPRA, you have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-foreground/80">
                  <li>Know what personal information is collected, used, shared, or sold</li>
                  <li>Delete personal information held by businesses</li>
                  <li>Opt-out of the sale or sharing of personal information</li>
                  <li>Non-discrimination for exercising your CCPA rights</li>
                  <li>Correct inaccurate personal information</li>
                  <li>Limit use and disclosure of sensitive personal information</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  <strong>Note:</strong> We do not sell your personal information. We do not use your data for
                  targeted advertising across third-party sites.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
                <p className="text-foreground/80 leading-relaxed">We use the following types of cookies:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li><strong>Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service (Vercel Analytics)</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences (theme, language)</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  You can control cookies through your browser settings. Disabling essential cookies may affect Service functionality.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Security</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your data, including:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
                  <li>Secure authentication with password hashing</li>
                  <li>Row-level security policies in our database</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls limiting employee access to personal data</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  While we strive to protect your data, no method of transmission or storage is 100% secure.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.55}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Your data may be transferred to and processed in countries other than your country of residence,
                  including the United States, where our service providers operate. We ensure appropriate safeguards
                  are in place, such as Standard Contractual Clauses approved by the European Commission.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Children&apos;s Privacy</h2>
                <p className="text-foreground/80 leading-relaxed">
                  The Service is not intended for users under 18 years of age. We do not knowingly collect personal
                  information from children. If we learn we have collected data from a child, we will delete it promptly.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.65}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of material changes by
                  posting the new policy on this page and updating the &quot;Last updated&quot; date. For significant changes,
                  we will provide additional notice via email or in-app notification.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.7}>
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have questions about this Privacy Policy or want to exercise your data rights, contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-xl">
                  <p className="text-foreground font-medium">Qualia Solutions - Data Protection</p>
                  <p className="text-foreground/80">Email: <a href="mailto:privacy@qualiasolutions.net" className="text-gold hover:underline">privacy@qualiasolutions.net</a></p>
                  <p className="text-foreground/80">Website: <a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">qualiasolutions.net</a></p>
                </div>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  For GDPR inquiries, you may also contact your local Data Protection Authority if you are unsatisfied with our response.
                </p>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/underdog-logo.png"
              alt="Underdog Sales"
              width={100}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
