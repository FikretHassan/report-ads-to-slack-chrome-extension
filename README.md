# Report Ads to Slack via Chrome Extension
**Credit: Sean Dillon: https://github.com/adentify/, getAdData.js gist by rdillmanCN: https://gist.github.com/rdillmanCN/**

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
- Includes very basic exclusion functionality to turn the injection feature off, under 'exclusionAdvertiserIds' within adtech.js


**Slack Webhook Creation**

From my limited understanding of Slack webhooks, what we are essentially doing is creating an 'app' within Slack, which acts as a bot. We add this 'app' into the channel we wish to send reports to, and within Slack can create a webhook URL for the purpose of sending messages via that 'app' into said channel

The way in which we do this is as follows:

- Create your slack channel
- Go to the 'My Apps' page on your slacks workspace account: https://api.slack.com/apps and click 'Create New App'
- Create from scratch, and fill your details in:

![image](https://user-images.githubusercontent.com/17550385/235267900-54edca90-15de-46b1-818a-95d9a06ccee6.png)
  

- Back in Slack, open your slack channel, click the name and 'integrations' in the modal that appears, and then 'Add an app':

![image](https://user-images.githubusercontent.com/17550385/235268072-d67d75ff-c4eb-47b8-bf0e-1b062c0a7183.png)

- Back in the api slack page, go into your app and then go to 'Incoming Webhooks':

![image](https://user-images.githubusercontent.com/17550385/235268190-b3d54787-3f71-4823-8049-079a458f4eaa.png)

- Here you can add your new webhook, choosing the channel you added your app to earlier on
- You can now copy this webhook URL, and replace '<SLACK WEBHOOK URL HERE>' in adtech.js with your URL
- You should now be good to go!

**Testing**

- Enable the extension and refresh the page once enabled
- You should begin to see 'Ad Feedback' under your adverts (so long as there is room for this to be injected, some cropping may occur on tightly placed adverts in which case you may need to configure the injection method in the 'adentifyDynamicAds' function):

![image](https://user-images.githubusercontent.com/17550385/235268448-f7db210a-41f6-44fb-a002-1ca1cc3a6b82.png)

- You can now interact with these buttons to open up a modal, which allows you to input your name, email and complaint:

![image](https://user-images.githubusercontent.com/17550385/235268515-c4169247-9f2c-4609-b48f-16f7f2025978.png)

- You can then send the report directly to your Slack channel!

![image](https://user-images.githubusercontent.com/17550385/235268555-4b826fe5-0bc0-42a6-9bf7-9f94d3dcb3cc.png)



You are now ready to modify the extension to your hearts content! Some notes showever:

- If you are going to submit your version to the extension store, rework the function that sends the data to send to a backend first, then you can safely use the webhook there without your users being able to see that URL
- You modify manifest.json and background.js to restrict the URLs the extension can run on
- There may be bugs, theres a couple I know about that I am intending to fix but this is more of a starting point than a finished product (if such a thing exists)
- I do not currently inject the feedback button, or collect data for any video elements that arent google publisher tag (such as IMA SDK ads)
- There is no Amazon TAM/UAM data collection, feel free to add it if you work with them!
- I've had to break the 'Ad Information Results' data up into chunks as sometimes the data is too big to send as one message


  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
