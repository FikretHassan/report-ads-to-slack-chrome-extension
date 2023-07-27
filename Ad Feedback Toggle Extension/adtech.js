function tmgLoadAdentify() {
    window.top.adentify = window.top.adentify || {};
    window.top.adentify.about = { // details about this version of the code
        version: '0.17',
        date: '27-07-2023',
        company: 'Telegraph Media Group',
        author: 'Fikret Hassan - fikret@telegraph.co.uk & Sean Dillon - sean@telegraph.co.uk',
        credit: 'Sean Dillon: https://github.com/adentify/, getAdData.js gist by rdillmanCN: https://gist.github.com/rdillmanCN/'
    };

    // Configuration object
    window.top.adentify.config = {
        enableGdprModule: true,
        enableCcpaModule: true,
        enablePrebidModule: true,
        enableAmazonModule: true,
        button: {
            exclusionAdvertiserIds: ['14636214'],
            exclusionRules: function(slot) {
                var exclusionPositions = slot.getOutOfPage();
                var exclusionAdvertiserIdsLogic = slot.getResponseInformation() && slot.getResponseInformation().advertiserId;
                return (exclusionPositions || (this.exclusionAdvertiserIds.includes(String(exclusionAdvertiserIdsLogic))));
            }
        }
    };

    // Initialize the logs array
    window.top.adentify.logMessages = [];

    window.top.adentify.log = function(message) {
        var timestamp = new Date().toISOString();
        this.logMessages.push(timestamp + ': ' + message);
    };

    window.top.adentify.logs = function() {
        return this.logMessages;
    };



    window.top.adentify.log('ADENTIFY.JS: Advert Feedback System Injected');
    window.top.googletag.cmd.push(function() {

        // gdpr module
        if (window.top.adentify.config.enableGdprModule && typeof window.top.__tcfapi !== "undefined") {
            // If the TCF API is available, use it to get GDPR data
            new Promise((resolve, reject) => {
                    window.top.__tcfapi('getTCData', 2, (tcdata, success) => {
                        if (success) {
                            resolve(tcdata);
                        } else {
                            reject(new Error('TCF API request unsuccessful'));
                        }
                    });
                })
                .then(tcdata => {
                    // Store GDPR data in adentify object
                    window.top.adentify.gdprData = tcdata;
                })
                .catch(error => {
                    // Handle errors with the TCF API call
                    window.top.adentify.gdprData = "TCF API ERROR: " + error.message;
                });
        } else {
            // If the TCF API is not available, or we've turned it off, empty gdprData out
            window.top.adentify.gdprData = {};
        }


        // ccpa module
        if (window.top.adentify.config.enableCcpaModule && typeof window.top.__uspapi !== "undefined") {
            // If the CCPA API is available, use it to get CCPA data
            new Promise((resolve, reject) => {
                    window.top.__uspapi('getUSPData', 1, (uspdata, success) => {
                        if (success && uspdata) {
                            resolve(uspdata);
                        } else {
                            reject(new Error('CCPA API request unsuccessful'));
                        }
                    });
                })
                .then(uspdata => {
                    // Store CCPA data in adentify object
                    window.top.adentify.ccpaData = uspdata;
                })
                .catch(error => {
                    // Handle errors with the CCPA API call
                    window.top.adentify.ccpaData = "CCPA API ERROR: " + error.message;
                });
        } else {
            // If the CCPA API is not available, or we've turned it off, empty ccpaData out
            window.top.adentify.ccpaData = {};
        }

        // prebid.js module
        if (window.top.adentify.config.enablePrebidModule && typeof window.top.pbjs !== "undefined") {
            window.top.adentify.getPrebidInfo = function() {
                window.top.adentify.pbjsData = window.top.adentify.pbjsData || {};

                // Check if getAdserverTargeting function exists
                if (typeof window.top.pbjs.getAdserverTargeting === "function") {
                    window.top.adentify.pbjsData.adServerTargeting = window.top.pbjs.getAdserverTargeting();
                } else {
                    window.top.adentify.pbjsData.adServerTargeting = "";
                }

                // Check if getEvents function exists
                if (typeof window.top.pbjs.getEvents === "function") {
                    window.top.adentify.pbjsData.events = window.top.pbjs.getEvents();
                } else {
                    window.top.adentify.pbjsData.events = [];
                }

                // Check if readConfig function exists
                if (typeof window.top.pbjs.readConfig === "function") {
                    window.top.adentify.pbjsData.config = window.top.pbjs.readConfig();
                } else {
                    window.top.adentify.pbjsData.config = {};
                }

                window.top.adentify.pbjsData.installedModules = window.top.pbjs.installedModules || "";
            };
        } else {
            window.top.adentify.getPrebidInfo = function() {};
            window.top.adentify.pbjsData = {};
        }

        // Amazon / APS module - I do not work with aps so this is experimental and may not work as intended whilst I test its functionality
        if (window.top.adentify.config.enableAmazonModule && typeof window.top.apstag !== "undefined") {
            window.top.adentify.getAmazonInfo = function() {
                window.top.adentify.amazonData = window.top.adentify.amazonData || {};

                // Check if fetchBids function exists
                if (typeof window.top.apstag.fetchBids === "function") {
                    var slots = window.top.googletag.pubads().getSlots().map(function(slot) {
                        return {
                            slotID: slot.getSlotElementId(),
                            slotName: slot.getAdUnitPath(),
                            sizes: slot.getSizes(window.innerWidth, window.innerHeight).map(function(size) {
                                if (size.getWidth && size.getHeight) {
                                    return [size.getWidth(), size.getHeight()];
                                } else {
                                    return [size[0], size[1]];
                                }
                            })
                        };
                    });

                    // Store the Amazon TAM / UAM targeting keys in the adentify object
                    window.top.apstag.fetchBids({
                        slots: slots
                    }, function(bids) {
                        window.top.adentify.amazonData.targetingKeys = bids.reduce(function(result, bid) {
                            result[bid.slotID] = bid.targeting;
                            return result;
                        }, {});

                        // Populate amazonData.slots with the slotIDs from the fetched bids
                        window.top.adentify.amazonData.slots = bids.map(function(bid) {
                            return bid.slotID;
                        });
                    });
                } else {
                    window.top.adentify.amazonData.slots = [];
                    window.top.adentify.amazonData.targetingKeys = {};
                }
            };
        } else {
            window.top.adentify.getAmazonInfo = function() {};
            window.top.adentify.amazonData = {};
        }

        // this inserts into the advert divs
        window.top.adentify.adentifyDynamicAds = function(div) {
            setTimeout(function() {
                if (!window.top.document.getElementById(div).querySelector('#report-button')) {
                    //console.info('ADTECH: report button doesnt exist for this div, injecting...');
                    appendContainer = document.createElement('div');
                    appendContainer.classList.add('report-button-class')
                    appendContainer.id = 'report-button';
                    appendContainer.style = 'width: max-content; margin-left: auto; margin-right: auto; cursor: pointer; padding-top:4px; background-color: inherit; margin-top: 0px; margin-bottom: 0px; font-family: "Telesans Text Regular", Arial, sans-serif; font-size: 11px; color: rgb(68, 68, 68); text-align: center;'
                    appendContainer.textContent = 'Ad Feedback ⓘ';
                    appendContainer.onclick = adFeedbackForm;
                    window.top.document.getElementById(div).append(appendContainer);
                    window.top.document.getElementById(div).style.height = 'auto';
                    window.top.document.getElementById(div).style.flexDirection = 'column';
                } else {
                    //console.info('ADTECH: already exists so im not going to insert another button');
                }
            }, 500);
        }

        // the modal itself
        function createAdentifyModal() {
            var div = window.top.document.createElement('div');
            div.innerHTML = '<div id="adentifyOpenModal" class="adentifyModalDialog"> \
            <div> \
              <a href="javascript:adentify.adentifyCloseModal();" title="Close" class="close"><div id="adentifyCloseButton">X</div></a> \
              <h2>Advertising Feedback</h2> \
              <form id="feedbackForm"> \
                <label for="name">Name:</label> \
                <input type="text" id="name" name="name" required><br><br> \
                <label for="email">Email:</label> \
                <input type="email" id="email" name="email" required><br><br> \
                <div class="advertIs"> \
                  <label>This advert is:</label><br> \
                  <label for="complaint1"><input type="checkbox" id="complaint1" name="commonComplaint" value="Broken"> Broken </label><br> \
                  <label for="complaint2"><input type="checkbox" id="complaint2" name="commonComplaint" value="Irrelevant"> Irrelevant </label><br> \
                  <label for="complaint3"><input type="checkbox" id="complaint3" name="commonComplaint" value="Shown too often"> Shown too often </label><br> \
                  <label for="complaint4"><input type="checkbox" id="complaint4" name="commonComplaint" value="Annoying"> Annoying </label><br> \
                </div> \
                <label for="complaint">Feedback:</label><br> \
                <textarea id="complaint" name="complaint" rows="4" cols="40" required></textarea><br><br> \
                <input type="submit" value="Submit"> \
              </form> \
            </div> \
          </div> \
          <style> \
            .adentifyModalDialog form .advertIs { \
              line-height: 0.5; \
            } \
            .adentifyModalDialog form .advertIs label { \
                display: block; \
                font-weight: bold; \
              } \
              \
              .adentifyModalDialog form .advertIs label input[type="checkbox"] { \
                margin-right: 5px; \
                vertical-align: middle; /* Align the checkboxes vertically */ \
              } \
              .adentifyModalDialog { \
                display: flex; \
                position: fixed; \
                font-family: "Helvetica Neue", sans-serif; \
                top: 0; \
                right: 0; \
                bottom: 0; \
                left: 0; \
                background: rgba(0, 0, 0, 0.8); \
                z-index: 999999999999; \
                align-items: center; \
                justify-content: center; \
                -webkit-transition: opacity 400ms ease-in; \
                -moz-transition: opacity 400ms ease-in; \
                transition: opacity 400ms ease-in; \
              } \
              .adentifyModalDialog:target { \
                opacity: 1; \
                pointer-events: auto; \
              } \
              .adentifyModalDialog > div { \
                width: 400px; \
                max-width: 90%; \
                position: relative; \
                margin: auto; \
                padding: 30px; \
                background: #fff; \
                border-radius: 10px; \
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25); \
              } \
              .adentifyModalDialog h2 { \
                font-size: 24px; \
                font-weight: bold; \
                margin: 0 0 15px; \
                text-align: center; \
              } \
              .adentifyModalDialog p { \
                font-size: 16px; \
                margin: 0 0 20px; \
                text-align: center; \
              } \
              .adentifyModalDialog form { \
                flex-direction: column; \
                align-items: center; \
                justify-content: center; \
              } \
              .adentifyModalDialog label { \
                font-size: 16px; \
                font-weight: bold; \
                margin: 0 0 5px; \
              } \
              .adentifyModalDialog input[type="text"], \
              .adentifyModalDialog input[type="email"], \
              .adentifyModalDialog textarea { \
                width: 100%; \
                max-width: 100%; \
                padding: 10px; \
                border: none; \
                border-radius: 5px; \
                font-size: 16px; \
                background-color: #F6F6F6; \
              } \
              .adentifyModalDialog textarea { \
                resize: none; \
                height: 100px; \
              } \
              .adentifyModalDialog input[type="submit"] { \
                width: 100%; \
                max-width: 100%; \
                padding: 10px 20px; \
                border: none; \
                border-radius: 5px; \
                background-color: #000; \
                color: #fff; \
                font-size: 16px; \
                font-weight: bold; \
                cursor: pointer; \
                transition: background-color 0.3s ease; \
              } \
              .adentifyModalDialog input[type="submit"]:hover { \
                background-color: #00b4d8; \
              } \
              </style>';
            //              
            //
            // rather than constantly reinserting a div, first check if it doesnt exist. If it does exist, its likely already been hidden in which case we just unhide it
            if (!window.top.document.getElementsByClassName('adentifyModalDialog')[0]) {
                window.top.document.body.appendChild(div);
            } else {
                // unhide the modal
                window.top.document.getElementsByClassName('adentifyModalDialog')[0].style.display = '';
            }
        }

        // hide the modal
        window.top.adentify.adentifyCloseModal = function() {
            window.top.document.getElementsByClassName('adentifyModalDialog')[0].style.display = 'none';
        }


        // now go through and insert the feedback button for every ad on slotRenderEnded
        window.top.googletag.pubads().addEventListener('slotRenderEnded',
            function(event) {
                var slot = event.slot;

                // get the latest prebid info for window.top.adentify.getPrebidInfo. Only do this if the prebid module is enabled
                if (window.top.adentify.config.enablePrebidModule && typeof window.top.pbjs !== "undefined") {
                    window.top.adentify.getPrebidInfo()
                }

                if (window.top.adentify.config.enableAmazonModule && typeof window.top.apstag !== "undefined") {
                    window.top.adentify.getAmazonInfo()
                }

                // get the latest GAM info for window.top.adentify.results
                getAllAdsData();

                // dont run this function if the report button is already there for this slot, as it means its already ran, or if anything in exclusionRules is met
                if ((!window.top.document.getElementById(slot.getSlotElementId()).querySelector('#report-button')) && !window.top.adentify.config.button.exclusionRules(slot)) {
                    window.top.adentify.adentifyDynamicAds(slot.getSlotElementId());
                    window.top.adentify.log('slotRenderEnded: Adding button to slot '+slot.getSlotElementId());
                }
            }
        );

        window.top.adentify.injectButtonsToAlreadyLoadedAdsRan = false; // Initialize the flag

        window.top.adentify.injectButtonsToAlreadyLoadedAds = function() {
            // Only run the function if it hasn't been run before
            if (!window.top.adentify.injectButtonsToAlreadyLoadedAdsRan) {
                window.top.adentify.log('ADENTIFY.JS: Adding button to slots loaded prior to adentify loading..')
                var slots = window.top.googletag.pubads().getSlots();
                slots.forEach(function(slot) {
                    var slotId = slot.getSlotElementId();
                    var slotElement = window.top.document.getElementById(slotId);

                    // get the latest prebid info for window.top.adentify.getPrebidInfo. Only do this if the prebid module is enabled
                    if (window.top.adentify.config.enablePrebidModule && typeof window.top.pbjs !== "undefined") {
                        window.top.adentify.getPrebidInfo()
                    }

                    if (window.top.adentify.config.enableAmazonModule && typeof window.top.apstag !== "undefined") {
                        window.top.adentify.getAmazonInfo()
                    }

                    // get the latest GAM info for window.top.adentify.results
                    getAllAdsData();

                    // Check if the slot has been rendered and doesn't have the 'button-added' class
                    if (slot.getResponseInformation() && !slotElement.querySelector('#report-button')) {
                        // Only add the button if the exclusions rules are not met
                        if (!window.top.adentify.config.button.exclusionRules(slot)) {
                            // Inject the button
                            window.top.adentify.adentifyDynamicAds(slotId);
                            window.top.adentify.log('injectButtonsToAlreadyLoadedAds: Adding button to slot '+slotId);
                        }
                    }
                });

                // Update the flag to indicate that the function has been run
                window.top.adentify.injectButtonsToAlreadyLoadedAdsRan = true;
            }
        };

        // Invoke the function at the end of the script or at any other appropriate point
        window.top.adentify.injectButtonsToAlreadyLoadedAds();



        // slightly modified version of rdillmanCN's gist to collect all page and slot level data for us.
        // rewritten to store refreshed ads under an element ID, eg adentify.results.slots.elementID.queryId for multiple entries
        // would previously overwrite the older advert data when a refresh came in for that elementId
        function getPageTargeting(page) {
            window.top.googletag.pubads().getTargetingKeys().forEach(function(keys) {
                page.pageTargeting[keys] = window.top.googletag.pubads().getTargeting(keys);
            });
        }

        // Get the data for a given ad slot
        function getSlotData(slot) {
            var result = {
                sizes: [],
                outOfPage: slot.getOutOfPage(),
                targeting: slot.getTargetingMap(),
                elementId: slot.getSlotElementId(),
                queries: {}
            };
            var data = slot.getResponseInformation();
            // Get ad data for the slot
            result.advertiserId = data && data.advertiserId || "";
            result.campaignId = data && data.campaignId || "";
            result.creativeId = data && data.creativeId || "";
            result.isBackfill = data && !!data.isBackfill;
            result.labelIds = data && data.labelIds || "";
            result.lineItemId = data && data.lineItemId || "";
            result.outOfPage = data && !!data.outOfPage;
            result.sourceAgnosticCreativeId = data && data.sourceAgnosticCreativeId || "";
            result.sourceAgnosticLineItemId = data && data.sourceAgnosticLineItemId || "";
            result.DFP = data && data.creativeId && "https://www.google.com/dfp/" + window.top.googletag.pubads().getSlots()[0].getAdUnitPath().match(/\/?(.*?)\//)[1] + "#delivery/CreativeDetail/creativeId=" + data.creativeId || "";
            // added a regexp to grab the GAM account ID better. Before we were expecting the format to be /GAM-ID/, but notice some sites use GAM-ID/ - this works on both
            // Get ad sizes for the slot
            slot.getSizes().forEach(function(size) {
                result.sizes.push(typeof size === 'object' ? size.getWidth() + "x" + size.getHeight() : size);
            });
            return result;
        }

        // get all the ads data on the page
        function getAllAdsData() {
            var page = {
                pageTargeting: {},
                slots: {}
            };
            // get page-level targeting data
            getPageTargeting(page);
            // loop through all the ad slots on the page
            window.top.googletag.pubads().getSlots().forEach(function(slot) {
                var slotId = slot.getSlotElementId();
                if (!page.slots[slotId]) {
                    page.slots[slotId] = {};
                }
                var queryId = slot.getEscapedQemQueryId() || "";
                // Add the ad data to the appropriate slot object and queryId
                page.slots[slotId][queryId] = getSlotData(slot);
            });

            //console.info('ADTECH adentify.js: All Ads Data', page);

            // if adentify.results doesn't exist yet, create it and set it to page
            if (!window.top.adentify.results) {
                window.top.adentify.results = page;
            } else {
                // Add any new ad information under the appropriate queryId
                var adResults = window.top.adentify.results;
                for (var slotId in page.slots) {
                    if (adResults.slots.hasOwnProperty(slotId)) {
                        for (var queryId in page.slots[slotId]) {
                            adResults.slots[slotId][queryId] = page.slots[slotId][queryId];
                        }
                    } else {
                        adResults.slots[slotId] = page.slots[slotId];
                    }
                }
            }
        }

        function adFeedbackForm() {
            getAllAdsData();
            createAdentifyModal();
            //console.info('ADTECH adentify.js: The div clicked on had ID: ' + this.parentNode.id);

            let latestFormData = null; // store the latest form data
            window.top.adentify.buttonInteraction = {} // namespace to work in for button interaction
            window.top.adentify.buttonInteraction.clickedDiv = this.parentNode.id;
            window.top.adentify.buttonInteraction.queryId = this.parentNode.getAttribute('data-google-query-id') || '';
            window.top.adentify.buttonInteraction.clickedDivAndQueryId = window.top.adentify.buttonInteraction.clickedDiv + '--' + window.top.adentify.buttonInteraction.queryId; //lets define the clickedDiv as soon as the modal is opened, and use that to send the data. 
            //This fixes an issue where if the ad slot refreshed by the time you sent the report, we still have the right div ID to send instead of an error thrown.
            //We've now added the queryId as part of this for ads that refresh, whilst still keeping all of the ads in question in the report sent incase this is useful
            const initFormListeners = () => {
                const feedbackForm = window.top.document.getElementById("feedbackForm");

                const submitForm = (event) => {
                    event.preventDefault();

                    const formData = new FormData(feedbackForm);
                    const name = formData.get("name");
                    const email = formData.get("email");
                    const complaint = formData.get("complaint");
                    let defaultCommonComplaints = ["None"];
                    let commonComplaints = [];

                    // Get the selected common complaints
                    const selectedCommonComplaints = formData.getAll("commonComplaint");
                    if (selectedCommonComplaints.length > 0) {
                        commonComplaints = selectedCommonComplaints.join(", ");
                    } else {
                        commonComplaints = defaultCommonComplaints;
                    }

                    if (!name || !email || !complaint) {
                        //console.info("Please fill in all fields");
                        return;
                    }

                    const data = {
                        Name: name,
                        Email: email,
                        Complaint: complaint,
                        CommonComplaints: commonComplaints,
                        Adentify: window.top.adentify.results.slots ? JSON.stringify(window.top.adentify.results.slots[window.top.adentify.buttonInteraction.clickedDiv], null, 2) : "N/A",
                        //DivIdQueryId: window.top.adentify.clickedDivAndQueryId ? JSON.stringify(window.top.adentify.clickedDivAndQueryId) : "N/A", // add the ID and queryId of the parent element of the button that was clicked
                        Timestamp: new Date().toISOString(), // add a timestamp for the current entry
                        URL: window.top.location.href,
                        QueryIdURL: 'https://admanager.google.com/' + window.top.googletag.pubads().getSlots()[0].getAdUnitPath().match(/\/?(.*?)\//)[1] + '#troubleshooting/screenshot/query_id=' + window.top.adentify.buttonInteraction.queryId
                    };

                    window.top.adentify.log("Submitting data:", data);

                    // Store the latest form data
                    latestFormData = data;

                    // Send the latest feedback
                    sendFeedback();

                    // Clear the form and remove the event listener
                    feedbackForm.reset();
                    feedbackForm.removeEventListener("submit", submitForm);
                    window.top.removeEventListener("beforeunload", sendFeedback);

                    //close the modal now
                    window.top.adentify.adentifyCloseModal();

                };

                if (feedbackForm) {
                    feedbackForm.addEventListener("submit", submitForm, {
                        once: true
                    });

                    const closeButton = window.top.document.getElementById("adentifyCloseButton");
                    closeButton.addEventListener("click", () => {
                        feedbackForm.reset();
                        feedbackForm.removeEventListener("submit", submitForm);
                    });
                }
            };

            const sendFeedback = () => {
                if (!latestFormData) {
                    return;
                }

                window.top.adentify.log("Sending feedback:", latestFormData);

                const adentifyResults = JSON.stringify(window.top.adentify.results.slots[window.top.adentify.buttonInteraction.clickedDiv][window.top.adentify.buttonInteraction.queryId], null, 4);
                const adentifyMaxLength = 4000; // maximum length of a message attachment field in Slack
                const adentifyChunks = []; // array to store the Adentify data chunks

                // Split the Adentify data into chunks based on the maximum message size
                for (let i = 0; i < adentifyResults.length; i += adentifyMaxLength) {
                    adentifyChunks.push(adentifyResults.substring(i, i + adentifyMaxLength));
                }

                // Create an attachment for each chunk of Adentify data
                const adentifyAttachment = latestFormData.Adentify !== "N/A" ? adentifyChunks.map((chunk, index) => {
                    return {
                        "fallback": `Ad Information Results (${index + 1} of ${adentifyChunks.length})`,
                        "color": "#36a64f",
                        "title": `Ad Information Results (${index + 1} of ${adentifyChunks.length})`,
                        "text": "```\n" + chunk + "\n```"
                    };
                }) : [];

                // Send data to a Slack webhook for the latest form data
                const endpointUrl = "<SLACK WEBHOOK URL HERE>";
                const message = {
                    "text": "*New Feedback:*",
                    "attachments": [{
                            "color": "#3AA3E3",
                            "fields": [{
                                    "title": "Name",
                                    "value": latestFormData.Name,
                                    "short": true
                                },
                                {
                                    "title": "Email",
                                    "value": latestFormData.Email,
                                    "short": true
                                },
                                {
                                    "title": "Complaint",
                                    "value": latestFormData.Complaint
                                },
                                {
                                    "title": "Options Selected",
                                    "value": Array.isArray(latestFormData.CommonComplaints) ? latestFormData.CommonComplaints.join(", ") : latestFormData.CommonComplaints
                                }

                            ]
                        },
                        ...adentifyAttachment,
                        {
                            "color": "#36a64f",
                            "fields": [{
                                    "title": "Timestamp",
                                    "value": latestFormData.Timestamp
                                },
                                {
                                    "title": "URL",
                                    "value": latestFormData.URL
                                },
                                {
                                    "title": "Query ID Inspector",
                                    "value": latestFormData.QueryIdURL
                                }
                            ]
                        }
                    ]
                };

                // Check that all fields are filled in before sending the data to Slack
                if (Object.values(latestFormData).every(value => Boolean(value))) {
                    fetch(endpointUrl, {
                            method: "POST",
                            headers: {
                                //"Content-Type": "application/json"
                            },
                            body: JSON.stringify(message)
                        })
                        .then(response => response.json())
                        .then(data => {
                            //console.info("Response:", data);
                            // Clear the latest form data
                            latestFormData = null;

                        })
                        .catch(error => console.info("Error:", error));
                } else {
                    //console.info("Please fill in all fields");
                }
            };

            initFormListeners();

            // Send feedback when the page is about to be unloaded
            window.top.addEventListener("beforeunload", sendFeedback);

        }

    })
}
(function isAdentifyReady(useMaxAttempts) {
    // this allows us to attempt to inject the script once googletag is ready for a maximum number of times (default to 5 seconds @ 250ms checks) or just tick over forever (or until googletag is ready)    
    if (useMaxAttempts) {
        var maxAttempts = 20; // Maximum number of attempts
        var attempts = 0; // Counter variable for attempts

        function checkAdentify() {
            if (window.top.googletag && window.top.googletag.pubadsReady) {
                tmgLoadAdentify();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkAdentify, 250);
            } else {
                adentify.log("ADENTIFY: Maximum attempts to inject Ads Feedback script reached. Googletag is not ready.");
            }
        }

        checkAdentify();
    } else {
        function checkAdentify() {
            if (window.top.googletag && window.top.googletag.pubadsReady) {
                tmgLoadAdentify();
            } else {
                setTimeout(checkAdentify, 250);
            }
        }

        checkAdentify();
    }
})(true); // Pass true or false to enable/disable the maximum attempts setup  