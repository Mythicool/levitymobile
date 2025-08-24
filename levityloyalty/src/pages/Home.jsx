import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Coffee, Star, Gift, QrCode, Clock, MapPin } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <div className="flex justify-center mb-6">
          <Coffee className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-primary-800 mb-6">
          Welcome to Levity Loyalty
        </h1>
        <p className="text-xl text-primary-600 mb-8 max-w-2xl mx-auto">
          Earn points with every visit to Levity Breakfast House and unlock delicious rewards. 
          Experience the warmth of our 1920's charm with modern convenience.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-primary-700">
              Welcome back, {user.name}! You have <span className="font-bold text-accent-600">{user.points} points</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/checkin" className="btn-primary text-lg px-8 py-3">
                Check In Now
              </Link>
              <Link to="/rewards" className="btn-secondary text-lg px-8 py-3">
                View Rewards
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Join Loyalty Program
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-12">
        <div className="card text-center">
          <QrCode className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-3">Easy Check-ins</h3>
          <p className="text-primary-600">
            Simply scan our QR code when you visit to earn points instantly. No hassle, just rewards.
          </p>
        </div>
        
        <div className="card text-center">
          <Star className="h-12 w-12 text-accent-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-3">Earn Points</h3>
          <p className="text-primary-600">
            Get 10 points for every visit and bonus points for special occasions and events.
          </p>
        </div>
        
        <div className="card text-center">
          <Gift className="h-12 w-12 text-warm-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-3">Great Rewards</h3>
          <p className="text-primary-600">
            Redeem points for free meals, drinks, and exclusive Levity merchandise.
          </p>
        </div>
      </div>

      {/* Restaurant Info Section */}
      <div className="card mt-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary-800 mb-4">
              About Levity Breakfast House
            </h2>
            <p className="text-primary-600 mb-6">
              Portland roots, Norman flavor. Come enjoy a delicious meal while out and about in 
              Historic Downtown Norman. The 1920's charm of our breakfast house is sure to make 
              you feel right at home.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span className="text-primary-700">309 S Peters Ave, Norman, OK 73069</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary-600" />
                <span className="text-primary-700">7AM - 2PM • Closed Tuesdays</span>
              </div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-primary-700">Sign up for your free loyalty account</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-primary-700">Check in when you visit using our QR code</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-primary-700">Earn points and redeem for delicious rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
