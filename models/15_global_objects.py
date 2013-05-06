# -*- coding: utf-8 -*-

'''Global objects and methods declaration.

Unvolatile data fits better here, than in a db table.
Some structures are immutable. Days of week, for example.

As well as methods used throughout your app.

Here is their sweet home.
'''

## Global functions

def g_current_page(url, classe, empty=''):
    '''returns a class if you are on url. Otherwise returns empty.'''

    if request.args(0):
        url_server = '%s/%s/%s' % (request.controller, request.function, request.args(0))
    else:
        url_server = '%s/%s' % (request.controller, request.function)

    if url == url_server:
        return classe
    else:
        return empty

def g_if_in_current_page(url, classe, anotherclass):
    '''returns a class if you are on the page, else returns another class'''

    if request.args(0):
        url_server = '%s/%s/%s' % (request.controller, request.function, request.args(0))
    else:
        url_server = '%s/%s' % (request.controller, request.function)

    if url == url_server:
        return classe
    else:
        return anotherclass


def g_blank_check(item):
    '''returns a empty string if item is empty.'''
    if item:
        return item
    else:
        item=""
        return item


def g_blank_fulldate_check(item):
    '''returns a empty string if item is empty.'''
    if item:
        return item.strftime("%d/%m/%Y")
    else:
        item=""
        return item


def g_blank_date_check(item):
	'''returns a empty string if item is empty.'''
	if item:
		return item.strftime("%d/%m")
	else:
		item=""
		return item

