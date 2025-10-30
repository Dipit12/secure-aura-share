# 🛡️ Context-Aware Access Control (CAAC) System

## 📌 Overview
The **Context-Aware Access Control (CAAC) System** is a secure file sharing platform that ensures files can only be accessed under **trusted conditions**.  
Unlike traditional systems that grant access solely on login credentials, CAAC evaluates **contextual factors** such as:

- 🌍 IP Address & Geolocation  
- ⏰ Time of Access  
- 💻 Device Fingerprint (trusted vs untrusted devices)  
- 📊 User Behavior & Risk Scoring  

This means even if a user’s credentials are stolen, attackers **cannot access files** unless the request matches the expected context.  

---

## 🎯 Why?
Traditional authentication systems are vulnerable to:
- Password leaks
- Credential reuse
- Insider threats

CAAC strengthens security by adding **adaptive, policy-driven access control**.  
For example:
- Access denied if login comes from outside an allowed country.  
- Require OTP if accessing files at unusual hours.  
- Block new devices until verified.  

---

## ⚙️ How it Works
1. **User Authentication**  
   - Users authenticate using JWT or AWS Cognito.  

2. **Context Collection (Frontend + Backend)**  
   - Frontend captures device fingerprint & sends it with every request.  
   - Backend collects IP, User-Agent, time, and geo-location.  

3. **Policy Evaluation**  
   - Policies are stored in DynamoDB (e.g., “Confidential files accessible only 9 AM–6 PM from India”).  
   - A Policy Engine evaluates the current request context against these rules.  

4. **Decision Engine**  
   - ✅ Allow → Generate presigned S3 URL for file access.  
   - ⚠️ Step-up Auth → Ask for OTP (via email/SMS).  
   - ❌ Deny → Block and log the attempt.  

---

## 🏗️ Tech Stack
**Frontend (React + TypeScript)**  
- React (UI)  
- FingerprintJS (Device fingerprint)  
- Axios (API calls)  
- React Router (Navigation)  

**Backend (Node.js + TypeScript)**  
- Express.js
- JWT Authentication / AWS Cognito  
- Policy Engine (custom rule evaluator)  
- AWS SDK v3 (S3, DynamoDB, SES/SNS)  

**AWS Cloud Services**  
- **Amazon S3** → File storage  
- **Amazon DynamoDB** → Policies, logs, metadata  
- **AWS Lambda** (optional) → Policy evaluation serverless functions  
- **Amazon Cognito** → Authentication & Authorization  
- **Amazon SES/SNS** → OTP for step-up authentication  
- **Amazon WAF & GuardDuty** → Threat detection & request filtering  
- **Amazon CloudWatch** → Logging & monitoring  


