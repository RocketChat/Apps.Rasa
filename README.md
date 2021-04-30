# Apps.Rasa
Integration between Rocket.Chat and the RASA Chatbot platform

### Some Important Concepts of App.Rasa

 This app can operate in 2 modes:

 1. Synchronous mode
    
    In synchronous mode, the app will make use of Rasa's REST API to exchange message. The app will make use of Rasa's [RESTInput](https://rasa.com/docs/rasa/user-guide/connectors/your-own-website/#restinput) channel.
    
    If you are using this mode, make your you have enabled rest api in `credentials.yml` in your rasa bot. More info about it [here](https://rasa.com/docs/rasa/user-guide/connectors/your-own-website/#restinput)

 2. Asynchronous / Callback Mode
    
    In asynchronous mode, the app will make use of callbacks to receive messages from Rasa. The app will make use of Rasa's [CallbackInput](https://rasa.com/docs/rasa/user-guide/connectors/your-own-website/#callbackinput) channel.

    Note that if you are using [`Reminders and External events`](https://rasa.com/docs/rasa/core/reminders-and-external-events/#reminders-and-external-events) in your Rasa Chatbot, then you will find this mode useful, as these features are only work in this mode.

    If you are using this mode, you will have to make following configuration to Rasa

    1. You need to supply a `credentials.yml` with the following content:

        ```
        callback:
        url: "http://localhost:3000/api/apps/public/646b8e7d-f1e1-419e-9478-10d0f5bc74d9/callback"
    	```
    	> You can find the correct url in the App Details page, under API section.


### Installation steps:

#### Option 1
    Download directly from Rocket.Chat marketplace

#### Option 2 (Manual Install)

 1. Clone this repo and Change Directory: </br>
 `git clone https://github.com/RocketChat/Apps.Rasa.git && cd Apps.Rasa/`
 
 2. Install the required packages from `package.json`: </br>
	 `npm install`

 3. Deploy Rocket.Chat app: </br>
    `rc-apps deploy --url http://localhost:3000 --username user_username --password user_password`
    Where:
    - `http://localhost:3000` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `user_username` is the username of your admin user.
    - `user_password` is the password of your admin user.
    
    For more info refer [this](https://rocket.chat/docs/developer-guides/developing-apps/getting-started/) guide


### Rocket.Chat Apps Setup

1. First go ahead n create a Bot User. Login as administrator, then goto `Setting > Users`. There create a new Bot User. This new user should have these 2 roles.</br>
    1. bot
    2. livechat-agent

2. Then configure the app to automatically assign a livechat-visitor to this bot. To do so, goto `Setting > Livechat > Routing` or `Setting > Omnichannel > Routing`. There enable `Assign new conversations to bot agent` Setting.

3. The app needs some configurations to work, so to setup the app Go to `Setting > Apps > Rasa`. There, fill all the necessary fields in `SETTINGS` and click SAVE. Note all fields are required. 
    
    Some of the fields in `SETTING` include
    1. Bot Username (required)
        - This should contain the same bot username which we created above in Step 1
    2. Rasa Server Url (required)
        - URL for the Rasa Server goes here. Eg:- `http://localhost:5005`
    3. Service Unavailable Message (optional)
        - The Bot will send this message to Visitor if service is unavailable like suppose if no agents are online.
    4. Close Chat Message (optional)
        - This message will be sent automatically when a chat is closed
    5. Handover Message (optional)
        - The Bot will send this message to Visitor upon handover
    6. Default Handover Department Name (required)
        - Enter the target department name where you want to transfer the visitor upon handover. Note that you can override setting using [Handover](./docs/api-endpoints/perform-handover.md) action.
    7. Enable Callbacks
        - Enabling this setting will allow the app to use only callback messages. This feature is   useful when you are using Reminder messages in your RASA bot.
    8. Hide Quick Replies (required)
        - If enabled, then all quick-replies will hide when a visitor clicks on any one of them

### Apps.Rasa's API

The app provides API to trigger specific actions. The URL for the API can be found on the Apps Page(`Setting > Apps > Rasa`). Currently the app provides 2 APIs.

1. Incoming API/Endpoint

    This endpoint can be used to trigger specific actions. The list of supported actions include
    1. **Close Chat**<br/>
        To close a chat
        - REST API Documentation for this endpoint can be found [here](./docs/api-endpoints/close-chat.md)
    2. **Handover**<br/>
        To perform a handover
        - REST API Documentation for this endpoint can be found [here](./docs/api-endpoints/perform-handover.md)

2. Callback API/Endpoint
    
    This Endpoint is needed when the App runs in `Asynchronous / Callback Mode` mode. You will have to copy this url to `credentials.yml` file.



### Adding Quick Replies support to your Rasa Bot

- Rasa App provides out of the box support for quick replies. To add quick-replies, you can follow the structure defined in Rasa [here](https://rasa.com/docs/rasa/core/domains/#images-and-buttons)
