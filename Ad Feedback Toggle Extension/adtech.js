function tmgLoadAdentify() {
    console.info('ADTECH: Advert Feedback System Injected')
    window.top.googletag.cmd.push(function() {
        window.top.adentify = window.top.adentify || {};
        window.top.adentify.about = { // deatils about this version of the code
            version: '0.1',
            date: '05-04-2023',
            company: 'Telegraph Media Group',
            author: 'Fikret Hassan - fikret@telegraph.co.uk & Sean Dillon - sean@telegraph.co.uk',
            credit: 'Sean Dillon: https://github.com/adentify/, getAdData.js gist by rdillmanCN: https://gist.github.com/rdillmanCN/'
        };

        // gdpr module
        if (typeof window.top.__tcfapi !== "undefined") {
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
            // If the TCF API is not available, set gdprData to a string indicating this
            window.top.adentify.gdprData = "NO GDPR API AVAILABLE";
        }


        // ccpa module
        if (typeof window.__uspapi !== "undefined") {
            // If the CCPA API is available, use it to get CCPA data
            new Promise((resolve, reject) => {
                    window.__uspapi('getUSPData', 1, (uspdata, success) => {
                        if (success && uspdata) {
                            resolve(uspdata);
                        } else {
                            reject(new Error('CCPA API request unsuccessful'));
                        }
                    });
                })
                .then(uspdata => {
                    // Store CCPA data in adentify object
                    window.adentify.ccpaData = uspdata;
                })
                .catch(error => {
                    // Handle errors with the CCPA API call
                    window.adentify.ccpaData = "CCPA API ERROR: " + error.message;
                });
        } else {
            // If the CCPA API is not available, set ccpaData to a string indicating this
            window.adentify.ccpaData = "NO CCPA API AVAILABLE";
        }

        // prebid.js module
        if (typeof window.top.pbjs !== "undefined") {
            window.top.adentify.getPrebidInfo = function() {
                window.top.adentify.pbjsData = window.top.adentify.pbjsData || {};
                window.top.adentify.pbjsData.adServerTargeting = window.top.pbjs.getAdserverTargeting() || "";
                window.top.adentify.pbjsData.installedModules = window.top.pbjs.installedModules || "";
                window.top.adentify.pbjsData.events = window.top.pbjs.getEvents();
                window.top.adentify.pbjsData.config = window.top.pbjs.readConfig();
            }
        } else {
            window.top.adentify.getPrebidInfo = function() {};
            window.top.adentify.pbjsData = "NO PBJS DATA AVAILABLE";
        }

        // this inserts into the advert divs
        function adentifyDynamicAds(div) {
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
                  <p>Please provide your feedback below:</p> \
                  <form id="feedbackForm"> \
                    <label for="name">Name:</label> \
                    <input type="text" id="name" name="name" required><br><br> \
                    <label for="email">Email:</label> \
                    <input type="email" id="email" name="email" required><br><br> \
                    <label for="complaint">Complaint:</label><br> \
                    <textarea id="complaint" name="complaint" rows="4" cols="40" required></textarea><br><br> \
                    <input type="submit" value="Submit"> \
                  </form> \
                </div> \
              </div> \
              <style> \
              .adentifyModalDialog { \
                position: fixed; \
                font-family: "Helvetica Neue", sans-serif; \
                top: 0; \
                right: 0; \
                bottom: 0; \
                left: 0; \
                background: rgba(0, 0, 0, 0.8); \
                z-index: 999999999999; \
                display: flex; \
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
                display: flex; \
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
                margin: 0 0 20px; \
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
                //console.group(
                //    'ADTECH adentify.js: Slot', slot.getSlotElementId(), 'finished rendering.');
                //console.groupEnd();

                exclusionPositions = (slot.getOutOfPage());
                exclusionAdvertiserIds = ['14636214'];
                exclusionAdvertiserIdsLogic = slot.getResponseInformation() && slot.getResponseInformation().advertiserId;
                exclusionRules = ((exclusionPositions) || (exclusionAdvertiserIdsLogic == exclusionAdvertiserIds)); // we don't want to add the button to any out of page <- this should be expanded substantially to possibly support specific advertisers too (like Admin)
                //console.info(slot.getSlotElementId()+' is the slot ID, should I add the button? '+exclusionRules) // just some debugging to help ascertain the exclusionRules logic is correct
                //console.info(slot.getEscapedQemQueryId());
                //console.info('ADTECH adentify.js: Exclusion rule results: ' + exclusionRules);

                // get the latest prebid info for window.top.adentify.getPrebidInfo
                window.top.adentify.getPrebidInfo()

                // get the latest GAM info for window.top.adentify.results
                getAllAdsData();

                // dont run this function if the report button is already there for this slot, as it means its already ran, or if anything in exclusionRules is met
                if ((!window.top.document.getElementById(slot.getSlotElementId()).querySelector('#report-button')) && !exclusionRules) {
                    adentifyDynamicAds(slot.getSlotElementId());
                }
            }
        );



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
            result.DFP = data && data.creativeId && "https://www.google.com/dfp/" + googletag.pubads().getSlots()[0].getAdUnitPath().split('/')[1] + "#delivery/CreativeDetail/creativeId=" + data.creativeId || "";
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

            const initFormListeners = () => {
                const feedbackForm = document.getElementById("feedbackForm");

                const submitForm = (event) => {
                    event.preventDefault();

                    const formData = new FormData(feedbackForm);
                    const name = formData.get("name");
                    const email = formData.get("email");
                    const complaint = formData.get("complaint");

                    if (!name || !email || !complaint) {
                        //console.info("Please fill in all fields");
                        return;
                    }

                    const data = {
                        Name: name,
                        Email: email,
                        Complaint: complaint,
                        Adentify: window.top.adentify.results.slots ? JSON.stringify(window.top.adentify.results.slots[this.parentNode.id], null, 2) : "N/A",
                        DivId: this.parentNode.id, // add the ID of the parent element of the button that was clicked
                        Timestamp: new Date().toISOString() // add a timestamp for the current entry
                    };

                    //console.info("Submitting data:", data);

                    // Store the latest form data
                    latestFormData = data;

                    // Send the latest feedback
                    sendFeedback();

                    // Clear the form and remove the event listener
                    feedbackForm.reset();
                    feedbackForm.removeEventListener("submit", submitForm);
                    window.removeEventListener("beforeunload", sendFeedback);

                    //close the modal now
                    window.top.adentify.adentifyCloseModal();

                };

                if (feedbackForm) {
                    feedbackForm.addEventListener("submit", submitForm, {
                        once: true
                    });

                    const closeButton = document.getElementById("adentifyCloseButton");
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

                //console.info("Sending feedback:", latestFormData);

                const adentifyResults = JSON.stringify(window.top.adentify.results.slots[this.parentNode.id], null, 4);
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
                                }
                            ]
                        },
                        ...adentifyAttachment,
                        {
                            "color": "#36a64f",
                            "fields": [{
                                    "title": "DivId",
                                    "value": latestFormData.DivId
                                },
                                {
                                    "title": "Timestamp",
                                    "value": latestFormData.Timestamp
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
            window.addEventListener("beforeunload", sendFeedback);

        }

    })
}
if (document.readyState !== 'complete') {
    // Wait for the page to finish loading
    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            // Page has finished loading, so fire the function
            tmgLoadAdentify();
        }
    };
} else {
    // Page has already finished loading, so just fire the function
    tmgLoadAdentify();
}