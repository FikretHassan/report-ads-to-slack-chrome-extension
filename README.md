# Report Ads to Slack via Chrome Extension
Chrome Extension tool to enable Advert Feedback buttons for your Google Publisher Tag adverts. Useful internal tool for non technical stakeholders and employees to send technical information about a problematic advert to a Slack channel of your choice.

Simply add a slack App to your Slack Channel of choice, and update adtech.js to use that channels webhook URL (replacing <SLACK WEBHOOK URL HERE> with your URL) and you are good to go.

Slack webhooks contain secret keys, so if you wish to use this as a user facing product you should rewrite the sendFeedback function to send your data to a backend first, which then handles sending to Slack. This is simply a template for capturing user inputted complaint data, along with gdpr, ccpa, and google publisher tag information about ads on the page.

**Installation**

To locally install the Chrome Extension, simply:
- Navigate to chrome://extensions/ 
- Enable Developer Mode (top right)
- Load unpacked (top left)
- Navigate to the 'Ad Feedback Toggle Extension' you have downloaded

This should now have installed and enabled your extension!

![image](https://user-images.githubusercontent.com/17550385/235263235-4747391d-c6db-413d-baba-faa1f0cff3df.png)



You should also be able to click 'details' to go into the extension in order to enable it when in incognito mode:


![image](https://user-images.githubusercontent.com/17550385/235263439-b1ef7cc4-778f-4688-b6a2-b94585808737.png)


You should also be able to pin the extension to access it quicker:


![image](https://user-images.githubusercontent.com/17550385/235263669-225099f6-1aeb-46ea-bc70-c4498147e08f.png)



**Extension Configuration**

The extension has a few files specific to the extension itself, the main being the manifest.json, which you can edit to configure the name of the extension and URLs you wish to limit the extension to. Popup.html is useful for styling the popup that shows up when you click on the extension icon itself.

adtech.js is what is executed when you turn the toggle on. As is, it does the following:

- Gathering google publisher tag information about ads on page, page level targeting and individual slot level targeting
- Gathering GDPR, CCPA and prebid information if available
- Stores all of this information in an object 'adentify'
- Keeps track of 'old' data in refreshing adunits by storing them in the format 'adentify.results.slots.queryId'
- Creates a modal if a user interacts with the 'Ad Feedback button', and awaits user input for the three fields 'Name', 'email' and 'Complaint'
- Sends the data to a slack channel via a webhook URL (currently left blank in adtech.js, simply replace with your webhook URL)


**Slack Webhook Creation**

From my limited understanding of Slack webhooks, what we are essentially doing is creating an 'app' within Slack, which acts as a bot. We add this 'app' into the channel we wish to send reports to, and within Slack can create a webhook URL for the purpose of sending messages via that 'app' into said channel

The way in which we do this is as follows:

- Create your slack channel
- Go to the 'My Apps' page on your slacks workspace account: https://api.slack.com/apps and click 'Create New App'
