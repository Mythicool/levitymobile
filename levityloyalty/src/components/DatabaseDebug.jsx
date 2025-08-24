import { useState, useEffect } from "react";
import { databaseService } from "../services/hybridDataService";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const DatabaseDebug = () => {
  const [envInfo, setEnvInfo] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get environment info on component mount
    const info = databaseService.getEnvironmentInfo();
    setEnvInfo(info);
  }, []);

  const runConnectionTest = async () => {
    setTesting(true);
    try {
      const results = await databaseService.testConnection();
      setConnectionTest(results);
    } catch (error) {
      setConnectionTest({
        environment: "error",
        stores: {},
        errors: [error.message],
      });
    } finally {
      setTesting(false);
    }
  };

  const clearAllData = async () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      try {
        await databaseService.clearAllData();
        alert("All data cleared successfully");
        // Re-run connection test
        await runConnectionTest();
      } catch (error) {
        alert("Failed to clear data: " + error.message);
      }
    }
  };

  // Only show in development or when explicitly enabled
  if (!envInfo?.isDev && !window.location.search.includes("debug=true")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Database Debug Panel"
      >
        <Database className="h-5 w-5" />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Database Debug
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Environment Information */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Environment</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Environment:</strong> {envInfo?.environment}
                </div>
                <div>
                  <strong>Netlify:</strong>{" "}
                  {envInfo?.isNetlifyEnvironment ? "✅" : "❌"}
                </div>
                <div>
                  <strong>Site ID:</strong>{" "}
                  {envInfo?.hasNetlifySiteId ? "✅" : "❌"}
                </div>
                <div>
                  <strong>Token:</strong>{" "}
                  {envInfo?.hasNetlifyToken ? "✅" : "❌"}
                </div>
                <div className="col-span-2">
                  <strong>Hostname:</strong> {envInfo?.hostname}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Connection Test</h4>
              <button
                onClick={runConnectionTest}
                disabled={testing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </button>
            </div>

            {connectionTest && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="mb-2">
                  <strong>Storage Type:</strong> {connectionTest.environment}
                </div>

                {connectionTest.errors.length > 0 && (
                  <div className="mb-2">
                    <strong className="text-red-600">Errors:</strong>
                    <ul className="list-disc list-inside text-red-600">
                      {connectionTest.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <strong>Stores:</strong>
                  <div className="mt-1">
                    {Object.entries(connectionTest.stores).map(
                      ([name, info]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between py-1"
                        >
                          <span>{name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {info.type}
                            </span>
                            {info.status === "success" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={clearAllData}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
            >
              Clear All Data
            </button>

            <div className="text-xs text-gray-500 text-center">
              Add ?debug=true to URL to show in production
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDebug;
