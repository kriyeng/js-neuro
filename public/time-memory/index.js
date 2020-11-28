document.addEventListener('DOMContentLoaded', function(){

    comp.loadComponents(function(){
        Network.initialize(4, 10);

        Comp_network.initialize($('#network-container'));
        Notifications.initialize($('#notifications-wrapper'));
    });
});