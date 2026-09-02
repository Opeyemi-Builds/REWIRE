# REWIRE Hackathon MVP Checklist

## Goal
Build a simple, complete user journey that proves the concept:

Learn → Simulate → Prove → Earn

The MVP should show that a user can:
- sign up,
- complete anti-fraud learning content,
- answer realistic scam scenarios,
- receive a fraud-prevention score,
- get a certificate,
- see a safe opportunity pathway,
- and optionally connect to an Ecobank-style API-driven financial safety flow.

---

## MVP Scope
Keep the product intentionally narrow to a single demo story.

### Core User Story
A young Nigerian digital user is exposed to scam-related content and wants a safer, more legitimate path.

### Target Experience
1. Land on the app
2. Sign up / log in
3. Take a short anti-fraud lesson
4. Answer scam scenarios
5. Receive a score and certificate
6. See legitimate opportunity pathways
7. Optionally trigger a mock Ecobank API safety check

---

## Must-Have Features

### 1. Landing Page
- [ ] Explain the problem
- [ ] State the REWIRE thesis
- [ ] Show the Learn → Prove → Earn flow
- [ ] Include a clear CTA like “Start Learning”

### 2. Authentication
- [ ] Sign up page
- [ ] Login page
- [ ] Simple user profile

### 3. Learning Modules
- [ ] Module 1: Understanding Social Engineering
- [ ] Module 2: Recognizing Digital Scams
- [ ] Module 3: Protecting Yourself and Others
- [ ] Each module includes lesson content + quick quiz

### 4. Scenario Engine
- [ ] 5–10 realistic scam scenarios
- [ ] Multiple choice format
- [ ] Correct answer + explanation for every scenario
- [ ] Score update after each answer

### 5. Score + Certification
- [ ] Fraud prevention score calculation
- [ ] Example score like 87/100
- [ ] Certificate screen after threshold is reached
- [ ] Certificate includes user name and score

### 6. Opportunity Page
- [ ] Show safe digital roles or learning pathways
- [ ] Include trust and safety, digital safety, and fraud-awareness roles
- [ ] Show next-step CTA after certificate

### 7. AI Layer (Optional but Strong)
- [ ] Personalized learning path based on weak areas
- [ ] AI-generated explanation for wrong answers
- [ ] Scenario variations for repeated mistakes
- [ ] Keep explanations safe and non-operational

### 8. Ecobank API Demo Hook
- [ ] Simulated API call after certification
- [ ] Return user financial-safety signal or eligibility status
- [ ] Show a mock safe financial product or low-risk pathway
- [ ] Use wording that emphasizes risk-aware user evaluation, not just partnership

---

## Recommended Tech Stack

### Frontend
- [ ] React
- [ ] Vite
- [ ] Tailwind CSS
- [ ] React Router

### Backend
- [ ] Node.js
- [ ] Express.js
- [ ] REST API

### Database
- [ ] MongoDB or Supabase

### Authentication
- [ ] JWT or simple email/password auth

### AI
- [ ] LLM API for explanations or personalization

### Ecobank Demo Integration
- [ ] Mock API endpoint or adapter
- [ ] Example response: risk score, eligible product, or user profile signal

---

## Proposed Architecture

```text
Frontend (React + Tailwind)
    ↓
API Server (Node/Express)
    ↓
Database (MongoDB/Supabase)
    ↓
AI Layer (optional)
    ↓
Ecobank API adapter (demo integration)
    ↓
Learner skill profile + risk-safe financial recommendation
```

---

## Suggested Data Model

### User
- [ ] id
- [ ] name
- [ ] email
- [ ] level
- [ ] totalScore
- [ ] completedModules
- [ ] skillProfile
- [ ] certificate
- [ ] opportunities

### Skill Profile
- [ ] fraudAwareness
- [ ] socialEngineering
- [ ] digitalSafety
- [ ] scenarioAnalysis
- [ ] criticalThinking

### Scenario
- [ ] id
- [ ] title
- [ ] category
- [ ] context
- [ ] options
- [ ] correctAnswer
- [ ] explanation
- [ ] difficulty

### Assessment
- [ ] userId
- [ ] scenarioId
- [ ] selectedAnswer
- [ ] correct
- [ ] score
- [ ] timestamp

### Certificate
- [ ] userId
- [ ] certificateId
- [ ] score
- [ ] issueDate
- [ ] verificationUrl

---

## MVP Demo Flow

### Scene 1: Problem
- [ ] Show that digital fraud is also an opportunity problem
- [ ] Explain that young people need a safer path than scam-based earnings

### Scene 2: Learning
- [ ] Show a short lesson on social engineering or scam recognition

### Scene 3: Simulation
- [ ] Show a realistic scam message scenario
- [ ] Let user choose an answer

### Scene 4: Proof
- [ ] Show score and explanation
- [ ] Show certificate screen

### Scene 5: Safe Opportunity
- [ ] Show opportunities page or safe financial pathway
- [ ] Optional Ecobank-style product eligibility recommendation

---

## hackathon Day Plan

### Day 1
- [ ] Set up project
- [ ] Create landing page
- [ ] Set up auth
- [ ] Design data schema

### Day 2
- [ ] Create lesson modules
- [ ] Build scenario pages
- [ ] Add scoring logic
- [ ] Generate certificate

### Day 3
- [ ] Add opportunity page
- [ ] Add AI feedback
- [ ] Add Ecobank demo API workflow
- [ ] Polish UI for demo
- [ ] Test the full user journey end-to-end

---

## Success Criteria
The MVP is a success if it proves:
- [ ] A user can learn anti-fraud concepts
- [ ] A user can identify scam patterns in a scenario
- [ ] The platform gives a verified skill score
- [ ] A certificate is created
- [ ] The user sees a legitimate opportunity path
- [ ] There is a realistic Ecobank integration idea or API demo flow

---

## Final Pitch Statement
REWIRE turns fraud exposure into fraud prevention and opportunity by combining anti-fraud education, scenario-based assessment, AI personalization, and a financial technology layer that helps users move toward safer digital financial behavior.
