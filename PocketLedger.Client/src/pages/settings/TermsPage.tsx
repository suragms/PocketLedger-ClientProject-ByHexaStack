import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/settings" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: January 1, 2025</p>

        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>By accessing or using PocketLedger, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p>PocketLedger is a personal finance management application that helps you track transactions, manage budgets, and analyze your financial data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. User Responsibilities</h2>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your data is accurate and up to date</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Data Ownership</h2>
          <p>You retain all rights to your data. We do not own, control, or claim ownership of any data you input into PocketLedger.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Service Availability</h2>
          <p>We strive to maintain high availability but do not guarantee uninterrupted access to the service. We may perform maintenance that temporarily disrupts access.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
          <p>PocketLedger is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
          <p>We may update these terms from time to time. We will notify you of any material changes via email or through the application.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@pocketledger.app</p>
        </section>
      </div>
    </motion.div>
  );
}
