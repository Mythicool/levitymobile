import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { QrCode, Camera, CheckCircle, AlertCircle, Star } from "lucide-react";
import { checkinService } from "../services/hybridDataService";

const CheckIn = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      checkCanCheckIn();
    }
  }, [user, navigate]);

  const checkCanCheckIn = async () => {
    if (!user) return;

    try {
      const result = await checkinService.canCheckIn(user.id);
      if (result.success) {
        setCanCheckIn(result.canCheckIn);
      }
    } catch (error) {
      console.error("Error checking check-in status:", error);
    }
  };

  if (!user) {
    return null;
  }

  // Handle check-in process
  const handleCheckIn = async () => {
    setIsScanning(true);
    setCheckInStatus(null);

    try {
      // Simulate scanning delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await checkinService.checkIn(user.id);

      if (result.success) {
        setCheckInStatus({
          success: true,
          message: `Check-in successful! You earned ${result.pointsEntry.points} points.`,
          pointsEarned: result.pointsEntry.points,
        });
        setCanCheckIn(false);
        // Refresh user data to get updated points
        await refreshUser();
      } else {
        setCheckInStatus({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      setCheckInStatus({
        success: false,
        message: "Check-in failed. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="card text-center">
        <QrCode className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-primary-800 mb-2">Check In</h1>
        <p className="text-primary-600">
          Scan the QR code at Levity Breakfast House to earn points
        </p>
      </div>

      {/* Check-in Status */}
      {checkInStatus && (
        <div
          className={`card ${
            checkInStatus.success
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            {checkInStatus.success ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            )}
            <div>
              <div
                className={`font-semibold ${
                  checkInStatus.success ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {checkInStatus.success ? "Success!" : "Already Checked In"}
              </div>
              <div
                className={`${
                  checkInStatus.success ? "text-green-700" : "text-yellow-700"
                }`}
              >
                {checkInStatus.message}
              </div>
              {checkInStatus.pointsEarned && (
                <div className="mt-2 text-2xl font-bold text-accent-600">
                  +{checkInStatus.pointsEarned} points
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Simulation */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-6 text-center">
          Scan QR Code
        </h2>

        <div className="text-center space-y-6">
          {/* QR Code Display Area */}
          <div className="mx-auto w-64 h-64 bg-primary-50 border-2 border-dashed border-primary-200 rounded-lg flex items-center justify-center">
            {isScanning ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-primary-600">Scanning...</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                <p className="text-primary-600">Point camera at QR code</p>
              </div>
            )}
          </div>

          {/* Scan Button */}
          <button
            onClick={handleCheckIn}
            disabled={isScanning || !canCheckIn}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning
              ? "Scanning..."
              : canCheckIn
              ? "Start Scanning"
              : "Already Checked In Today"}
          </button>

          {/* Demo Button */}
          <div className="pt-4 border-t border-orange-100">
            <p className="text-sm text-gray-500 mb-3">
              {canCheckIn
                ? "Scan the QR code or use demo check-in:"
                : "Come back tomorrow for more points!"}
            </p>
            {canCheckIn && (
              <button
                onClick={handleCheckIn}
                disabled={isScanning}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Demo Check-In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4">
          How to Check In
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
              1
            </div>
            <div>
              <div className="font-medium text-primary-800">
                Find the QR code
              </div>
              <div className="text-primary-600">
                Look for the Levity Loyalty QR code at your table or at the
                counter
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
              2
            </div>
            <div>
              <div className="font-medium text-primary-800">
                Scan with your phone
              </div>
              <div className="text-primary-600">
                Use this app or your phone's camera to scan the code
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
              3
            </div>
            <div>
              <div className="font-medium text-primary-800">
                Earn points automatically
              </div>
              <div className="text-primary-600">
                Receive 10 points for each visit (once per day)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Points */}
      <div className="card text-center">
        <Star className="h-12 w-12 text-accent-500 mx-auto mb-4" />
        <div className="text-3xl font-bold text-accent-600 mb-2">
          {user.points}
        </div>
        <div className="text-primary-600 mb-4">Current Points Balance</div>
        <button onClick={() => navigate("/rewards")} className="btn-secondary">
          View Available Rewards
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
