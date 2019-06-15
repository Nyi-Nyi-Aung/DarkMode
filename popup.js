var jQuery_Sauron_pu = $.noConflict(true);

var TOGGLE_BTN_ON = "Website Toggle: ON";
var TOGGLE_BTN_OFF = "Website Toggle: OFF";
var PWR_BTN_ON = "Enabled for all websites";
var PWR_BTN_OFF = "Disabled for all websites";
var IMGFLTR_PWR_BTN_ON = "Dim Images for all websites";
var IMGFLTR_PWR_BTN_OFF = "Don't Dim Images all websites";
var IMGFLTR_TOGGLE_BTN_ON = "Website Toggle: ON";
var IMGFLTR_TOGGLE_BTN_OFF = "Website Toggle: OFF";
var SCHDLR_PWR_OFF = "Scheduler Disabled";
var SCHDLR_PWR_ON = "Scheduler Enabled";
var ENABLED_CLR = "#103C0B";
var DISABLED_CLR = "rgb(124, 67, 9)";

chrome.runtime.sendMessage({type: "ToggleQuery", origin: "Popup"}, function(response) {
    if(response.toggle == "Off"){
        jQuery_Sauron_pu("#toggle").html(TOGGLE_BTN_OFF);
    }else{ jQuery_Sauron_pu("#toggle").css("backgroundColor", ENABLED_CLR); }
    if(response.power == "Disabled"){
        jQuery_Sauron_pu("#power").html(PWR_BTN_OFF);
        jQuery_Sauron_pu("#toggle").prop('disabled', true);
    }else{ jQuery_Sauron_pu("#power").css("backgroundColor", ENABLED_CLR); }
    if(response.imageFilterPower == "Disabled"){
        jQuery_Sauron_pu("#imageFilterPower").html(IMGFLTR_PWR_BTN_OFF);
        jQuery_Sauron_pu("#imgFltrToggle").prop('disabled', true);
    }else{ jQuery_Sauron_pu("#imageFilterPower").css("backgroundColor", ENABLED_CLR); }
    if(response.imageFilterToggle == "Off"){
        jQuery_Sauron_pu("#imgFltrToggle").html(IMGFLTR_TOGGLE_BTN_OFF);
    }else{ jQuery_Sauron_pu("#imgFltrToggle").css("backgroundColor", ENABLED_CLR); }
    if(response.schdlPower == "Enabled"){
        jQuery_Sauron_pu("#schdlPower").html(SCHDLR_PWR_ON);
        jQuery_Sauron_pu("#schdlrForm :input").prop("disabled", true);
        jQuery_Sauron_pu("#schdlPower").css("backgroundColor", ENABLED_CLR);
    }
    jQuery_Sauron_pu("#schdlOff").val(response.schdlOff);
    jQuery_Sauron_pu("#schdlOn").val(response.schdlOn);
});

jQuery_Sauron_pu(document).ready(function(){    
    jQuery_Sauron_pu("#toggle").click(function(){
        commitChange(this, "ToggleChange", TOGGLE_BTN_ON, TOGGLE_BTN_OFF);
    });
    jQuery_Sauron_pu("#power").click(function(){
        commitChange(this, "PowerChange", PWR_BTN_ON, PWR_BTN_OFF);
    });
    jQuery_Sauron_pu("#imgFltrToggle").click(function(){
        commitChange(this, "ToggleChange", IMGFLTR_TOGGLE_BTN_ON, IMGFLTR_TOGGLE_BTN_OFF);
    });
    jQuery_Sauron_pu("#imageFilterPower").click(function(){
        commitChange(this, "PowerChange", IMGFLTR_PWR_BTN_ON, IMGFLTR_PWR_BTN_OFF);
    });
    jQuery_Sauron_pu("#schdlPower").click(function(){
        commitChange(this, "PowerChange", SCHDLR_PWR_ON, SCHDLR_PWR_OFF);
    });
    jQuery_Sauron_pu('body').on('click', 'a', function(){
        chrome.tabs.create({url: jQuery_Sauron_pu(this).attr('href')});
        return false;
   });
    jQuery_Sauron_pu('body').on('click', 'button.hyperlink_buttons', function(){
        chrome.tabs.create({url: jQuery_Sauron_pu(this).attr('onclick')});
        return false;
   });
});

function commitChange(element, changeType, onText, offText){
    var action, newText, schdlOff, schdlOn, newColor;
    var buttonId = jQuery_Sauron_pu(element).attr("id");
    var currentButton = document.getElementById(buttonId);
    var currentText = currentButton.innerHTML;
    var disables = false;
    schdlOff = jQuery_Sauron_pu("#schdlOff").val();
    schdlOn = jQuery_Sauron_pu("#schdlOn").val();  
    if(currentText == onText){
        if(changeType == "PowerChange"){
            action = "Disabled";
            disables = true;
        }else{ 
            action = "Off"; 
        }
        newText = offText;
        newColor = DISABLED_CLR;
    }else{ 
        if(changeType == "PowerChange"){
            action = "Enabled";
        }else{ 
            action = "On"; 
        }
        newText = onText;
        newColor = ENABLED_CLR;
    }
    chrome.runtime.sendMessage({type:changeType, buttonId:buttonId, action:action, origin:"Popup", schdlOff:schdlOff, schdlOn:schdlOn}, function(response){});
    reflectSettings(buttonId, newText, newColor, disables);
   
}

function reflectSettings(buttonId, newText, newColor, disables){
    document.getElementById(buttonId).innerHTML = newText;
    document.getElementById(buttonId).style.backgroundColor = newColor;
    if(buttonId == "schdlPower"){
        jQuery_Sauron_pu("#schdlrForm :input").prop("disabled", !disables);;
    }
    else if(buttonId == "power"){
        jQuery_Sauron_pu("#toggle").prop("disabled", disables);;    
    }
    else if(buttonId == "imageFilterPower"){
        jQuery_Sauron_pu("#imgFltrToggle").prop("disabled", disables);;
    }
}
