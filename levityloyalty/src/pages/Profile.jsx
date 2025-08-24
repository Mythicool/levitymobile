import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Edit2, Save, X } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: user.name,
      email: user.email
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user.name,
      email: user.email
    })
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-800">My Profile</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Profile Picture Placeholder */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-800">{user.name}</h2>
              <p className="text-primary-600">Loyalty Member</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                  <User className="h-5 w-5 text-primary-500" />
                  <span className="text-primary-800">{user.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span className="text-primary-800">{user.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Member Since
              </label>
              <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-500" />
                <span className="text-primary-800">
                  {new Date(user.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-4 pt-4 border-t border-primary-100">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-6">Account Statistics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-accent-50 rounded-lg">
            <div className="text-3xl font-bold text-accent-600">{user.points}</div>
            <div className="text-primary-600">Total Points</div>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-3xl font-bold text-primary-600">{Math.floor(user.points / 100)}</div>
            <div className="text-primary-600">Rewards Available</div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-6">Account Actions</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/rewards')}
            className="w-full btn-secondary text-left p-4"
          >
            <div className="font-medium">View Available Rewards</div>
            <div className="text-sm text-primary-600">See what you can redeem with your points</div>
          </button>
          
          <button
            onClick={() => navigate('/checkin')}
            className="w-full btn-secondary text-left p-4"
          >
            <div className="font-medium">Check In Now</div>
            <div className="text-sm text-primary-600">Earn points for your current visit</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
