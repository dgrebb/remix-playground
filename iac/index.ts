import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Configuration
const config = new pulumi.Config();
const environment = config.require("environment") || "dev";
const appName = "remix-ai-chat";
const dbName = `${appName}-db`;
const dbUser = config.requireSecret("dbUser");
const dbPassword = config.requireSecret("dbPassword");

// Tags for all resources
const tags = {
  Environment: environment,
  Project: appName,
  ManagedBy: "dgrebb",
};

// Create a VPC for our application
const vpc = new awsx.ec2.Vpc(`${appName}-vpc`, {
  cidrBlock: "10.0.0.0/16",
  numberOfAvailabilityZones: 2,
  tags: {
    ...tags,
    Name: `${appName}-vpc`,
  },
});

// Security group for RDS
const dbSecurityGroup = new aws.ec2.SecurityGroup(`${appName}-db-sg`, {
  vpcId: vpc.vpcId,
  description: "Allow database access",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: ["10.0.0.0/16"], // Only allow access from within VPC
    },
  ],
  tags: {
    ...tags,
    Name: `${appName}-db-sg`,
  },
});

// Create RDS Postgres instance
const dbSubnetGroup = new aws.rds.SubnetGroup(`${appName}-db-subnet`, {
  subnetIds: vpc.privateSubnetIds,
  tags: {
    ...tags,
    Name: `${appName}-db-subnet`,
  },
});

const db = new aws.rds.Instance(`${appName}-db`, {
  engine: "postgres",
  instanceClass: "db.t3.small",
  allocatedStorage: 20,
  name: dbName,
  username: dbUser,
  password: dbPassword,
  skipFinalSnapshot: true,
  dbSubnetGroupName: dbSubnetGroup.name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  tags: {
    ...tags,
    Name: `${appName}-db`,
  },
});

// Create S3 bucket for static assets
const websiteBucket = new aws.s3.Bucket(`${appName}-website`, {
  acl: "private",
  website: {
    indexDocument: "index.html",
    errorDocument: "index.html",
  },
  tags: {
    ...tags,
    Name: `${appName}-website`,
  },
});

// Create CloudFront distribution
const cloudfrontOAI = new aws.cloudfront.OriginAccessIdentity(`${appName}-oai`);

const cloudfrontDistribution = new aws.cloudfront.Distribution(
  `${appName}-cf`,
  {
    enabled: true,
    defaultRootObject: "index.html",
    origins: [
      {
        domainName: websiteBucket.bucketRegionalDomainName,
        originId: websiteBucket.id,
        s3OriginConfig: {
          originAccessIdentity: cloudfrontOAI.cloudfrontAccessIdentityPath,
        },
      },
    ],
    defaultCacheBehavior: {
      targetOriginId: websiteBucket.id,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],
      forwardedValues: {
        queryString: false,
        cookies: {
          forward: "none",
        },
      },
      minTtl: 0,
      defaultTtl: 3600,
      maxTtl: 86400,
    },
    priceClass: "PriceClass_100",
    customErrorResponses: [
      {
        errorCode: 404,
        responseCode: 200,
        responsePagePath: "/index.html",
      },
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },
    viewerCertificate: {
      cloudfrontDefaultCertificate: true,
    },
    tags: {
      ...tags,
      Name: `${appName}-cf`,
    },
  }
);

