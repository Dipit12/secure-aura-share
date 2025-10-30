import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { AWS_CONFIG, isAWSConfigured } from '@/lib/aws-config';
import type { FileItem, AccessLog, AccessPolicy } from '@/types';

class AWSService {
  private s3Client: S3Client | null = null;
  private dynamoClient: DynamoDBDocumentClient | null = null;
  private configured: boolean = false;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    if (!isAWSConfigured()) {
      console.warn('AWS not configured. Using demo mode.');
      return;
    }

    try {
      this.s3Client = new S3Client({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials,
      });

      const dynamoDBClient = new DynamoDBClient({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials,
      });

      this.dynamoClient = DynamoDBDocumentClient.from(dynamoDBClient);
      this.configured = true;
      console.log('AWS services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AWS services:', error);
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async uploadFile(file: File, policy: AccessPolicy, userId: string): Promise<FileItem> {
    if (!this.s3Client || !this.dynamoClient) {
      throw new Error('AWS not configured');
    }

    const s3Key = `files/${userId}/${Date.now()}-${file.name}`;
    
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: AWS_CONFIG.s3.bucket,
      Key: s3Key,
      Body: file,
      ContentType: file.type,
    });

    await this.s3Client.send(uploadCommand);

    // Store metadata in DynamoDB
    const fileItem: FileItem = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      policy,
      s3Key,
    };

    const putCommand = new PutCommand({
      TableName: AWS_CONFIG.dynamodb.filesTable,
      Item: fileItem,
    });

    await this.dynamoClient.send(putCommand);

    return fileItem;
  }

  async getFiles(userId: string): Promise<FileItem[]> {
    if (!this.dynamoClient) {
      throw new Error('AWS not configured');
    }

    const command = new QueryCommand({
      TableName: AWS_CONFIG.dynamodb.filesTable,
      IndexName: 'uploadedBy-index',
      KeyConditionExpression: 'uploadedBy = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const response = await this.dynamoClient.send(command);
    return (response.Items || []) as FileItem[];
  }

  async getDownloadUrl(fileItem: FileItem): Promise<string> {
    if (!this.s3Client || !fileItem.s3Key) {
      throw new Error('AWS not configured or file key missing');
    }

    const command = new GetObjectCommand({
      Bucket: AWS_CONFIG.s3.bucket,
      Key: fileItem.s3Key,
    });

    // Generate presigned URL valid for 15 minutes
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    return url;
  }

  async logAccess(log: AccessLog): Promise<void> {
    if (!this.dynamoClient) {
      throw new Error('AWS not configured');
    }

    const command = new PutCommand({
      TableName: AWS_CONFIG.dynamodb.logsTable,
      Item: log,
    });

    await this.dynamoClient.send(command);
  }

  async getAccessLogs(userId: string, limit: number = 50): Promise<AccessLog[]> {
    if (!this.dynamoClient) {
      throw new Error('AWS not configured');
    }

    const command = new QueryCommand({
      TableName: AWS_CONFIG.dynamodb.logsTable,
      IndexName: 'userId-timestamp-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    });

    const response = await this.dynamoClient.send(command);
    return (response.Items || []) as AccessLog[];
  }
}

export const awsService = new AWSService();
