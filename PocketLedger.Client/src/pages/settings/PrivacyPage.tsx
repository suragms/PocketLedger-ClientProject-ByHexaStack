import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/settings" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: January 1, 2025</p>

        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account information (name, email address)</li>
            <li>Financial data (transactions, accounts, budgets)</li>
            <li>Device information and usage data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Detect and prevent fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Retention</h2>
          <p>We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Object to processing of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@pocketledger.app</p>
        </section>
      </div>
    </motion.div>
  );
}
