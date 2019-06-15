//Rishabh Maheshwari
var DARKNESS_THRESHOLD = 50;
var LIGHTNESS_THRESHOLD = 60;
var CAT2BGLIGHTVAL = 5;
var CAT1BGDARKVAL = 11;
var BORDERDARKVAL = 5;
var CAT1COLORLIGHTVAL = 65;
var CAT1MUTATEDBGDARKVAL = 12;
var CAT2BGDARKVAL = 5;
var CAT2COLORLIGHTVAL = 65;
var SVGFILLVAL = 60;
var IMAGEDIMVAL = 60;
function rgbToHsl(r, g, b) {
    //console.log("rgbToHsl: %s %s %s", r,g,b);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // ACHROMATIC
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

function hexToHsl(hex_value){
    var r = parseInt(hex_value.substr(1,2), 16);
    var g = parseInt(hex_value.substr(3,2), 16);
    var b = parseInt(hex_value.substr(5,2), 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}


function getHslColor(element, color){
    if(color == undefined || color == null){ return; }
    //console.log("getHslColor: " + color);
    //COLOR IS IN RGB (DEFAULT RETURN FORMAT OF BROWSERS)
    //LEAVE ONLY "R,G,B" :
    if(color == "white"){return [0, 0, 100];}
    //if(color.charAt(0) == '#'){ return hexToHsl(color);} //IN CASE BROWSER RETURNS HEX VALUE
    color = color
                .replace("rgba", "")
                .replace("rgb", "")
                .replace("(", "")
                .replace(")", "");
    color = color.split(","); // GET ARRAY["R","G","B"]
    //CHECK FOR RGBA VALUES
    if(color.length>3){
        //COLOR VALUE IN RGBA
        var alpha = color[3];
        if(alpha != 0){
            //MAKE TRANSPARENT ELEMENTS OPAQUE
            jQuery_Sauron(element).css("opacity", "1");
        }
        else{
            //ELEMENT IS TRANSPARENT / NO BACKGROUND-COLOR DEFINED
            return null;
        }
    }
    return rgbToHsl(color[0],color[1],color[2]);
}

function darken(value, max){
    //VALUE IS IN HSL
    if(value!=null){
        //PROPERTY VALUE IS DEFINED
        var hsl = value;
        var lightness = hsl[2];
        //MAKE ELEMENTS THAT HAVE LIGHTNESS > THRESHOLD DARKER
        if(lightness >= DARKNESS_THRESHOLD){
            var new_lightness;
            var lightnessSupplement = 100 - lightness;
            if(lightnessSupplement > max){ new_lightness = lightnessSupplement; }
            else{ new_lightness = max; }
            return "hsl(" + hsl[0] + "," + hsl[1]+ "%," + new_lightness + "%)";
        }
    }
    //PROPERTY VALUE : UNDEFINED OR NOT TO BE CHANGED
    return undefined;
}

function lighten(value, min){
    //VALUE IS IN HSL
    if(value!=null){
        //PROPERTY VALUE IS DEFINED
        var hsl = value;
        var lightness = hsl[2];
        //MAKE ELEMENTS THAT HAVE LIGHTNESS LESS THAN THRESHOLD LIGHT
        if(lightness < LIGHTNESS_THRESHOLD){
            var new_lightness;
            var lightnessSupplement = 100 - lightness;
            if(lightnessSupplement < min){ new_lightness = min; }
            else if(lightnessSupplement > 75){
                new_lightness = 75;
            }
            else{
                new_lightness = lightnessSupplement;
            }
            return "hsl(" + hsl[0] + "," + hsl[1]+ "%," + new_lightness + "%)";
        }
    }
    //PROPERTY VALUE : UNDEFINED OR NOT TO BE CHANGED
    return undefined;
}

function gradientChecker(value){
    if(value.indexOf("gradient") !=-1){
        return true;
    }else{
        return false;
    }
}

function bgColorSetter(element, value, elementCategory){
    if(value == undefined || value == null){ return; }
    var newBG;    
    var currentBgImg = jQuery_Sauron(element).css("backgroundImage"),
        gradientExists = gradientChecker(currentBgImg);
    if(gradientExists && currentBgImg.indexOf("rgba") == -1){
        // GRADIENT EXISTS AND HAS NO TRANSPARENCY
        var regex = /rgb\(\d+\,\s\d+\,\s\d+\)|white/g,
            match,
            indexes = [];
        while(match = regex.exec(currentBgImg)) {
            //INDEXES = [[START_INDEX_OF_COLOR, END_INDEX_OF_COLOR],...]
            indexes.push([match.index, match.index+match[0].length, match[0]]);
        }
        //console.log(indexes);
        var res = currentBgImg;
        for(var i = 0; i<indexes.length; i++){
            //REPLACE COLORS OF GRADIENT ONE BY ONE
            var newColor = darken(getHslColor(element,indexes[i][2]),12);
            res = res.replace(indexes[i][2],newColor);
        }
        propertySetter(element, "background-image", res, false);
    }
    newBG = darken(getHslColor(element,value),CAT1BGDARKVAL);
    if(elementCategory == 2){
        propertySetter(element,"background-color",newBG,false);
    }else{
        propertySetter(element,"background-color",newBG,true);
    }
}

function glyphMutation(element){
    var classes = jQuery_Sauron(element).attr("class");
    if(classes != undefined){
        if( classes.indexOf("glyph") != -1){
            //IT'S A GLYPH ...probably
            jQuery_Sauron(element).css("filter", "invert(100%)");
        }
    }
}

function propertySetter(element, property, value, setImportant){
    //console.log("propertySetter: " + value);
    if(value == undefined || value == null){ return; }
    if(setImportant){
        element.style.setProperty( property, value, 'important' );
    }else{
        element.style.setProperty( property, value, null );
    }
}

function imageDimmer(element, dimValue, imageFilterOn){
    if(imageFilterOn){
        if(element.clientHeight > 250){
            jQuery_Sauron(element).css("filter", "brightness(" + dimValue + "%)");       
            jQuery_Sauron(element).hover(
                function(event){
                    jQuery_Sauron(element).css("filter", "brightness(100%)");
                    
                }, function(event){
                    jQuery_Sauron(element).css("filter",  "brightness(" + dimValue + "%)");   
                                
                }
            );
        }
    }
}

function borderColorSetter(element, elementCategory){
    //cycle through all borders in fashion T-L-B-R
    var brdrColor;
    brdrColor = jQuery_Sauron(element).css("borderTopColor");
    propertySetter(element,"borderTopColor", darken(getHslColor(element,brdrColor),BORDERDARKVAL), true);

    brdrColor = jQuery_Sauron(element).css("borderLeftColor");
    propertySetter(element,"borderLeftColor", darken(getHslColor(element,brdrColor),BORDERDARKVAL), true);

    brdrColor = jQuery_Sauron(element).css("borderBottomColor");
    propertySetter(element,"borderBottomColor", darken(getHslColor(element,brdrColor),BORDERDARKVAL), true);

    brdrColor = jQuery_Sauron(element).css("borderRightColor");
    propertySetter(element,"borderRightColor", darken(getHslColor(element,brdrColor),BORDERDARKVAL), true);
       
}
