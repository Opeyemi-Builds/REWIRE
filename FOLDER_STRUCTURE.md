# REWIRE Project Folder Structure

```text
REWIRE/
├── README.md
├── LICENSE
├── MVP_CHECKLIST.md
├── FOLDER_STRUCTURE.md
├── .gitignore
├── package.json
├── .env.example
├── .vscode/
│   └── settings.json
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/
│   │       └── hero-illustration.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── assets/
│       │   └── logo.svg
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── ModuleCard.jsx
│       │   ├── ScenarioCard.jsx
│       │   ├── ScoreBadge.jsx
│       │   ├── CertificateCard.jsx
│       │   └── OpportunityCard.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ModulePage.jsx
│       │   ├── ScenarioPage.jsx
│       │   ├── ResultsPage.jsx
│       │   ├── CertificatePage.jsx
│       │   └── OpportunitiesPage.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useModules.js
│       │   └── useScenarios.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   ├── authService.js
│       │   ├── moduleService.js
│       │   ├── scenarioService.js
│       │   ├── certificateService.js
│       │   └── ecobankService.js
│       ├── data/
│       │   ├── modules.js
│       │   ├── scenarios.js
│       │   └── opportunities.js
│       ├── utils/
│       │   ├── scoreUtils.js
│       │   ├── certificateUtils.js
│       │   └── formatters.js
│       └── styles/
│           └── themes.css
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── app.js
│   ├── .env.example
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── moduleController.js
│   │   ├── scenarioController.js
│   │   ├── assessmentController.js
│   │   ├── certificateController.js
│   │   └── ecobankController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── scenarioRoutes.js
│   │   ├── assessmentRoutes.js
│   │   ├── certificateRoutes.js
│   │   └── ecobankRoutes.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Module.js
│   │   ├── Scenario.js
│   │   ├── Assessment.js
│   │   └── Certificate.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── scoringService.js
│   │   ├── certificateService.js
│   │   ├── aiService.js
│   │   └── ecobankService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   └── helpers.js
│   └── config/
│       └── db.js
├── ai/
│   ├── prompts/
│   │   ├── fraudTutorPrompt.js
│   │   └── scenarioGeneratorPrompt.js
│   ├── services/
│   │   └── aiFeedbackService.js
│   └── README.md
├── integrations/
│   └── ecobank/
│       ├── mockEcobankClient.js
│       ├── ecobankAdapter.js
│       └── README.md
├── scripts/
│   ├── seedModules.js
│   ├── seedScenarios.js
│   └── seedUsers.js
├── tests/
│   ├── frontend/
│   │   └── app.test.js
│   ├── backend/
│   │   ├── auth.test.js
│   │   ├── module.test.js
│   │   ├── scenario.test.js
│   │   └── certificate.test.js
│   └── e2e/
│       └── userFlow.test.js
├── docs/
│   ├── product-overview.md
│   ├── architecture.md
│   └── demo-script.md
└── README_TEMPLATE.md
```

## Notes
This is a practical hackathon-friendly structure that keeps frontend, backend, and app logic separated while still being compact enough to build quickly.

### Recommended MVP priority
Focus first on:
- frontend/
- backend/
- models/
- routes/
- services/
- integrations/ecobank/

The AI and more advanced expansions can be added after the core learning + scoring flow is working.
