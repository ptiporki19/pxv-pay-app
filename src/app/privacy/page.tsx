import { Metadata } from 'next'
import Header from '@/components/landing/Header'

export const metadata: Metadata = {
  title: 'Privacy Policy - PXV Pay',
  description: 'Privacy Policy for PXV Pay platform and services.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last Updated: June 3, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This Privacy Policy describes how PXV Pay by PRIMEX VANGUARD ("us," "we," or "our") collects, uses, and discloses your information when you use the PXV Pay website and services (the "Service"). We are committed to protecting your privacy and handling your personal information with care.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We collect several types of information for various purposes to provide and improve our Service to you.
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">A. Personal Information (Provided by You)</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>Account Registration Data:</strong> When you create an account, we collect information such as your email address, password (hashed), and any additional profile information you choose to provide (e.g., business name, contact person, phone number).</p>
                <p><strong>Payment Link Creation Data:</strong> If you are a Merchant, we collect details you input to create payment links, such as payment amount, currency, customer name (if provided by you), and descriptions.</p>
                <p><strong>Customer Payment Details (Inputted by Customer):</strong> When a Customer uses a payment link, they provide their name and country.</p>
                <p><strong>Payment Proofs (Uploaded by Customer):</strong> For manual payments, Customers upload images or documents as proof of payment. This may contain personal information visible in the document itself (e.g., bank account snippets, transaction IDs).</p>
                <p><strong>Communications:</strong> Information you provide when you contact us for support, inquiries, or feedback.</p>
                <p><strong>Custom Landing Page Content:</strong> If you are a Subscriber using the custom landing page builder, we collect the text (page title, description, button text) and image URLs you provide for your landing page.</p>
              </div>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3 mt-6">B. Usage Data (Collected Automatically)</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3 mt-6">C. Information We DO NOT Collect (Crucial Clarification)</h3>
              <div className="bg-violet-50 dark:bg-violet-950/20 p-6 rounded-lg space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>PXV Pay DOES NOT collect or store your Customers' sensitive financial account details</strong>, such as full bank account numbers, credit card numbers, or mobile money PINs. The actual transfer of funds happens directly between the Customer and the Merchant via the chosen payment method, outside of the PXV Pay platform.</p>
                <p>We do not collect or store the actual funds.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">We use the collected data for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                <li>To provide and maintain our Service.</li>
                <li>To notify you about changes to our Service.</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
                <li>To provide customer support.</li>
                <li>To gather analysis or valuable information so that we can improve our Service.</li>
                <li>To monitor the usage of our Service.</li>
                <li>To detect, prevent, and address technical issues.</li>
                <li>To manage your account and provide you with relevant features based on your role.</li>
                <li>To facilitate payment processes by displaying payment instructions and proofs.</li>
                <li>To personalize your experience on the Service.</li>
                <li>To send you marketing and promotional communications (you can opt-out).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">We may share your information with third parties in the following situations:</p>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">With Merchants and Customers:</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>Merchants:</strong> We share Customer payment details (name, country) and Payment Proofs with the relevant Merchant to facilitate their verification process.</p>
                <p><strong>Customers:</strong> We display Merchant-configured payment instructions and contact details (if provided by the Merchant) to Customers on the checkout page.</p>
              </div>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3 mt-6">Service Providers:</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. (e.g., hosting providers like Vercel, database providers like Supabase, email service providers).
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3 mt-6">Business Transfers:</h3>
              <p className="text-gray-700 dark:text-gray-300">
                If we are involved in a merger, acquisition, or asset sale, your Personal Information may be transferred.
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white mb-3 mt-6">Legal Requirements:</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">We may disclose your Personal Information in the good faith belief that such action is necessary to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                <li>Comply with a legal obligation.</li>
                <li>Protect and defend the rights or property of PXV Pay.</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Service.</li>
                <li>Protect the personal safety of users of the Service or the public.</li>
                <li>Protect against legal liability.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">4. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300">
                The security of your data is important to us. We implement reasonable security measures to protect your Personal Information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">5. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">6. Your Data Protection Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Depending on your location, you may have the following data protection rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                <li><strong>The right to access:</strong> You have the right to request copies of your Personal Information.</li>
                <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                <li><strong>The right to erasure:</strong> You have the right to request that we erase your Personal Information, under certain conditions.</li>
                <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your Personal Information, under certain conditions.</li>
                <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your Personal Information, under certain conditions.</li>
                <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                To exercise any of these rights, please contact us using the details below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">8. Third-Party Links</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children have provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">11. Contact Us</h2>
              <div className="bg-violet-50 dark:bg-violet-950/20 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>By email: <a href="mailto:contact@primexvanguard.com" className="text-violet-600 dark:text-violet-400 hover:underline">contact@primexvanguard.com</a></p>
                  <p>By visiting our contact page on our website</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 