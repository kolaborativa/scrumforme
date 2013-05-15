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


def g_format_number(number):
    '''retorna o numero formatado com 0 antes do numero se for menor que 10'''
    if number < 10:
        number = " %s" % number

    return number


class G_projects(object):
    """header projects"""

    def new_project(self):
        from datetime import datetime
        person = _get_person()
        person_id = person["person_id"]

        form = SQLFORM.factory(
            Field('name', label=T('Name'), requires=IS_NOT_EMPTY(error_message=T('The field name can not be empty!'))),
            Field('description', label= T('Description')),
            Field('url', label= 'Url'),
            table_name='projects',
            submit_button=T('CREATE')
            )

        if form.accepts(request.vars):
            project_id = Project.insert(
                            created_by=person_id,
                            name=form.vars.name,
                            description=form.vars.description,
                            url=form.vars.url,
                            date_=datetime.now(),
                            )
            Sharing.insert(project_id=project_id,
                           person_id=person_id,
                           role_id=2,
                           )
            redirect(URL(f="product_backlog",args=[project_id]))

        elif form.errors:
            response.flash = T('form has errors')

        return form

    def projects(self):

        person = _get_person()
        person_id = person["person_id"]
        person_projects = person["projects"]
        shared_with_person = person['shared']

        return dict(person_projects=person_projects, shared_with_person=shared_with_person)