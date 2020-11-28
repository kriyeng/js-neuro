module.exports = {
    name : 'events',
    id : 'id_event',
    columns : [
        "id_event",
        "title",
        "client",
        "date_from",
        "date_to",
        "color",
        "logo",
        "id_hotel",
        "created_at",
        "updated_at",
        "deleted"
    ],
    required : [
        "title",
        "date_from",
        "date_to",
        "id_hotel"
    ],
    logic_delete : 'deleted'
};