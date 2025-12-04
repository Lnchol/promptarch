import React from 'react';
import { Shield, Lock, Eye, Users, FileText, Mail } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Privacy Policy
                </h1>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                1. Introduction
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This Privacy Policy explains how Prompt Architect ("we", "us", or "our") collects, uses, 
                and protects your personal information when you use our application and services. We are 
                committed to protecting your privacy and ensuring transparency in our data practices.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                2. Information We Collect
              </h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    2.1 Account Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Username (encrypted in our database)</li>
                    <li>Password (hashed using bcrypt)</li>
                    <li>Account creation and last login timestamps</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    2.2 Usage Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Prompts you create and save</li>
                    <li>Likes and favorites</li>
                    <li>Subscription status and payment information (if applicable)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    2.3 Technical Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP address (for security and rate limiting)</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Cookies and local storage data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" />
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 ml-4">
                <li>To provide and maintain our services</li>
                <li>To authenticate and authorize access to your account</li>
                <li>To process payments and manage subscriptions</li>
                <li>To improve our application and user experience</li>
                <li>To communicate with you about updates and features</li>
                <li>To detect and prevent fraud and abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" />
                4. Data Security
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 ml-4">
                <li><strong>Encryption:</strong> Usernames encrypted with AES-256-CBC</li>
                <li><strong>Password Hashing:</strong> Passwords hashed with bcrypt (10 rounds)</li>
                <li><strong>Secure Transport:</strong> HTTPS encryption (when deployed)</li>
                <li><strong>JWT Authentication:</strong> Secure token-based authentication</li>
                <li><strong>Rate Limiting:</strong> Protection against brute force attacks</li>
                <li><strong>Security Headers:</strong> Helmet.js implementation</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                5. Cookies and Tracking
              </h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p>We use the following types of cookies:</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg space-y-3">
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100">Essential Cookies:</strong>
                    <p className="text-sm mt-1">Required for authentication and core functionality. Cannot be disabled.</p>
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100">Analytics Cookies:</strong>
                    <p className="text-sm mt-1">Help us understand usage patterns. Optional and can be disabled.</p>
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100">Marketing Cookies:</strong>
                    <p className="text-sm mt-1">Used for personalized content. Optional and can be disabled.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights (GDPR) */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                6. Your Rights (GDPR/CCPA)
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing of your data</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                7. Data Retention
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We retain your personal data only for as long as necessary to provide our services 
                and comply with legal obligations. Account data is retained until you delete your account. 
                Backup data may be retained for up to 90 days for disaster recovery purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                8. Third-Party Services
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                We may use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 ml-4">
                <li><strong>Google Gemini AI:</strong> For AI-powered prompt generation</li>
                <li><strong>Stripe:</strong> For payment processing (if subscribed)</li>
                <li><strong>Cloudflare:</strong> For security and DDoS protection</li>
              </ul>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">
                These services have their own privacy policies and may collect data independently.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you believe we have collected 
                data from a child under 13, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                10. Changes to This Policy
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
                Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                11. Contact Us
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-900 dark:text-zinc-100 font-semibold">Prompt Architect</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                  Email: privacy@promptarchitect.com
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Response Time: Within 30 days
                </p>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <p className="text-zinc-900 dark:text-zinc-100 font-semibold mb-2">
                Your Consent
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                By using our application, you consent to our Privacy Policy and agree to its terms. 
                You can withdraw your consent at any time by deleting your account or contacting us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
