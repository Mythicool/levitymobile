import { useState, useEffect } from "react";
import { databaseService, userService } from "../services/hybridDataService";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Cloud,
} from "lucide-react";

const DatabaseTest = () => {
  const [envInfo, setEnvInfo] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [bothSystemsTest, setBothSystemsTest] = useState(null);
  const [userTest, setUserTest] = useState(null);
  const [operationsTest, setOperationsTest] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
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

  const runBothSystemsTest = async () => {
    setTesting(true);
    try {
      const results = await databaseService.testBothSystems();
      setBothSystemsTest(results);
    } catch (error) {
      setBothSystemsTest({
        currentStorage: "error",
        systems: {},
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const runUserTest = async () => {
    setTesting(true);
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testName = "Test User";
      const testPassword = "testpass123";

      // Test user creation
      const createResult = await userService.createUser({
        name: testName,
        email: testEmail,
        password: testPassword,
      });

      if (!createResult.success) {
        throw new Error("User creation failed: " + createResult.error);
      }

      // Test user retrieval
      const getResult = await userService.getUserByEmail(testEmail);
      if (!getResult.success) {
        throw new Error("User retrieval failed: " + getResult.error);
      }

      // Test user update
      const updateResult = await userService.updateUser(createResult.user.id, {
        points: 50,
      });

      if (!updateResult.success) {
        throw new Error("User update failed: " + updateResult.error);
      }

      setUserTest({
        success: true,
        operations: ["create", "read", "update"],
        user: updateResult.user,
        storage: connectionTest?.environment || "unknown",
      });
    } catch (error) {
      setUserTest({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const runOperationsTest = async () => {
    setTesting(true);
    try {
      const results = await databaseService.testAllOperations();
      setOperationsTest(results);
    } catch (error) {
      setOperationsTest({
        success: false,
        error: error.message,
        tests: {},
        summary: { totalTests: 0, passedTests: 0, failedTests: 1 },
      });
    } finally {
      setTesting(false);
    }
  };

  const clearTestData = async () => {
    if (confirm("Clear all test data?")) {
      try {
        await databaseService.clearAllData();
        alert("Test data cleared");
        setUserTest(null);
        setConnectionTest(null);
      } catch (error) {
        alert("Failed to clear data: " + error.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-primary-800">
            Database Integration Test
          </h1>
        </div>

        {/* Environment Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">
            Environment Information
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <strong>Current Storage:</strong> {envInfo?.currentStorage}
              </div>
              <div>
                <strong>Storage Preference:</strong> {envInfo?.preference}
              </div>
              <div>
                <strong>Database Available:</strong>{" "}
                {envInfo?.available?.database ? "✅ Yes" : "❌ No"}
              </div>
              <div>
                <strong>Blobs Available:</strong>{" "}
                {envInfo?.available?.blobs ? "✅ Yes" : "❌ No"}
              </div>
              <div>
                <strong>Netlify Site ID:</strong>{" "}
                {envInfo?.blobs?.hasNetlifySiteId ? "✅ Present" : "❌ Missing"}
              </div>
              <div>
                <strong>Database URL:</strong>{" "}
                {envInfo?.database?.hasConnectionString
                  ? "✅ Present"
                  : "❌ Missing"}
              </div>
              <div className="md:col-span-2">
                <strong>Hostname:</strong> {envInfo?.blobs?.hostname}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-800">
              Database Connection Test
            </h2>
            <button
              onClick={runConnectionTest}
              disabled={testing}
              className="btn-primary flex items-center space-x-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>Test Connection</span>
            </button>
          </div>

          {connectionTest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <strong>Storage Type:</strong>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      connectionTest.environment === "netlify"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {connectionTest.environment}
                  </span>
                </div>
              </div>

              {connectionTest.errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <strong className="text-red-800">Errors:</strong>
                  </div>
                  <ul className="list-disc list-inside text-red-700">
                    {connectionTest.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <strong>Store Status:</strong>
                <div className="mt-2 space-y-2">
                  {Object.entries(connectionTest.stores).map(([name, info]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <span className="font-medium">{name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {info.type}
                        </span>
                        {info.status === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Both Systems Test */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-800">
              Storage Systems Comparison
            </h2>
            <button
              onClick={runBothSystemsTest}
              disabled={testing}
              className="btn-primary flex items-center space-x-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Server className="h-4 w-4" />
              )}
              <span>Test Both Systems</span>
            </button>
          </div>

          {bothSystemsTest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <strong>Current Storage:</strong>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      bothSystemsTest.currentStorage === "database"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {bothSystemsTest.currentStorage}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Database System */}
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Server className="h-5 w-5 text-blue-600" />
                    <strong className="text-blue-800">
                      PostgreSQL Database
                    </strong>
                    {bothSystemsTest.systems?.database?.available ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Status:</strong>{" "}
                      {bothSystemsTest.systems?.database?.success
                        ? "Connected"
                        : "Failed"}
                    </div>
                    {bothSystemsTest.systems?.database?.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong>{" "}
                        {bothSystemsTest.systems.database.error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blobs System */}
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Cloud className="h-5 w-5 text-green-600" />
                    <strong className="text-green-800">Netlify Blobs</strong>
                    {bothSystemsTest.systems?.blobs?.available ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Status:</strong>{" "}
                      {bothSystemsTest.systems?.blobs?.environment === "netlify"
                        ? "Connected"
                        : "Fallback"}
                    </div>
                    {bothSystemsTest.systems?.blobs?.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong>{" "}
                        {bothSystemsTest.systems.blobs.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {bothSystemsTest.recommendation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-800">Recommendation:</strong> Use{" "}
                  {bothSystemsTest.recommendation} for optimal performance
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Operations Test */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-800">
              User Operations Test
            </h2>
            <button
              onClick={runUserTest}
              disabled={testing || !connectionTest}
              className="btn-primary flex items-center space-x-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Test User CRUD</span>
            </button>
          </div>

          {userTest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {userTest.success ? (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <strong className="text-green-800">
                      User Operations Successful
                    </strong>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong>Operations:</strong>{" "}
                      {userTest.operations.join(", ")}
                    </div>
                    <div>
                      <strong>Storage:</strong> {userTest.storage}
                    </div>
                    <div>
                      <strong>User ID:</strong> {userTest.user.id}
                    </div>
                    <div>
                      <strong>Points:</strong> {userTest.user.points}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <strong className="text-red-800">
                      User Operations Failed
                    </strong>
                  </div>
                  <p className="text-red-700">{userTest.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comprehensive Operations Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-800">
              Comprehensive Database Operations Test
            </h2>
            <button
              onClick={runOperationsTest}
              disabled={testing || envInfo?.currentStorage !== "database"}
              className="btn-primary flex items-center space-x-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>Run Full Test Suite</span>
            </button>
          </div>

          {envInfo?.currentStorage !== "database" && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                ⚠️ This test only runs when using database storage. Current
                storage: {envInfo?.currentStorage}
              </p>
            </div>
          )}

          {operationsTest && (
            <div className="space-y-4">
              {/* Test Summary */}
              <div
                className={`p-4 rounded-lg ${
                  operationsTest.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center mb-2">
                  {operationsTest.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <strong
                    className={
                      operationsTest.success ? "text-green-800" : "text-red-800"
                    }
                  >
                    Test Suite {operationsTest.success ? "Passed" : "Failed"}
                  </strong>
                </div>
                {operationsTest.summary && (
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Total Tests:</strong>{" "}
                      {operationsTest.summary.totalTests}
                    </div>
                    <div>
                      <strong>Passed:</strong>{" "}
                      {operationsTest.summary.passedTests}
                    </div>
                    <div>
                      <strong>Failed:</strong>{" "}
                      {operationsTest.summary.failedTests}
                    </div>
                    <div>
                      <strong>Success Rate:</strong>{" "}
                      {operationsTest.summary.successRate}
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Test Results */}
              {operationsTest.tests &&
                Object.keys(operationsTest.tests).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">
                      Individual Test Results:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(operationsTest.tests).map(
                        ([testName, result]) => (
                          <div
                            key={testName}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {testName
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Errors */}
              {operationsTest.errors && operationsTest.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">Errors:</h3>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {operationsTest.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={clearTestData}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear Test Data
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <strong className="text-blue-800">Testing Instructions:</strong>
              <ol className="list-decimal list-inside text-blue-700 mt-2 space-y-1">
                <li>First run "Test Connection" to verify database setup</li>
                <li>If connection shows "netlify", Netlify Blobs is working</li>
                <li>
                  If connection shows "local", check environment variables
                </li>
                <li>Run "Test User CRUD" to verify data operations</li>
                <li>Check that data persists across page refreshes</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
