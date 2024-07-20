
# Asana Webhook Integration with Node.js

This guide will help you set up a webhook in Asana to monitor changes to your project using Node.js. We will retrieve the project `gid` and create a webhook.

## Prerequisites

- Asana account
- Personal Access Token from Asana
- Ngrok setup for receiving webhooks
- Postman installed

## Steps

### 1. Clone the Repository

First, clone the repository which contains the necessary code for setting up the webhook.

```bash
git clone https://github.com/Harshsharma836/POC/tree/main/Asana_Webhook_Integration_Nodejs
```

### 2. Install Dependencies

Navigate to the cloned directory and install the necessary dependencies.

```bash
cd Asana_Webhook_Integration_Nodejs
npm install
```

### 3. Run Ngrok

Install Ngrok if you haven't already and run it to expose your local server to the internet. Ensure your Node.js project is running on port 8080.

```bash
ngrok http 8080
```

Take note of the generated `ngrok` URL (e.g., `https://081e-111-118-241-68.ngrok-free.app`).

### 4. Get the Project `gid`

Next, you'll need to retrieve the `gid` (globally unique identifier) for your project from Asana.

**Endpoint:** `https://app.asana.com/api/1.0/projects`

**Method:** GET

**Headers:**
- **Authorization:** `Bearer YOUR_PERSONAL_ACCESS_TOKEN`

**Instructions:**
1. Open Postman and create a new GET request.
2. Enter the URL: `https://app.asana.com/api/1.0/projects`.
3. Go to the **Headers** tab and add the following header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_PERSONAL_ACCESS_TOKEN`
4. Click **Send**.
5. In the response, look for the `gid` in the project details.

### 5. Set Up the Webhook

Once you have the `gid` of your project, you can set up a webhook to monitor changes.

**Endpoint:** `https://app.asana.com/api/1.0/webhooks`

**Method:** POST

**Headers:**
- **Authorization:** `Bearer YOUR_PERSONAL_ACCESS_TOKEN`
- **Content-Type:** `application/json`

**Body:**
```json
{
  "data": {
    "resource": "1207683669065528", // replace with your project gid
    "target": "https://081e-111-118-241-68.ngrok-free.app/receiveWebhook", // your ngrok URL
    "filters": [
      {
        "resource_type": "project",
        "action": "changed",
        "fields": ["name", "due_on", "notes", "assignee"]
      }
    ]
  }
}
```

**Instructions:**
1. Open Postman and create a new POST request.
2. Enter the URL: `https://app.asana.com/api/1.0/webhooks`.
3. Go to the **Headers** tab and add the following headers:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_PERSONAL_ACCESS_TOKEN`
   - **Key:** `Content-Type`
   - **Value:** `application/json`
4. Go to the **Body** tab, select **raw** and choose **JSON** from the dropdown.
5. Paste the following JSON, replacing the placeholder values with your actual project `gid` and ngrok URL:
   ```json
   {
     "data": {
       "resource": "1207683669065528", // replace with your project gid
       "target": "https://081e-111-118-241-68.ngrok-free.app/receiveWebhook", // your ngrok URL
       "filters": [
         {
           "resource_type": "project",
           "action": "changed",
           "fields": ["name", "due_on", "notes", "assignee"]
         }
       ]
     }
   }
   ```
6. Click **Send**.

## Notes

- Replace `YOUR_PERSONAL_ACCESS_TOKEN` with your actual Asana Personal Access Token.
- Ensure your Node.js project is running on port 8080 and your `ngrok` URL (`https://081e-111-118-241-68.ngrok-free.app/receiveWebhook`) is correct and accessible.

By following these steps, you will be able to set up a webhook in Asana to monitor your project's updates and receive notifications when changes occur.

If you face any issue please contact: harshsharma1421@gmail.com







