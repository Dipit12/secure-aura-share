# AWS Setup Guide for SecureShare

This guide will help you configure AWS services for the Context-Aware File Sharing application.

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS services

## Required AWS Services

1. **Amazon S3** - File storage
2. **Amazon DynamoDB** - Metadata and logs storage
3. **Amazon Cognito** - User authentication (optional for MVP)
4. **Amazon SES/SNS** - Email/SMS for OTP (optional for MVP)

## Step 1: Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-secureshare-bucket --region us-east-1

# Enable CORS for browser uploads
aws s3api put-bucket-cors --bucket your-secureshare-bucket --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

## Step 2: Create DynamoDB Tables

### Files Table
```bash
aws dynamodb create-table \
  --table-name caac-files \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=uploadedBy,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"uploadedBy-index","KeySchema":[{"AttributeName":"uploadedBy","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Logs Table
```bash
aws dynamodb create-table \
  --table-name caac-logs \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"userId-timestamp-index","KeySchema":[{"AttributeName":"userId","KeyType":"HASH"},{"AttributeName":"timestamp","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Policies Table (Optional)
```bash
aws dynamodb create-table \
  --table-name caac-policies \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

## Step 3: Create IAM User with Required Permissions

1. Go to AWS IAM Console
2. Create a new user: `secureshare-app`
3. Select "Programmatic access"
4. Create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-secureshare-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/caac-files",
        "arn:aws:dynamodb:*:*:table/caac-files/index/*",
        "arn:aws:dynamodb:*:*:table/caac-logs",
        "arn:aws:dynamodb:*:*:table/caac-logs/index/*",
        "arn:aws:dynamodb:*:*:table/caac-policies"
      ]
    }
  ]
}
```

5. Save the Access Key ID and Secret Access Key

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your-secureshare-bucket

# DynamoDB Tables
AWS_DYNAMODB_FILES_TABLE=caac-files
AWS_DYNAMODB_LOGS_TABLE=caac-logs
AWS_DYNAMODB_POLICIES_TABLE=caac-policies
```

**Note:** Make sure `.env.local` is in your `.gitignore` file to avoid committing sensitive credentials.

## Step 5: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. The app should automatically detect AWS configuration and switch from demo mode to AWS mode.

3. Try uploading a file and check your S3 bucket and DynamoDB tables.

## Optional: Set Up Cognito for Authentication

For production authentication, set up Amazon Cognito:

1. Create a User Pool in AWS Cognito
2. Configure app client
3. Update the authentication logic in `src/contexts/AppContext.tsx`

## Cost Optimization Tips

- Use S3 Intelligent-Tiering for automatic cost optimization
- Enable DynamoDB auto-scaling
- Set up S3 lifecycle policies to archive old files
- Use CloudWatch to monitor usage and costs

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. Use IAM roles with minimum required permissions
3. Enable MFA for your AWS account
4. Enable S3 bucket encryption
5. Enable CloudTrail for audit logging
6. Regularly rotate access keys

## Troubleshooting

### Files not uploading
- Check S3 bucket CORS configuration
- Verify IAM permissions
- Check browser console for errors

### DynamoDB queries failing
- Verify GSI (Global Secondary Index) is created
- Check IAM permissions for DynamoDB

### "AWS not configured" message
- Ensure `.env.local` file exists with correct values
- Restart the development server after adding credentials

## Support

For issues related to:
- AWS services: Check [AWS Documentation](https://docs.aws.amazon.com/)
- Application code: Check the README.md file

## Production Deployment

For production deployment:
1. Use AWS Systems Manager Parameter Store or AWS Secrets Manager for credentials
2. Set up CloudFront for S3 content delivery
3. Enable AWS WAF for security
4. Set up proper monitoring with CloudWatch
5. Consider using AWS Lambda for backend processing
