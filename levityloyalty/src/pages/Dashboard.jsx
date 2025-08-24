import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Star, Gift, QrCode, TrendingUp, Calendar, Coffee } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  // Calculate progress to next reward (every 100 points)
  const pointsToNextReward = 100 - (user.points % 100)
  const progressPercentage = ((user.points % 100) / 100) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-800 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-primary-600">
              Member since {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <div className="text-4xl font-bold text-accent-600">{user.points}</div>
            <div className="text-primary-600">Total Points</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/checkin')}
          className="card hover:shadow-warm-lg transition-shadow duration-200 text-left"
        >
          <QrCode className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-2">Check In</h3>
          <p className="text-primary-600">Scan QR code to earn points</p>
        </button>

        <button
          onClick={() => navigate('/rewards')}
          className="card hover:shadow-warm-lg transition-shadow duration-200 text-left"
        >
          <Gift className="h-12 w-12 text-accent-500 mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-2">View Rewards</h3>
          <p className="text-primary-600">See what you can redeem</p>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="card hover:shadow-warm-lg transition-shadow duration-200 text-left"
        >
          <Star className="h-12 w-12 text-warm-600 mb-4" />
          <h3 className="text-xl font-semibold text-primary-800 mb-2">My Profile</h3>
          <p className="text-primary-600">Manage your account</p>
        </button>
      </div>

      {/* Progress to Next Reward */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-800">Progress to Next Reward</h2>
          <span className="text-sm text-primary-600">{pointsToNextReward} points to go</span>
        </div>
        <div className="w-full bg-primary-100 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-accent-500 to-accent-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-primary-600">
          You're {progressPercentage.toFixed(0)}% of the way to your next 100-point reward!
        </p>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder for recent activity - will be populated from Netlify Blobs later */}
          <div className="flex items-center space-x-4 p-4 bg-primary-50 rounded-lg">
            <Coffee className="h-8 w-8 text-primary-600" />
            <div className="flex-1">
              <div className="font-medium text-primary-800">Welcome Bonus</div>
              <div className="text-sm text-primary-600">
                {new Date(user.joinDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-accent-600 font-semibold">+0 points</div>
          </div>
          
          <div className="text-center py-8 text-primary-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent visits yet. Check in at Levity to start earning points!</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-800">0</div>
          <div className="text-primary-600">Total Visits</div>
        </div>
        
        <div className="card text-center">
          <Gift className="h-8 w-8 text-accent-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-800">0</div>
          <div className="text-primary-600">Rewards Redeemed</div>
        </div>
        
        <div className="card text-center">
          <Star className="h-8 w-8 text-warm-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-800">{Math.floor(user.points / 100)}</div>
          <div className="text-primary-600">Rewards Earned</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
