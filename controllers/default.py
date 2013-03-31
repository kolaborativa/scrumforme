# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a samples controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simple replace the two lines below with:
    return auth.wiki()
    """
    response.flash = T("Welcome to scrumforme!")
    return dict()


def all_projects():
    from datetime import datetime

    all_projects = db(Project).select()

    form = SQLFORM.factory(
        Field('name', label=T('Name'), requires=IS_NOT_EMPTY(error_message=T('The field name can not be empty!'))),
        Field('description', label= T('Description')),
        Field('url', label= 'Url'),
        table_name='all_projects',
        submit_button=T('CREATE')
        )

    if form.accepts(request.vars):
        Project.insert(
                        name=form.vars.name,
                        description=form.vars.description,
                        url=form.vars.url,
                        date_=datetime.now(),
                        )
        redirect(URL('all_projects'))
    elif form.errors:
        response.flash = T('Formulário contem erros. Por favor, verifique!')

    return dict(form=form, all_projects=all_projects)


def project():
    project_id = request.args(0) or redirect(URL('all_projects'))
    project = db(Project.id == project_id).select()

    stories = db(Story.project_id == project_id).select()
    sprint = db(Sprint.project_id == project_id).select().first()

    form_sprint = SQLFORM.factory(
        Field('name', label='Name'),
        Field('weeks', label='Weeks'),
        Field('stories', label='Stories'),
        submit_button=T('CREATE')
        )

    if form_sprint.process().accepted:
        name = form_sprint.vars['name']
        weeks = form_sprint.vars['weeks']
        stories_id = form_sprint.vars['stories'].split(',')

        sprint_id = Sprint.insert(project_id=project_id,
            name=name, weeks=weeks)

        for story_id in stories_id:
            db(Story.id==story_id).update(sprint_id=sprint_id)


    form_story = SQLFORM(
        Story,
        fields=['title', 'benefit', 'story_points'],
        submit_button=T('CREATE')
    )

    if form_story.process().accepted:
        db(Story.id == form_story.vars.id).update(
            project_id=project_id,
        )
        redirect(URL(f='project',args=project_id))

    elif form_story.errors:
        response.flash = T('Formulário contem erros. Por favor, verifique!')

    if stories:
        return dict(project=project, form_story=form_story, stories=stories, form_sprint=form_sprint, sprint=sprint)
    else:
        return dict(project=project, form_story=form_story, form_sprint=form_sprint, sprint=sprint)

def launch_sprint():
    from datetime import datetime
    sprint_id = request.args(0) or redirect(URL('index'))
    sprint = db(Sprint.id==sprint_id).select().first()
    if not sprint.started:
        db(Sprint.id==sprint_id).update(started=datetime.today().date())
    redirect(URL(f='all_projects'))

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    return dict(form=auth())


def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


@auth.requires_signature()
def data():
    """
    http://..../[app]/default/data/tables
    http://..../[app]/default/data/create/[table]
    http://..../[app]/default/data/read/[table]/[id]
    http://..../[app]/default/data/update/[table]/[id]
    http://..../[app]/default/data/delete/[table]/[id]
    http://..../[app]/default/data/select/[table]
    http://..../[app]/default/data/search/[table]
    but URLs must be signed, i.e. linked with
      A('table',_href=URL('data/tables',user_signature=True))
    or with the signed load operator
      LOAD('default','data.load',args='tables',ajax=True,user_signature=True)
    """
    return dict(form=crud())
