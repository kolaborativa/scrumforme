def _update_card(element):
    from gluon.contrib.websocket_messaging import websocket_send
    import json
    # sending websocket message
    # js = "console.log('Here boy!!!')"
    data = json.dumps(element)
    print "novo"
    websocket_send('http://localhost:8888', element, 'mykey', 'mygroup')
