export default function TermsOfService(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 rounded-2xl bg-purple-900/90 text-yellow-100 shadow-[0_4px_32px_0_rgba(36,0,70,0.25)]">
      <h1 className="text-yellow-300 mb-4 font-serif text-2xl font-bold">Terms of Service</h1>
      <p className="text-base mb-2">
        By using Cosmic Hub, you agree to use the app for personal, non-commercial purposes. We do not guarantee the accuracy of astrological predictions. Use at your own discretion.
      </p>
      <p className="text-sm text-yellow-300">For questions, contact us at support@cosmichub.com.</p>
    </div>
  );
}
