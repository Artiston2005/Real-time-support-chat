import CustomerWidget from '../components/CustomerWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Welcome to Our Amazing Service
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a placeholder page for the customer facing website. 
          You can interact with the floating support widget in the bottom right corner to speak with our support team.
        </p>
      </div>

      {/* Customer Support Widget */}
      <CustomerWidget />
    </main>
  );
}
