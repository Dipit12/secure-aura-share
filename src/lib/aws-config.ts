// AWS Configuration
// Fill in your AWS credentials here when running locally
export const AWS_CONFIG = {
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET || '',
  },
  dynamodb: {
    filesTable: process.env.AWS_DYNAMODB_FILES_TABLE || 'caac-files',
    logsTable: process.env.AWS_DYNAMODB_LOGS_TABLE || 'caac-logs',
    policiesTable: process.env.AWS_DYNAMODB_POLICIES_TABLE || 'caac-policies',
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
