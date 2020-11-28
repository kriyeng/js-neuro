/**
 * Created by David on 11/04/2017.
 */

( function(window){

  /*  'use strict';*/
    var dynamicTemplate = {
        render : render
    };

    function render(template_selector, object, $old){
        if(object) object = $.extend({}, object);

        var $result = applyTemplate(template_selector, document.getElementById(template_selector), object);

        if($old){
            updateDOM($result.children[0], $old)
        } else {
            return $result.innerHTML;
        }
    }

    function applyTemplate(template_selector, $template, object) {

        if(!$template){
            console.error("Template doesn't exists! Check Your template Selector: " + template_selector);
            return null;
        }

        // Creates dummy DOM to apply work with the template
        var newHTMLDocument = document.implementation.createHTMLDocument('preview');

        var $html = newHTMLDocument.createElement('div');

        // The template can come from a script tag or from iterations inside a template and there's no parent div embedding all content
        $html.innerHTML = $template.outerHTML.substr(0,30).indexOf('script')>-1 ? $template.innerHTML : $template.outerHTML;

        applyConditions($html, object);
        applyIterates($html, object, newHTMLDocument);
        applyDynamicValues($html, object);

        return $html;
    }

    function applyDynamicValues($html, object){
        var str_html = $html.innerHTML;
        getDynamicValues(str_html).forEach(function(dyn_value){

            // get the value for each dynamic variable found
            var value = getVariableValue(dyn_value, object);

            // Creates a regex to replace the value for each element found
            var regexp = new RegExp("{{" + dyn_value.replace('(','\\(').replace(')','\\)') + "}}", 'g');

            // Apply the replace to all items in the original HTML string
            str_html = str_html.replace(regexp, value !== null ? value : '');
        });

        // For older browsers we need to use dt-style attribute instead style. IE doesn't allow using custom texts on inline style
        str_html = str_html.replace(/dt-style="/g, 'style="');

        // Sets innerHTML again with the new string
        $html.innerHTML = str_html;

        // Using DOM applies values to selects and checkboxes
        applySelectValues($html);
        applyCheckedValues($html);
    }

    function getVariableValue(var_string, object){
        var value = '';
        if (var_string.indexOf('if:') > -1) {
            value = getValueFromConditional(var_string, object);
        } else if (var_string.indexOf('compute:') > -1) {
            value = getValueFromCompute(var_string, object);
        } else {
            value = getValueFromObject(var_string, object);
        }

        return value;
    }

    function getValueFromCompute(str_compute, object) {

        var regex = /compute:([\w.]*)\((.*)\)/;     // compute:function_name(parameters) -> we create 2 group matches, one for the fn name an another for the parameters
        var parts = regex.exec(str_compute);
        var fn = parts[1];

        // Analize the parameters passed to the function
        var values = parts[2].split(',').map(function(parameter, index){

            // cleaning white spaces
            parameter = parameter.trim();

            // Returning the value. If string, removing the ', if object, get the property of the object
            return parameter.indexOf('\'') > -1 ? parameter.replace(/\'/g, '') : getValueFromObject(parameter, object);
        });

        if(typeof window[fn] === "function"){
            return window[fn](values);
        }else {
            if(fn.indexOf('.')>-1){

                // we break function into properties based on dot notations. object.props0.props1
                var props = fn.split('.');

                // We verify if object.firstField exists and object.firstField.secondField if it is a function
                // If not we check if window.firstField exists and window.firstField.secondField if it is a function
                if (object[props[0]] && typeof object[props[0]][props[1]] === "function") {
                    return object[props[0]][props[1]].apply(object[props[0]], values);
                } else if(window[props[0]] && typeof window[props[0]][props[1]] === "function") {
                    return window[props[0]][props[1]].apply(window[props[0]], values);
                } else {
                    // We create an advice that we are using a not existing function on this template
                    console.log("Error: " + str_compute + " is not a function");
                }
            }
            console.log("Error: " + str_compute + " is not a function");
        }
    }


    // Analize the condition: {{if:some-value:operator:value:option1:option2}}
    function getValueFromConditional(str_condition, object){

        // Split conditional parameters into arrey
        var condition = str_condition.split(':');

        // We get the value to compare {{if:SOME-VALUE:operator:value:option1:option2}}
        var variable_value = getValueFromObject(condition[1], object);

        // We convert to native primitives of string values {{if:some-value:operator:VALUE:option1:option2}}
        condition[3] = condition[3] == "null" ? null : condition[3];
        condition[3] = condition[3] == "true" ? true : condition[3];

        // for the conditional values we can use objects indicated by {@object.property@} on {{if:some-value:operator:value:OPTION1:OPTION2}}
        condition[4] = checkVariableInContent(condition[4], object);
        condition[5] = checkVariableInContent(condition[5], object);

        // Finally we compute the conditional based on the operator {{if:some-value:OPERATOR:value:option1:option2}}
        switch(condition[2]){
            case 'is':
                return variable_value ? condition[4] : condition[5];
            case '==':
                return (condition[3] == variable_value) ? condition[4] : condition[5];
            case '!=':
                return (condition[3] != variable_value) ? condition[4] : condition[5];
            case '>':
                return (condition[3] > variable_value) ? condition[4] : condition[5];
            case '<':
                return (condition[3] < variable_value) ? condition[4] : condition[5];
            case '<=':
                return (condition[3] == variable_value) ? condition[4] : condition[5];
        }
    }

    function checkVariableInContent(content, object){
        // Check if the values contains expressions to evaluate expressed as {@object@} or {@object.property@}
        var expr = content.match(/{@(.*?)@}/);
        if(expr){
            // Replace the expression by its value
            return content.replace(expr[0],getValueFromObject(expr[1], object));
        } else {
            // Returns the content as received
            return content;
        }
    }

    function getValueFromObject(str_property, object){

        object = $.extend({}, object);

        // Clean white spaces
        str_property=str_property.trim();
        //if(str_property === "andenes") console.log("Andenes");

        // set the default value for the object
        var value = object;

        // We protect the code to throw an error when trying to access a property of undefined
        try {
            // Iterates through the dot notation checking if the object has the property
            var properties = str_property.split('.');

            for (var i=0, total = properties.length; i<total; i++){
                if(value.hasOwnProperty(properties[i])){
                     value = value[properties[i]];
                } else {
                    value = null;
                    break;
                }
            }

            /*
            value = properties.reduce(function(props, item, index){
                if(str_property === "services" || str_property === "andenes"){
                    console.log(str_property.split('.').length)
                    console.log("Dyn template: Property " + item + " From object, " + index,object, props.hasOwnProperty(item))
                }
                return (props.hasOwnProperty(item) ? props[item] : null);
            }, object);
            */
        } catch(e){
            console.warn("Tried to read a property of undefined, str_property: " + str_property);
            if(typeof object === 'undefined'){
                console.warn("The Object is undefined. Check the Object passed to fill the data");
            }
            value = null;
        }
        return value;
    }

    function applyConditions($html, object) {

        // find all nodes containing dt-condition attr. Filter and removes those with false condition
        [].filter.call($html.querySelectorAll('[dt-condition]'), function(condition){
            return !getVariableValue(condition.attributes["dt-condition"].value, object);
        }).forEach(function(condition){
            condition.remove();
        });

    }
    function applyIterates($html, object, newHTMLDocument) {
        // REMINDER: ITERATES NEEDS ITS CONTAINER IF NOT WILL OVERWRITE ITS SIBLINGS

        var $iterates = $html.querySelectorAll('.dt-iterate');

        // We iterate through all iterations in the template
        while($iterates.length) {

            var $iterate = $html.querySelectorAll('.dt-iterate')[0];
            // Avoid to repeat the iteration inside iterations remocing the attribute
            $iterate.classList.remove('dt-iterate');

            // We get the data object to iterate with
            var iteration_data = $iterate.attributes["dt-data"].value.split(' in ');

            // we set the template to use as the iteration but check if there's a component to use as template
            var $template = $iterate;

            if ($iterate.attributes["dt-component"] && $iterate.attributes["dt-component"].value) {
                var $component = document.getElementById($iterate.attributes["dt-component"].value);
                if (!$component) {
                    console.error('Component not found!: ' + $iterate.attributes["dt-component"].value);
                    return $html;
                } else {
                    $template = $component.cloneNode(true);
                }
            }

            // Preparing a temp div to write the results
            var $temp_div = newHTMLDocument.createElement('div');

            // iterate over the object array
            // We use reduce to write every iteration to $temp_div
            var iterable_object = getValueFromObject(iteration_data[1], object );

            // After get the object we check if exists, is an array and has items
            if(iterable_object && iterable_object.constructor === Array && iterable_object.length) {

                $temp_div = iterable_object.reduce(function ($div, element, index) {
                    var item = $.extend({}, object);      // We keep the general dat inside iterations
                    item[iteration_data[0]] = element;
                    item.__index = index;

                    var $newHTML = applyTemplate("iterable_object", $template, item);
                    $div.appendChild($newHTML.firstElementChild);

                    return $div;
                }, $temp_div);

                $iterate.parentNode.innerHTML = $temp_div.innerHTML;
            }

            // We check if there're some more iteration to apply
            $iterates = $html.querySelectorAll('.dt-iterate');
        }

        return $html;
    }

    function applySelectValues($html){
        // Iterates over all selects and try to find if a selected value exists in options and then select it
        [].forEach.call($html.querySelectorAll('.dt-select'), function(select) {
            var $option = select.querySelector('[value="' + select.attributes['dt-value'].value + '"]');
            if($option) $option.setAttribute('selected', 'selected');
        });
    }

    function applyCheckedValues($html){
        // Iterates over checkboxes and find if they have dt-checked attr to set checked to this
        [].forEach.call($html.querySelectorAll('.dt-checkbox'), function(checkbox) {
            if(checkbox.attributes['dt-checked'] && checkbox.attributes['dt-checked'].value === 'checked'){
                checkbox.setAttribute('checked', 'checked');
                checkbox.removeAttribute('dt-checked');
            }
        });

        [].forEach.call($html.querySelectorAll('.dt-disabled'), function(input) {
            input.setAttribute('disabled', 'disabled');
            input.removeAttribute('dt-disabled');
        });
    }

    function applyStyleTemplatesToElements($html){
        var $elements = $html.querySelectorAll('[dt-style]:not([value=""]');

        for (var i = 0, total = $elements.length; i < total; i++) {
            $elements[i].style.cssText = $elements[i].style.cssText + ';' + $elements[i].getAttribute('dt-style').replace(/"/g,'');
        }
    }

    function getDynamicValues(str){

        // Regex Explanation:  In JavaScript, [^] represents a valid character class. Should be the same as .
        // Regex Explanation:  ([^]*?) -> +? or *?  means it will consume as few characters as possible instead of as many as possible (as is the default)

        var result = str.match(/{{([^]*?)}}/g);
        if(result != null){

            // Filter the results to remove duplicates
            // Then use map to remove brackets in the matches
            return result.filter(function(item, pos) {
                return result.indexOf(item) === pos;
            }).map(function(x) { return x.replace(/({{|}})/g,'') });
        } else {
            return [];
        }
    }

    function setAttributes($new, $old) {
        for(var i = 0, total = $new.attributes.length; i<total; i++){
            $old.setAttribute($new.attributes[i].name, $new.attributes[i].value);
        }
    }

    function updateDOM($new, $old) {

        if(!$new || !$old){
            return;
        }
        if ($new.isEqualNode($old)) {
            return;
        }
        if ($old.nodeType == $old.TEXT_NODE && $old.textContent !== $new.textContent){
            $old.textContent = $new.textContent;
            return;
        } else if ($new.attributes !== $old.attributes) {
            setAttributes($new, $old);
        }
        if ($new.isEqualNode($old)) {
            return;
        }
        const newLength = $new.childNodes.length;
        const oldLength = $old.childNodes.length;
        for (var i = 0; i < newLength || i < oldLength; i++) {
/*            if(newLength != oldLength){
                console.log(newLength + "-" + oldLength);
            }*/
            updateDOM(
                $new.childNodes[i],
                $old.childNodes[i]
            );
        }
    }

    window.dt = dynamicTemplate;

})(window);