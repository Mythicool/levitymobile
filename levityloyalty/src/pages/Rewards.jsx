import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Gift, Coffee, Utensils, Star, Check } from "lucide-react";
import { redemptionsService } from "../services/hybridDataService";

const Rewards = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [redeeming, setRedeeming] = useState(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  // Sample rewards catalog
  const rewards = [
    {
      id: 1,
      name: "Free Coffee",
      description: "Any regular coffee or espresso drink",
      points: 50,
      icon: Coffee,
      category: "Beverages",
    },
    {
      id: 2,
      name: "Free Pastry",
      description: "Choice of muffin, croissant, or danish",
      points: 75,
      icon: Utensils,
      category: "Food",
    },
    {
      id: 3,
      name: "Free Breakfast",
      description: "Any breakfast item under $12",
      points: 100,
      icon: Utensils,
      category: "Food",
    },
    {
      id: 4,
      name: "Premium Coffee",
      description: "Specialty latte or cappuccino",
      points: 75,
      icon: Coffee,
      category: "Beverages",
    },
    {
      id: 5,
      name: "Breakfast Combo",
      description: "Breakfast item + coffee combo",
      points: 150,
      icon: Utensils,
      category: "Combos",
    },
    {
      id: 6,
      name: "Levity T-Shirt",
      description: "Official Levity Breakfast House merchandise",
      points: 200,
      icon: Gift,
      category: "Merchandise",
    },
  ];

  const handleRedeem = async (reward) => {
    if (user.points < reward.points) {
      return;
    }

    setRedeeming(reward.id);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await redemptionsService.redeemReward(
        user.id,
        reward.id,
        reward.points,
        reward.name
      );

      if (result.success) {
        // Refresh user data to get updated points
        await refreshUser();
        alert(
          `Successfully redeemed ${reward.name}! Show this confirmation to staff.`
        );
      } else {
        alert(`Redemption failed: ${result.error}`);
      }
    } catch (error) {
      alert("Redemption failed. Please try again.");
    } finally {
      setRedeeming(null);
    }
  };

  const canRedeem = (points) => user.points >= points;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-800 mb-2">
              Rewards Catalog
            </h1>
            <p className="text-primary-600">
              Redeem your points for delicious treats and merchandise
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <div className="text-2xl font-bold text-accent-600">
              {user.points}
            </div>
            <div className="text-primary-600">Available Points</div>
          </div>
        </div>
      </div>

      {/* Points Progress */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4">
          Your Progress
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent-50 rounded-lg">
            <div className="text-2xl font-bold text-accent-600">
              {user.points}
            </div>
            <div className="text-primary-600">Current Points</div>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {rewards.filter((r) => canRedeem(r.points)).length}
            </div>
            <div className="text-primary-600">Available Rewards</div>
          </div>
          <div className="text-center p-4 bg-warm-50 rounded-lg">
            <div className="text-2xl font-bold text-warm-600">
              {Math.max(
                0,
                Math.min(...rewards.map((r) => r.points)) - user.points
              )}
            </div>
            <div className="text-primary-600">Points to Next Reward</div>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const IconComponent = reward.icon;
          const isRedeemable = canRedeem(reward.points);
          const isRedeeming = redeeming === reward.id;

          return (
            <div
              key={reward.id}
              className={`card transition-all duration-200 ${
                isRedeemable ? "hover:shadow-warm-lg" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    isRedeemable ? "bg-primary-100" : "bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`h-6 w-6 ${
                      isRedeemable ? "text-primary-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      isRedeemable ? "text-accent-600" : "text-gray-400"
                    }`}
                  >
                    {reward.points}
                  </div>
                  <div className="text-sm text-primary-600">points</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                {reward.name}
              </h3>
              <p className="text-primary-600 mb-4 text-sm">
                {reward.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded">
                  {reward.category}
                </span>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!isRedeemable || isRedeeming}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isRedeemable
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isRedeeming ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Redeeming...</span>
                    </div>
                  ) : isRedeemable ? (
                    "Redeem"
                  ) : (
                    `Need ${reward.points - user.points} more`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to Earn More Points */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4">
          How to Earn More Points
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-primary-700">
                Visit Levity Breakfast House: <strong>10 points</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-primary-700">
                Special events and promotions: <strong>Bonus points</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-primary-700">
                Birthday month: <strong>25 bonus points</strong>
              </span>
            </div>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-primary-800 mb-2">Quick Tip</h3>
            <p className="text-primary-600 text-sm">
              Check in every time you visit using the QR code to automatically
              earn points. Don't forget to ask about special promotions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
