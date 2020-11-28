;(function(window){
    'use strict';

    var observers = [];

    var EventManager = {
        subscribe : subscribe,
        unsubscribe : unsubscribe,
        fire : fire
    };

    // Adds new handlers to the observer
    function subscribe(event, handler){
        if(typeof event === 'string' && typeof handler === 'function'){
            var observer = {
                event : event,
                handler : handler
            };
            if(!exists(observer)) observers.push(observer);
        }
    }

    function unsubscribe(event, handler){
        if(typeof event === 'string' && typeof handler === 'function'){
            var observer = {
                event : event,
                handler : handler
            };
            observers = observers.filter(function(item){        // We retreive the observers which are not the one to remove and reasign it to the array itself
                return (item.event !== observer.event || item.handler !== observer.handler);
            });
        }
    }

    // Check if an observer already exists
    function exists(observer){
        var filtered_observers = observers.filter(function(item){
            return (item.event === observer.event && item.handler === observer.handler);
        });

        return !!filtered_observers.length; // Converts the length to true / false
    }

    // Retrieve all the observers by event name
    function findObserversByEvent(event){
        return observers.filter(function(item){
                    if(item.event === event) {
                        return item;
                    }
                });
    }

    // Receive the event firing and find the observers to execute the handlers
    function fire(event, data) {
        var observers_to_fire = findObserversByEvent(event);
        //console.log("Found " + observers_to_fire.length + " Observers to event: " + event);
        observers_to_fire.forEach(function(item) {
            try {                                    // Prevent Event manager from external unhandled errors
                item.handler.call(event, data);      // event as this, and data for event data
            } catch(e){
                console.warn("Error executing handler", e);
                console.warn("Event Fired Details:", event);
                console.warn("Data sent:", data);
            }
        });
    }

    window.EventManager = EventManager;

})(window);