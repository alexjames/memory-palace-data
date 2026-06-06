## AWS
#### Cloud
The cloud is a bunch of data-centers that handle an application's compute, network and storage needs. If an organization runs its own on-premise datacenters, they have to worry about capacity planning, scaling, utilization, etc, which costs a lot of time and money. Using a cloud provider gives the flexibility to lease hardware from someone else. This lets the company focus on its core business, without having to worry about managing infrastructure. A cloud provides high availability, fault tolerance, and scalability. AWS, Azure and GC are the three most popular cloud service providers.

### VPC
VPC stands for Virtual Private Cloud. It is an isolated network for your cloud resources, logically separated from other resources in the account.

### EC2
An EC2 instance is a virtual computer you can use for compute.

### S3
S3 is a storage bucket for storing files. It's used for mass, long-term storage.

#### Availability Zone
Each region has availability zones and each availability zone is a data-center. If the Northern Virginia region has 3 availability zones, that means there are three physically separated data-centers at the location.
When you create an AWS account and create resources in it, you have to pick which region and availability zone you want to create that resource in.
Resource that are in a region are accessible through all availability zones in that region. Some services such as IAM work across regions.
An AWS VPC can span multiple AZs and Regions.

### AWS Account
The AWS "root" user is created when an account is first created. It's credentials are the email id and password associated with the account. This user has full priveleges on all resources in this account. The root user should not be used for daily tasks and should be protected by MFA.
AWS Users are created in IAM and have varying degrees of access to AWS accounts.

### IAM
IAM is where you manage users, groups and roles and manage access to AWS resources. IAM settings apply globally to all regions.

### ARN
Amazon Resource Name

### IAM Policy
An IAM policy is a document that specifies one or more permissions that can be assigned to a user, group, role or resource. They can be thought of as sets of permissions.

### Users
When a user is first created, it has a non-explicity deny for all resources. You attach one or more policies to a user to give it permissions over resources. If one policy has an allow permission and another has a deny permission, the deny always over-rules the allow.

Users have a sign-in credential to allow access via the console and an access key to make REST/HTTP requests.

### Groups
Groups allow you to apply a policy to multiple users. 

### Roles
A role is something another entity can assume to gain permissions temporarily to perform an action. Roles are assumed by EC2 instances and other non-account users. Policies cannot be assigned directly to AWS services, which is also why roles must be used. You could put access keys on an EC2 instances to perform actions, but this is not a security best-practice and you should always use roles instead.

### Security Token Service
STS gives temporary access via tokens to an AWS resource. You the gain them via API calls to the STS service. This way, you don't need to distribute long-term credentials or worry about key rotation or revocation. `AssumeRole` is an STS API call. When requested, you get back a
 * Security Token
 * Access Key ID
 * Secret Access Key
 
### API Access Keys
API access keys are required to make programmatic calls to AWS via CLI, and the AWS SDK. These are available only once during the creation of the user, or during key rotation. Roles do not have API access keys.

## Cloud Formation
Cloud Formation allows you to define infrastructure as code and spin up infrastructure dynamically. It allows you to version infrastructure, perform rollbacks and also eliminates manual configuration. Cloud Formation templates are versioned to determine the version of hte template they conform to (as new features are added to resources, they have different semantics).

### EC2
EC2 are scalable server instances. They are created using Amazon Machine Images (AMIs) and have EBS/EFS/Instance Stores for storage. An instance must belong to a security group, an existing VPC, subnet and availability zone. Key-pairs are used for authentication.

The hardware components of an EC2 instance are - Compute (CPU), memory (RAM), storage and network bandwidth.

Purchasing options:
 * On-demand - pay as much you use
 * Reserved Instances - reserved for a year or more at a discounted price
 * Spot instances - bid for an instance type, fluctuates based on demand and supply in the Amazon marketplace. You are charged per second and provisioned resources terminate automatically when the spot-price is above your bid
 * Dedicated host - entire physical machine is dedicated for your use
 
Elastic Block Storage are network attached persistent volumes for storage of data. They can be backed up by snapshots and are replicated within the availability zone. They are persistent on the same EC2 instance across VM reboots.
 
Instance Store volumes are physically attached devices to the host computer. Data is stored ephemerally, i.e. data is lost when an instance shuts down.

Elastic File System is a scalable network filesystem accessible across multiple EC2 instances. Is storage capacity scales with demand and you are only charged for the storage capacity and bandwidth (read/writes) you consume. Files follow the POSIX permission model, access is controlled through the VPC and IAM policy. Data can be encrypted using AWS KMS.

### VPC
VPCs span availability zones but are restricted to a single region. A VPC can have multiple subnets. Every region has a default VPC pre-configured. In the default VPC, all subnets have a route to the internet via an Internet Gateway.
