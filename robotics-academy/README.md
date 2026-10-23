# RoboAcademy — CodeShip Template Mode

A robotics academy management **front-end demo starter** tailored to a robotics education brief.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. Navigate between Overview, Students, Courses, and Projects.

## Included demo workflows
- Dashboard metrics calculated from the current browser data.
- Add, search, and remove student records with basic validation and duplicate-email prevention.
- Toggle enrollment on sample robotics courses.
- Add projects and update their Planning / In progress / Completed status.
- Persist demo records in browser localStorage.
- Responsive layout for desktop and mobile screens.

## Honest limitations
- This is a local front-end template fallback, **not AI-generated output**. It is selected by CodeShip when Amazon Bedrock is not configured.
- Sample records are clearly for demonstration. Data stays in the current browser and is not shared across users or devices.
- There is no server-side authentication, database, email delivery, authorization, audit logging, or real course enrollment service.
- Do not use real student personal information in this demo.

## Before production
Configure and test the server-side AI provider, replace browser storage with an authenticated backend and database, add role-based access controls, validate all inputs server-side, add tests and monitoring, review privacy obligations for student data, and verify the deployment workflow.

## QA checklist
- Add a student and search by name or email.
- Try adding the same email twice.
- Remove a student.
- Toggle a course enrollment.
- Add a project and change its status to Completed.
- Refresh the browser and confirm demo data persists locally.
- Test the layout at a narrow mobile viewport.