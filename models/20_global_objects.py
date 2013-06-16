# -*- coding: utf-8 -*-

"""Global objects and methods declaration.

Unvolatile data fits better here, than in a db table.
Some structures are immutable. Days of week, for example.

As well as methods used throughout your app.

Here is their sweet home.
"""

## Global functions

def g_current_page(url, classe, empty=''):
    """returns a class if you are on url. Otherwise returns empty."""

    if request.args(0):
        url_server = '%s/%s/%s' % (request.controller, request.function, request.args(0))
    else:
        url_server = '%s/%s' % (request.controller, request.function)

    if url == url_server:
        return classe
    else:
        return empty

def g_if_in_current_page(url, classe, anotherclass):
    """returns a class if you are on the page, else returns another class"""

    if request.args(0):
        url_server = '%s/%s/%s' % (request.controller, request.function, request.args(0))
    else:
        url_server = '%s/%s' % (request.controller, request.function)

    if url == url_server:
        return classe
    else:
        return anotherclass


def g_blank_check(item):
    """returns a empty string if item is empty."""
    if item:
        return item
    else:
        item=""
        return item


def g_blank_return_question(item):
    """returns a '?' string if item is empty."""
    if item:
        return item
    else:
        item="?"
        return item


def g_blank_fulldate_check(item):
    """returns a empty string if item is empty."""
    if item:
        return item.strftime("%d/%m/%Y")
    else:
        item=""
        return item


def g_blank_date_check(item):
	"""returns a empty string if item is empty."""
	if item:
		return item.strftime("%d/%m")
	else:
		item=""
		return item


def g_format_number(number):
    """returns the number formatted with 0 before the number if less than 10"""
    if number < 10:
        number = " %s" % number

    return number


def g_person_id():
    """returns the person_id of logged user"""
    user_relationship = db(db.user_relationship.auth_user_id==auth.user.id).select().first()
    person_id = user_relationship.person_id

    return person_id


class G_projects(object):
    """header projects"""

    def newProject(self):
        from datetime import datetime

        uploadfolder = '%sstatic/uploads/' % request.folder
        form = SQLFORM.factory(
            Field('name', label=T('Name'), requires=IS_NOT_EMPTY(error_message=T('The field name can not be empty!'))),
            Field('description', label= T('Description')),
            Field('url', label= 'Url'),
            Field('thumbnail', type='upload',
            uploadfolder=uploadfolder),
            table_name='projects',
            submit_button=T('CREATE')
            )

        if form.accepts(request.vars):
            person = _get_person()
            person_id = person["person_id"]

            if form.vars.thumbnail:
                image_name = self.convertImage(form.vars.thumbnail,uploadfolder)
            else:
                image_name = None

            project_id = Project.insert(
                            created_by=person_id,
                            name=form.vars.name,
                            description=form.vars.description,
                            url=form.vars.url,
                            date_=datetime.now(),
                            thumbnail=image_name,
                            )
            Sharing.insert(project_id=project_id,
                           person_id=person_id,
                           role_id=2,
                           )
            redirect(URL(f="product_backlog",args=[project_id]))

        elif form.errors:
            response.flash = T('form has errors')

        return form


    def convertImage(self,base64txt,uploadfolder):
        import os
        import base64

        arglen = len(base64txt)
        if arglen > 1:
            b64file = open(uploadfolder+base64txt, 'rb').read()
            if b64file.startswith("data:image/png;base64,"):
                b64file = b64file[22:]
            imgData = base64.b64decode(b64file)
            file_name = os.path.splitext(base64txt)
            fname = file_name[0] + '.png'

            # write image on filesystem
            imgFile = open(uploadfolder+fname, 'wb')
            imgFile.write(imgData)
            os.remove(uploadfolder+base64txt)
            return fname
        else:
            return False

    def projects(self):
        import json

        user_relationship = db(db.user_relationship.auth_user_id==auth.user.id).select().first()
        person_id = user_relationship.person_id

        person = db(Person.id == person_id).select().first()

        if request.args(0) and person.last_projects:
            # on page project
            project_id = int(request.args(0))
            order = json.loads(person.last_projects)

            if order[0] == project_id:
                final_order = order
            else:
                final_order = [project_id]
                for project in order:
                    if project != project_id and len(final_order) < 5:
                        final_order.append(project)

                jsonstring = json.dumps(final_order)
                db(Person.id == person_id).update(last_projects=jsonstring)

            last_projects = self.lastProjectsData(final_order, project_id)

        elif request.args(0):
            # on page project
            project_id = int(request.args(0))
            last_projects = self.withouOrder(person_id, project_id)

        elif person.last_projects:
            # on index
            order = json.loads(person.last_projects)
            last_projects = self.lastProjectsData(order)

        else:
            # on index
            last_projects = db( (Sharing.person_id == person_id) &
                        (Project.id == Sharing.project_id ) ).select(orderby=~Project.id,limitby=(0, 4))


        return dict(last_projects=last_projects)


    def lastProjectsData(self, final_order, project_id=""):
        if project_id == "" and len(final_order) == 5:
            final_order.pop()

        last_projects = []
        for i in final_order:
            if i != project_id:
                last_projects.append({"project":db(Project.id == i).select().first(), \
                                    "sharing":db(Sharing.project_id == i).select().first()})

        return last_projects


    def withouOrder(self, person_id, project_id):
        import json

        last_projects = db( (Sharing.person_id == person_id) &
                        (Project.id == Sharing.project_id ) ).select(orderby=~Project.id,limitby=(0, 5))

        order = [project_id]
        for project in last_projects:
            if project["project"]["id"] != project_id:
                order.append(project["project"]["id"])

        jsonstring = json.dumps(order)
        db(Person.id == person_id).update(last_projects=jsonstring)

        reordered_projects = []
        for n,i in enumerate(last_projects):
            if n < 4:
                reordered_projects.append(i)

        return reordered_projects