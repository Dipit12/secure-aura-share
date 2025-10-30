// AWS Configuration
// Fill in your AWS credentials here when running locally
// Note: In Vite, environment variables must be prefixed with VITE_ to be exposed to the client
export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || '',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
  s3: {
    bucket: import.meta.env.VITE_AWS_S3_BUCKET || '',
  },
  dynamodb: {
    filesTable: import.meta.env.VITE_AWS_DYNAMODB_FILES_TABLE || 'caac-files',
    logsTable: import.meta.env.VITE_AWS_DYNAMODB_LOGS_TABLE || 'caac-logs',
    policiesTable: import.meta.env.VITE_AWS_DYNAMODB_POLICIES_TABLE || 'caac-policies',
  },
};

// Check if AWS is configured
export const isAWSConfigured = () => {
  return Boolean(
    AWS_CONFIG.region &&
    AWS_CONFIG.credentials.accessKeyId &&
    AWS_CONFIG.credentials.secretAccessKey &&
    AWS_CONFIG.s3.bucket
  );
};
