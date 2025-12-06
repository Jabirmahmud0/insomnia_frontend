export default async function handler(request, response) {
  response.status(200).json({ 
    status: 'ok', 
    message: 'Frontend is running successfully',
    timestamp: new Date().toISOString()
  });
}