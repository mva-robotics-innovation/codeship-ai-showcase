# CodeShip Alexa+ — Voice-to-Web-App Builder

**Tracks:** Alexa+ (primary) · AWS Builder (Amazon Bedrock) · Open Source

CodeShip is a voice-first app-builder prototype. An Alexa custom skill recognizes a spoken app idea and returns a structured project plan. When configured with AWS credentials and an enabled Bedrock model, the Lambda handler calls Bedrock. Without configuration it returns a clearly labelled demo fallback.

## Repository layout

- `index.html` — public project landing page
- `frontend-dashboard/index.html` — project dashboard and voice demo script
- `skill-package/skill.json` — Alexa skill manifest (replace the placeholder Lambda ARN)
- `skill-package/interactionModels/custom/en-US.json` — voice intents
- `lambda/index.js` — Alexa handlers and optional Bedrock call
- `robotics-academy/` — generated front-end demo app
- `demo-script.md` — suggested presentation script

## Voice demo phrases

1. “Alexa, open Code Ship.”
2. “Build hostel management system.”
3. “Deploy it.”

The build intent returns a project plan. The deploy intent currently explains that publishing is not connected. It does **not** invent repository or deployment URLs.

## Configure the Alexa skill

1. In the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), create a Custom skill named **CodeShip Builder**, English (US).
2. In the skill's JSON Editor, import `skill-package/interactionModels/custom/en-US.json`.
3. Create an AWS Lambda function in `us-east-1` using Node.js 20.x, upload the contents of the `lambda` folder (include dependencies installed by `npm install`), and set handler to `index.handler`.
4. Add an execution role with CloudWatch Logs permissions. To enable Bedrock, add the required Bedrock invoke permission and set `BEDROCK_MODEL_ID` to a model enabled for your AWS account/region. Model access, availability, and pricing are controlled by AWS.
5. Copy the Lambda ARN into `skill-package/skill.json` in place of `YOUR_AWS_ACCOUNT_ID`, and configure that ARN as the skill endpoint in the console.
6. Paste the skill manifest settings into the developer console, save, and test the skill in the Test tab.
7. If using a Lambda endpoint for Alexa, ensure the Alexa Skills Kit trigger is configured and the correct skill ID is allowed.

## Deploy landing page to Vercel

This repository includes a static `index.html` and `vercel.json`. Import the repository into Vercel with framework preset **Other**, no build command, and the repository root as output.

## Current limitations (important)

- Alexa voice operation only works after the skill is created, connected to the Lambda endpoint, and enabled in the Alexa Developer Console.
- Bedrock planning requires valid AWS credentials, region, and model access. Without those, the handler returns a demo fallback.
- GitHub repository creation and Vercel deployment are **not implemented yet**. The current deploy intent explicitly says this instead of claiming fake links.
- The Robotics Academy is a front-end demonstration with browser-local storage; it is not a production backend.
- Never commit AWS access keys, GitHub tokens, or Vercel tokens to this repository. Use Lambda environment variables and IAM roles / a secrets manager.

## Demo

See `demo-script.md` for a 2–3 minute walkthrough.

Built for Amazon Developer Hackathon 2026.
