'use strict'

var express = require('express');
var router = express.Router();

var Controller = require('../generic-controller');

/*
If it is necessary a custom case, you can set your custom controller for this component
And you can set a custom routes like the following.

Create events-controller on component folder, program the necessary functions, require here.

var CustomController = require('events-controller');

router.get('/api/events/events-by-room-id', CustomController.get('events'));
 */

router.get('/api/events/', Controller.get('events'));
router.get('/api/events/:id', Controller.getById('events'));
router.post('/api/events/', Controller.create('events'));
router.patch('/api/events/:id', Controller.update('events'));
router.delete('/api/events/:id', Controller.del('events'));

module.exports = router;
