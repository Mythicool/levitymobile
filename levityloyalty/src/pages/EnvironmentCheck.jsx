import { useState, useEffect } from 'react'
import { databaseService } from '../services/hybridDataService'
import { Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw, Info } from 'lucide-react'

const EnvironmentCheck = () => {
  const [envInfo, setEnvInfo] = useState(null)
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnvironmentInfo()
  }, [])

  const loadEnvironmentInfo = async () => {
    setLoading(true)
    try {
      const info = databaseService.getEnvironmentInfo()
      const validationResult = databaseService.validateEnvironment()
      
      setEnvInfo(info)
      setValidation(validationResult)
    } catch (error) {
      console.error('Failed to load environment info:', error)
    } finally {
      setLoading(false)
    }
  }

  const logReport = () => {
    databaseService.logEnvironmentReport()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading environment information...</span>
        </div>
      </div>
    )
  }

  const getStatusIcon = (isValid) => {
    if (isValid) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getWarningIcon = () => <AlertTriangle className="h-5 w-5 text-yellow-500" />

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Environment Check</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadEnvironmentInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={logReport}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Info className="h-4 w-4 mr-2" />
              Log Report
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg mb-6 ${validation?.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            {getStatusIcon(validation?.isValid)}
            <h2 className="text-lg font-semibold ml-2">
              Overall Status: {validation?.isValid ? 'Valid' : 'Invalid'}
            </h2>
          </div>
          {validation?.info?.recommendedAction && (
            <p className="mt-2 text-sm text-gray-600">
              💡 {validation.info.recommendedAction}
            </p>
          )}
        </div>

        {/* Current Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Current Configuration</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Environment:</strong> {envInfo?.validation?.info?.environment}</div>
              <div><strong>Storage:</strong> {envInfo?.currentStorage}</div>
              <div><strong>Preference:</strong> {envInfo?.preference}</div>
              <div><strong>Database Available:</strong> {envInfo?.available?.database ? '✅' : '❌'}</div>
              <div><strong>Blobs Available:</strong> {envInfo?.available?.blobs ? '✅' : '❌'}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Environment Variables</h3>
            <div className="space-y-2 text-sm">
              <div><strong>VITE_STORAGE_PREFERENCE:</strong> {validation?.components?.storage?.info?.storagePreference}</div>
              <div><strong>Database URL:</strong> {validation?.components?.database?.info?.dbUrlSource}</div>
              <div><strong>Netlify Site ID:</strong> {validation?.components?.netlify?.info?.hasSiteId ? '✅' : '❌'}</div>
              <div><strong>Netlify Token:</strong> {validation?.components?.netlify?.info?.hasToken ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {validation?.errors?.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="font-semibold text-red-800">Errors</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {validation?.warnings?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              {getWarningIcon()}
              <h3 className="font-semibold text-yellow-800 ml-2">Warnings</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Component Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Component Details</h3>
          
          {/* Database */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {getStatusIcon(validation?.components?.database?.isValid)}
              <h4 className="font-semibold ml-2">Database Configuration</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>URL Format:</strong> {validation?.components?.database?.info?.dbUrlFormat}</div>
              <div><strong>URL Length:</strong> {validation?.components?.database?.info?.dbUrlLength}</div>
              <div><strong>Environment:</strong> {envInfo?.database?.environment}</div>
              <div><strong>Available:</strong> {envInfo?.database?.isDatabaseAvailable ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Storage */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {getStatusIcon(validation?.components?.storage?.isValid)}
              <h4 className="font-semibold ml-2">Storage Configuration</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Preference:</strong> {validation?.components?.storage?.info?.storagePreference}</div>
              <div><strong>Explicitly Set:</strong> {validation?.components?.storage?.info?.isExplicitlySet ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Netlify */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {getStatusIcon(validation?.components?.netlify?.isValid)}
              <h4 className="font-semibold ml-2">Netlify Configuration</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Environment:</strong> {validation?.components?.netlify?.info?.isNetlifyEnvironment ? 'Netlify' : 'Local'}</div>
              <div><strong>Site ID:</strong> {validation?.components?.netlify?.info?.hasSiteId ? '✅' : '❌'}</div>
              <div><strong>Token:</strong> {validation?.components?.netlify?.info?.hasToken ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Set <code>VITE_STORAGE_PREFERENCE=database</code> to force database usage</p>
            <p>• Set <code>VITE_DATABASE_URL</code> to your Neon PostgreSQL connection string</p>
            <p>• Set <code>VITE_NETLIFY_SITE_ID</code> and <code>VITE_NETLIFY_TOKEN</code> for Netlify Blobs</p>
            <p>• Click "Log Report" to see detailed information in the browser console</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentCheck
