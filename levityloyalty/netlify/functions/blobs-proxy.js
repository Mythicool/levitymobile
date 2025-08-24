import { getStore } from '@netlify/blobs'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

// Initialize Netlify Blobs store
const getStoreInstance = (storeName) => {
  return getStore({
    name: storeName,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_TOKEN
  })
}

// Helper function to create response
const createResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

// Main handler function
export const handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    const { httpMethod, path, body } = event
    const pathParts = path.split('/').filter(Boolean)
    
    // Expected path: /.netlify/functions/blobs-proxy/{storeName}/{operation}/{key?}
    if (pathParts.length < 4) {
      return createResponse(400, { error: 'Invalid path format' })
    }

    const storeName = pathParts[3] // users, points-history, redemptions
    const operation = pathParts[4] // get, set, delete, list
    const key = pathParts[5] // optional key for specific operations

    console.log(`Blobs operation: ${operation} on store: ${storeName}`, { key })

    const store = getStoreInstance(storeName)

    switch (operation) {
      case 'get':
        if (!key) {
          return createResponse(400, { error: 'Key required for get operation' })
        }
        
        try {
          const data = await store.get(key, { type: 'text' })
          if (!data) {
            return createResponse(404, { error: 'Data not found' })
          }
          return createResponse(200, { success: true, data })
        } catch (error) {
          return createResponse(404, { error: 'Data not found' })
        }

      case 'set':
        if (!key) {
          return createResponse(400, { error: 'Key required for set operation' })
        }
        
        if (httpMethod !== 'POST' && httpMethod !== 'PUT') {
          return createResponse(405, { error: 'Method not allowed' })
        }

        const requestBody = JSON.parse(body || '{}')
        const value = requestBody.value

        if (!value) {
          return createResponse(400, { error: 'Value required for set operation' })
        }

        await store.set(key, value)
        return createResponse(200, { success: true, message: 'Data stored successfully' })

      case 'delete':
        if (!key) {
          return createResponse(400, { error: 'Key required for delete operation' })
        }
        
        if (httpMethod !== 'DELETE') {
          return createResponse(405, { error: 'Method not allowed' })
        }

        await store.delete(key)
        return createResponse(200, { success: true, message: 'Data deleted successfully' })

      case 'list':
        if (httpMethod !== 'GET') {
          return createResponse(405, { error: 'Method not allowed' })
        }

        const list = await store.list()
        return createResponse(200, { success: true, blobs: list.blobs || [] })

      default:
        return createResponse(400, { error: 'Invalid operation' })
    }

  } catch (error) {
    console.error('Blobs proxy error:', error)
    return createResponse(500, { 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
