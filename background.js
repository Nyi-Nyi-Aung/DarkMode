var settingsObj = {
            exceptions:["default"], 
            power:"Enabled",
            imageFilterExceptions:["default"],
            imageFilterPower:"Enabled",
            schdlOff:"00:00",
            schdlOn:"00:00",
            schdlPower:"Disabled"
};
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){ 
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var domain;
        console.log(message);
        if(message.origin == "ContentScript"){
            //GET DOMAINS IN THE FORM OF PROTOCOL://BLA*.?BLA+.BLA
            domain = sender.tab.url.match(/\w*:\/\/(\w*-*_*)*\.?(\w*-*_*)+\.\w*/g)[0];
            console.log("domain CS: " + domain);
        }
        else if(message.origin == "Popup"){
            domain = tabs[0].url.match(/\w*:\/\/(\w*-*_*)*\.?(\w*-*_*)+\.\w*/g)[0];
            console.log("domain Pu: " + domain);
        }
        chrome.storage.sync.get(settingsObj, function(data){
            console.log("Current Exceptions: " + data.exceptions);
            if(message.type == "ToggleQuery"){
                var power, toggle, imageFilterPower, imageFilterToggle, schdlOff, schdlOn, schdlPower;
                power = data.power;
                imageFilterPower = data.imageFilterPower;
                schdlOff = data.schdlOff;
                schdlOn = data.schdlOn;
                schdlPower = data.schdlPower;
                if(schdlPower == "Enabled"){
                    var date = new Date();
                    var currentHours = date.getHours();
                    var currentMinutes = date.getMinutes();
                    currentHours = ("0" + currentHours).slice(-2);
                    currentMinutes = ("0" + currentMinutes).slice(-2);
                    var currentTime = currentHours + ":" + currentMinutes;
                    if(schdlOff < currentTime && currentTime < schdlOn){
                        power = "Disabled";
                    }   
                }
                var exceptionIndex = data.exceptions.indexOf(domain);
                if(exceptionIndex > -1){
                    console.log("In exceptions.");
                    toggle = "Off";
                }else{
                    console.log("Not in exceptions.");
                    toggle = "On";
                }
                var imageFilterExceptionIndex = data.imageFilterExceptions.indexOf(domain);
                if(imageFilterExceptionIndex > -1){
                    console.log("In image filter exceptions.");
                    imageFilterToggle = "Off";
                }else{
                    console.log("Not in image filter exceptions.");
                    imageFilterToggle = "On";
                }
                sendResponse({power:power, toggle:toggle, imageFilterPower:imageFilterPower, imageFilterToggle:imageFilterToggle, schdlOff:schdlOff, schdlOn:schdlOn, schdlPower:schdlPower});
                console.log("response sent");
            }
            else if(message.type == "ToggleChange"){
                var buttonId = message.buttonId;
                var exceptionListName;
                if(buttonId == "toggle"){ 
                    exceptionListName = "exceptions";
                }
                
                
                if(message.action == "Off"){
                    addException(domain, exceptionListName, settingsObj);
                }
                else if(message.action == "On"){
                    removeException(domain, exceptionListName, settingsObj);
                }
                sendResponse();
            }
            else if(message.type == "PowerChange"){
                var buttonId = message.buttonId;
                var powerSettingName = buttonId;
                chrome.storage.sync.get(settingsObj, function(data){
                    data[powerSettingName] = message.action;
                    if(buttonId == "schdlPower" && message.action == "Enabled"){
                        data["schdlOff"] = message.schdlOff;
                        data["schdlOn"] = message.schdlOn;
                    }
                    else if(data[schdlPower] == "Enabled" && buttonId == "power" && message.action == "Enabled"){
                        data[schdlPower] = "Disabled";
                    }
                    console.log(data);
                    chrome.storage.sync.set(data, function() {
                        console.log(powerSettingName + message.action);
                    });
                });
                chrome.tabs.reload(function(){});   
                sendResponse();
            }
        });  
    });
    //keep connection live untill sendResponse is called.
    return true;
    
});

function addException(toAdd, exceptionListName, settingsObj){
    chrome.storage.sync.get(settingsObj, function(data){
        var currentExceptions = data[exceptionListName];
        currentExceptions.push(toAdd);
        data[exceptionListName] = currentExceptions;
        chrome.storage.sync.set(data, function() {
            console.log("Exceptions modified! " + currentExceptions);
            chrome.tabs.reload(function(){});
        });
    });
}

function removeException(toRemove, exceptionListName, settingsObj){
    chrome.storage.sync.get(settingsObj, function(data){
        var currentExceptions = data[exceptionListName];
        var newExceptions = currentExceptions.filter(function(value){
        return value !== toRemove;
        });
        data[exceptionListName] = newExceptions;
        chrome.storage.sync.set(data, function() {
            console.log("Exceptions modified! " + newExceptions);
            chrome.tabs.reload(function(){});
        });
    });
}

function del_key(key){
    chrome.storage.sync.remove([key],function(){
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    })
}
