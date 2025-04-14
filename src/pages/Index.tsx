
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-500 text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-teal-800">Expiry Guardian</h1>
          <p className="text-xl md:text-2xl text-teal-700">
            Never let your products expire again.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 mb-8">
              Expiry Guardian helps you track expiration dates for your food, medicine, 
              cosmetics, and more. Get notified before products expire and maintain your inventory efficiently.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md text-lg"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 font-medium py-2 px-6 rounded-md text-lg"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-teal-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
              <p className="text-gray-600">
                Keep track of all your products in one place - food, medicine, cosmetics, and more.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-teal-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Notified</h3>
              <p className="text-gray-600">
                Receive alerts when products are about to expire so you never miss an expiration date.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-teal-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Usage</h3>
              <p className="text-gray-600">
                Log when products are consumed, expired, or discarded for better inventory management.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-teal-700 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Expiry Guardian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
