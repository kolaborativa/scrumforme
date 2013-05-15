from gluon.contrib.websocket_messaging import websocket_send

def _update_card():
    # sending websocket message
    js = "console.log('Here boy!!!')"
    websocket_send('http://localhost:8888', js, 'mykey', 'mygroup')