// Allow CloudFront to access the S3 bucket
const bucketPolicy = new aws.s3.BucketPolicy(`${appName}-bucket-policy`, {
  bucket: websiteBucket.id,
  policy: pulumi
    .all([websiteBucket.id, cloudfrontOAI.iamArn])
    .apply(([bucketId, oaiArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: oaiArn,
            },
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${bucketId}/*`,
          },
        ],
      })
    ),
});

// Create Lambda function for API
const lambdaRole = new aws.iam.Role(`${appName}-lambda-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
      },
    ],
  }),
  tags: {
    ...tags,
    Name: `${appName}-lambda-role`,
  },
});

const lambdaPolicy = new aws.iam.RolePolicy(`${appName}-lambda-policy`, {
  role: lambdaRole.id,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        Effect: "Allow",
        Resource: "arn:aws:logs:*:*:*",
      },
      {
        Action: [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
        ],
        Effect: "Allow",
        Resource: "*",
      },
    ],
  }),
});

const lambdaSecurityGroup = new aws.ec2.SecurityGroup(`${appName}-lambda-sg`, {
  vpcId: vpc.vpcId,
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    ...tags,
    Name: `${appName}-lambda-sg`,
  },
});

const apiLambda = new aws.lambda.Function(`${appName}-api`, {
  role: lambdaRole.arn,
  runtime: "nodejs18.x",
  handler: "index.handler",
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("../server-build"),
  }),
  environment: {
    variables: {
      NODE_ENV: "production",
      DATABASE_URL: pulumi.interpolate`postgresql://${dbUser}:${dbPassword}@${db.endpoint}/${dbName}`,
    },
  },
  vpcConfig: {
    subnetIds: vpc.privateSubnetIds,
    securityGroupIds: [lambdaSecurityGroup.id],
  },
  timeout: 30,
  memorySize: 1024,
  tags: {
    ...tags,
    Name: `${appName}-api`,
  },
});

// Create API Gateway
const api = new awsx.apigateway.API(`${appName}-api-gateway`, {
  routes: [
    {
      path: "/{proxy+}",
      method: "ANY",
      eventHandler: apiLambda,
    },
  ],
  stageName: environment,
});

// Create WebSocket API for real-time chat
const websocketApi = new aws.apigatewayv2.Api(`${appName}-websocket`, {
  protocolType: "WEBSOCKET",
  routeSelectionExpression: "$request.body.action",
  tags: {
    ...tags,
    Name: `${appName}-websocket`,
  },
});

const websocketLambda = new aws.lambda.Function(
  `${appName}-websocket-handler`,
  {
    role: lambdaRole.arn,
    runtime: "nodejs18.x",
    handler: "websocket.handler",
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("../server-build"),
    }),
    environment: {
      variables: {
        NODE_ENV: "production",
        DATABASE_URL: pulumi.interpolate`postgresql://${dbUser}:${dbPassword}@${db.endpoint}/${dbName}`,
      },
    },
    vpcConfig: {
      subnetIds: vpc.privateSubnetIds,
      securityGroupIds: [lambdaSecurityGroup.id],
    },
    tags: {
      ...tags,
      Name: `${appName}-websocket-handler`,
    },
  }
);

const websocketIntegration = new aws.apigatewayv2.Integration(
  `${appName}-websocket-integration`,
  {
    apiId: websocketApi.id,
    integrationType: "AWS_PROXY",
    integrationUri: websocketLambda.invokeArn,
  }
);

const connectRoute = new aws.apigatewayv2.Route(`${appName}-connect-route`, {
  apiId: websocketApi.id,
  routeKey: "$connect",
  target: pulumi.interpolate`integrations/${websocketIntegration.id}`,
});

const disconnectRoute = new aws.apigatewayv2.Route(
  `${appName}-disconnect-route`,
  {
    apiId: websocketApi.id,
    routeKey: "$disconnect",
    target: pulumi.interpolate`integrations/${websocketIntegration.id}`,
  }
);

const messageRoute = new aws.apigatewayv2.Route(`${appName}-message-route`, {
  apiId: websocketApi.id,
  routeKey: "message",
  target: pulumi.interpolate`integrations/${websocketIntegration.id}`,
});

const websocketStage = new aws.apigatewayv2.Stage(
  `${appName}-websocket-stage`,
  {
    apiId: websocketApi.id,
    name: environment,
    autoDeploy: true,
  }
);

// Allow API Gateway to invoke the Lambda
const websocketPermission = new aws.lambda.Permission(
  `${appName}-websocket-permission`,
  {
    action: "lambda:InvokeFunction",
    function: websocketLambda.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${websocketApi.executionArn}/*/*`,
  }
);

// Create Cognito User Pool for authentication
const userPool = new aws.cognito.UserPool(`${appName}-user-pool`, {
  usernameAttributes: ["email"],
  autoVerify: {
    email: true,
  },
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
  },
  tags: {
    ...tags,
    Name: `${appName}-user-pool`,
  },
});

const userPoolClient = new aws.cognito.UserPoolClient(
  `${appName}-user-pool-client`,
  {
    userPoolId: userPool.id,
    generateSecret: false,
    explicitAuthFlows: [
      "ALLOW_USER_SRP_AUTH",
      "ALLOW_REFRESH_TOKEN_AUTH",
      "ALLOW_USER_PASSWORD_AUTH",
    ],
  }
);

// Export important values
export const websiteUrl = cloudfrontDistribution.domainName;
export const apiUrl = api.url;
export const websocketUrl = pulumi.interpolate`wss://${websocketApi.id}.execute-api.${aws.config.region}.amazonaws.com/${environment}`;
export const userPoolId = userPool.id;
export const userPoolClientId = userPoolClient.id;
export const dbEndpoint = db.endpoint;
