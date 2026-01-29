import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/ui/header'
import { ScrollReveal } from '@/components/ui/motion'

export const metadata: Metadata = {
  title: 'Terms of Service | Underdog Sales',
  description: 'Terms and conditions for using the Underdog Sales AI coaching platform',
}

export default function TermsPage() {
  const lastUpdated = 'January 29, 2026'

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>
          </ScrollReveal>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <ScrollReveal delay={0.1}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">1. Agreement to Terms</h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing or using Underdog Sales (&quot;the Service&quot;), operated by Qualia Solutions (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
                  you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  The Service provides AI-powered sales coaching, training simulations, call analysis, and educational content
                  designed to help sales professionals improve their skills.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">2. Eligibility</h2>
                <p className="text-foreground/80 leading-relaxed">
                  You must be at least 18 years old and capable of forming a binding contract to use this Service.
                  By using the Service, you represent and warrant that you meet these eligibility requirements.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">3. Account Registration</h2>
                <p className="text-foreground/80 leading-relaxed">
                  To access certain features, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password confidential and secure</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breaches</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">4. Acceptable Use</h2>
                <p className="text-foreground/80 leading-relaxed">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Interfere with or disrupt the Service or its servers</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Collect or harvest user data without consent</li>
                  <li>Use the Service to train competing AI models without permission</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">5. AI-Powered Services</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our Service uses artificial intelligence to provide coaching, feedback, and analysis. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>AI-generated content is provided for educational and training purposes only</li>
                  <li>AI responses may not always be accurate, complete, or appropriate for your specific situation</li>
                  <li>AI coaching does not replace professional sales training or business advice</li>
                  <li>You should exercise your own judgment when applying AI-provided feedback</li>
                  <li>We continuously work to improve AI accuracy but cannot guarantee perfection</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.35}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">6. Voice Recording & Transcription</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our practice sessions and call analysis features may record and transcribe audio. By using these features:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>You consent to the recording and transcription of your voice during practice sessions</li>
                  <li>You represent that you have authority to upload any call recordings for analysis</li>
                  <li>You acknowledge that uploaded recordings may be processed by third-party AI services</li>
                  <li>You agree to comply with all applicable recording consent laws in your jurisdiction</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">7. Intellectual Property</h2>
                <p className="text-foreground/80 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by Qualia Solutions
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  You retain ownership of any content you submit to the Service (such as call recordings).
                  By submitting content, you grant us a limited license to process, analyze, and store that content
                  for the purpose of providing the Service to you.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.45}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">8. Subscription & Payments</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you subscribe to a paid plan:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-foreground/80">
                  <li>You agree to pay all fees associated with your subscription plan</li>
                  <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                  <li>Refunds are handled according to our refund policy</li>
                  <li>We may change pricing with reasonable notice to subscribers</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">9. Limitation of Liability</h2>
                <p className="text-foreground/80 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUALIA SOLUTIONS SHALL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                  PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  Our total liability for any claim arising from or relating to these Terms or the Service
                  shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.55}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">10. Disclaimer of Warranties</h2>
                <p className="text-foreground/80 leading-relaxed">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">11. Termination</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may terminate or suspend your account and access to the Service immediately, without prior
                  notice or liability, for any reason, including breach of these Terms. Upon termination, your
                  right to use the Service will immediately cease.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  You may request deletion of your account and associated data at any time through the account settings
                  or by contacting our support team.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.65}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">12. Governing Law</h2>
                <p className="text-foreground/80 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Cyprus,
                  without regard to its conflict of law provisions. Any disputes arising from these Terms
                  will be resolved in the courts of Cyprus.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.7}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">13. Changes to Terms</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If we make material changes,
                  we will notify you by email or through the Service at least 30 days before the changes take effect.
                  Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.75}>
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">14. Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-xl">
                  <p className="text-foreground font-medium">Qualia Solutions</p>
                  <p className="text-foreground/80">Email: <a href="mailto:legal@qualiasolutions.net" className="text-gold hover:underline">legal@qualiasolutions.net</a></p>
                  <p className="text-foreground/80">Website: <a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">qualiasolutions.net</a></p>
                </div>
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
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-navy transition-colors">Support</Link>
            <Link href="/" className="hover:text-navy transition-colors">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
