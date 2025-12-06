export default async function handler(request, response) {
  try {
    // For Vercel deployment, we'll return a message indicating this is a frontend-only deployment
    // The actual API should be deployed separately
    response.status(200).json({
      message: "This is a frontend-only deployment. Please deploy the backend separately and set the VITE_API_URL environment variable.",
      predicted_class: "Healthy",
      ensemble_confidence: 95.5,
      rf_confidence: 92.3,
      confidence_note: "This is sample data. Deploy the backend separately for real predictions."
    });
  } catch (error) {
    response.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}