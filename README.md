# Graph Viewer Full-Stack Application

## Deployment Guide for AWS Amplify

This guide explains how to deploy this full-stack application (React frontend + Express backend) to AWS Amplify.

### Project Structure

- **Frontend**: React application built with Vite
- **Backend**: Express.js server connecting to AWS Neptune database

### Prerequisites

- AWS Account
- AWS Amplify CLI installed and configured
- AWS Neptune instance (for production)

### Deployment Steps

#### 1. Prepare Your Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
PORT=8000
NEPTUNE_ENDPOINT=your-neptune-endpoint
# Add any other environment variables your application needs
```

#### 2. Deploy to AWS Amplify

1. **Connect your repository to Amplify**:
   - Log in to the AWS Management Console
   - Navigate to AWS Amplify
   - Click "New app" → "Host web app"
   - Connect to your Git provider and select your repository

2. **Configure build settings**:
   - Amplify will automatically detect the `amplify.yml` file in your repository
   - This file is already configured for both frontend and backend deployment
   - Review the build settings and make any necessary adjustments

3. **Add environment variables**:
   - In the Amplify Console, go to "Environment variables"
   - Add all the variables from your `.env` file
   - Make sure to add `NEPTUNE_ENDPOINT` pointing to your production Neptune instance

4. **Deploy your application**:
   - Click "Save and deploy"
   - Amplify will build and deploy your application according to the `amplify.yml` configuration

### How It Works

The `amplify.yml` file in this project is configured to:

1. Build the React frontend with Vite
2. Include the Express backend files in the deployment
3. Set up proper file paths and dependencies

When deployed, Amplify will:
- Serve the static frontend files
- Run the Express backend server
- Connect to your Neptune database

### Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Run in development mode (frontend + backend)
npm run dev

# Or run frontend and backend separately
npm run dev:client
npm run dev:server
```

### Production Build

To create a production build locally:

```bash
npm run prod  # Builds frontend and starts the server
```

### Troubleshooting

- If you encounter connection issues with Neptune, check your security groups and VPC settings
- For deployment issues, check the Amplify build logs
- Make sure all environment variables are properly set in the Amplify Console

### Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Express.js Documentation](https://expressjs.com/)
- [AWS Neptune Documentation](https://docs.aws.amazon.com/neptune/)