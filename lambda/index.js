// CodeShip Alexa+ Builder — honest prototype: plan generation only unless Bedrock is configured.
const Alexa = require('ask-sdk-core');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const region = process.env.AWS_REGION || 'us-east-1';
const bedrock = new BedrockRuntimeClient({ region });
const modelId = process.env.BEDROCK_MODEL_ID || '';

function fallbackPlan(projectType) {
  return {
    stack: 'Suggested web stack (demo)',
    description: `Starter plan for ${projectType}`,
    tasks: [
      'Define user roles and core workflows',
      'Design responsive application screens',
      'Implement API and data model',
      'Add validation, security, and tests',
      'Deploy after repository and hosting are connected'
    ],
    files: ['README.md', 'package.json', 'src/App.jsx', 'src/styles.css', 'server/index.js', 'server/routes/api.js']
  };
}

async function callBedrock(projectType) {
  if (!modelId) return { ...fallbackPlan(projectType), mode: 'demo-fallback' };
  const prompt = `You are CodeShip, a careful software planning assistant. Create a concise plan for this app: ${projectType}.
Return only valid JSON with fields stack (string), description (string), tasks (array of 5 strings), files (array of 6-10 suggested paths). Do not claim files were created, pushed, or deployed.`;
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1200,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }]
  };
  const response = await bedrock.send(new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body)
  }));
  const decoded = JSON.parse(new TextDecoder().decode(response.body));
  const answer = decoded.content?.[0]?.text || '';
  const match = answer.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Bedrock response did not contain a JSON plan.');
  const plan = JSON.parse(match[0]);
  return { ...plan, mode: 'bedrock' };
}

const LaunchRequestHandler = {
  canHandle(input) { return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest'; },
  handle(input) {
    const speak = 'Welcome to CodeShip Builder. Tell me what web app to plan, for example, build hostel management system.';
    return input.responseBuilder.speak(speak).reprompt(speak).getResponse();
  }
};

const BuildAppIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'BuildAppIntent';
  },
  async handle(input) {
    const projectType = (Alexa.getSlotValue(input.requestEnvelope, 'projectType') || 'a web app').slice(0, 180);
    const plan = await callBedrock(projectType);
    const attrs = input.attributesManager.getSessionAttributes();
    attrs.lastProject = projectType;
    attrs.lastPlan = plan;
    input.attributesManager.setSessionAttributes(attrs);
    const modeMessage = plan.mode === 'bedrock'
      ? 'Amazon Bedrock generated the project plan.'
      : 'I returned a demo plan because Bedrock model access is not configured yet.';
    const speak = `Here is a plan for ${projectType}. Suggested stack: ${plan.stack}. First steps: ${plan.tasks.slice(0, 3).join(', ')}. ${modeMessage} I have not created a GitHub repository or deployed an app yet.`;
    return input.responseBuilder
      .speak(speak)
      .withSimpleCard(`CodeShip plan: ${projectType}`, JSON.stringify(plan, null, 2))
      .getResponse();
  }
};

const DeployIntentHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'DeployIntent';
  },
  handle(input) {
    const attrs = input.attributesManager.getSessionAttributes();
    const project = attrs.lastProject || 'your app';
    const speak = `The deployment integration is not connected yet, so I cannot truthfully provide a live repository or deployment link for ${project}. Connect GitHub and Vercel API credentials in the backend to enable publishing.`;
    return input.responseBuilder.speak(speak).withSimpleCard('Deployment not connected', speak).getResponse();
  }
};

const HelpHandler = {
  canHandle(input) { return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' && Alexa.getIntentName(input.requestEnvelope) === 'AMAZON.HelpIntent'; },
  handle(input) {
    const speak = 'Say build hostel management system, or build expense tracker. I can return a project plan. Actual deployment needs GitHub and Vercel integration.';
    return input.responseBuilder.speak(speak).reprompt(speak).getResponse();
  }
};
const CancelAndStopHandler = {
  canHandle(input) {
    return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      ['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(Alexa.getIntentName(input.requestEnvelope));
  },
  handle(input) { return input.responseBuilder.speak('Happy building with CodeShip.').getResponse(); }
};
const ErrorHandler = {
  canHandle() { return true; },
  handle(input, error) {
    console.error('CodeShip skill error:', error);
    return input.responseBuilder.speak('Sorry, I could not build that plan. Please try a shorter app description.').reprompt('What app would you like to plan?').getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, BuildAppIntentHandler, DeployIntentHandler, HelpHandler, CancelAndStopHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda();
