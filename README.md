# Report Ads to Slack via Chrome Extension
Chrome Extension tool to enable Advert Feedback buttons for your Google Publisher Tag adverts. Useful internal tool for non technical stakeholders and employees to send technical information about a problematic advert to a Slack channel of your choice.

Simply add a slack App to your Slack Channel of choice, and update adtech.js to use that channels webhook URL (replacing <SLACK WEBHOOK URL HERE> with your URL) and you are good to go.

Slack webhooks contain secret keys, so if you wish to use this as a user facing product you should rewrite the sendFeedback function to send your data to a backend first, which then handles sending to Slack. This is simply a template for capturing user inputted complaint data, along with gdpr, ccpa, and google publisher tag information about ads on the page.
