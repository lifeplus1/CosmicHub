export default function Contact(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 rounded-2xl bg-purple-900/90 text-yellow-100 shadow-[0_4px_32px_0_rgba(36,0,70,0.25)]">
      <h1 className="text-yellow-300 mb-4 font-serif text-2xl font-bold">Contact Us</h1>
      <p className="text-base mb-2">
        Have questions or feedback? Reach out to us at{' '}
        <a 
          href="mailto:support@cosmichub.com" 
          className="text-yellow-300 hover:text-yellow-200 transition-colors underline"
        >
          support@cosmichub.com
        </a>.
      </p>
      <p className="text-sm text-yellow-300">We usually respond within 1-2 business days.</p>
    </div>
  );
}
