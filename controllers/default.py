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

    return dict()

@auth.requires_login()
def _person_projects():
    user_relationship = db(db.user_relationship.auth_user_id==auth.user.id).select().first()
    person_id = user_relationship.person_id

    return db(Project.created_by==person_id).select()


@auth.requires_login()
def _get_person():
    """Function that get person of the user logged.
    Returns the person's id.
    """
    user_relationship = db(db.user_relationship.auth_user_id==auth.user.id).select().first()
    person_id = user_relationship.person_id
    return person_id


@auth.requires_login()
def projects():
    from datetime import datetime
    person_id = _get_person()
    person_projects = _person_projects()

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
        redirect(URL(f="product_backlog",args=[project_id]))
    elif form.errors:
        pass

    return dict(form=form, person_projects=person_projects)


@auth.requires_login()
def product_backlog():
    project_id = request.args(0) or redirect(URL('projects'))
    project = db(Project.id == project_id).select().first() or redirect(URL('projects'))
    person_id = _get_person()
    person_projects = _person_projects()

    if project.created_by == person_id:
        stories = db(Story.project_id == project.id).select(orderby=Story.position_dom)
        sprint = db(Sprint.project_id == project.id).select().first()

        form_sprint = SQLFORM.factory(
            Field('name', label=T('Name'), requires=IS_NOT_EMPTY(error_message=T('The field name can not be empty!'))),
            Field('weeks', label=T('Weeks'), requires=IS_NOT_EMPTY(error_message=T('The field name can not be empty!'))),
            table_name='sprint',
            submit_button=T('CREATE')
            )

        if form_sprint.process().accepted:
            name = form_sprint.vars['name']
            weeks = form_sprint.vars['weeks']

            sprint_id = Sprint.insert(
                                    project_id=project_id,
                                    name=name,
                                    weeks=weeks
                                    )

            redirect(URL(f='product_backlog', args=[project_id]))

        if stories:
            definition_ready = {}
            for story in stories:
                definition_ready[story.id] = db(Definition_ready.story_id == story.id).select()

            tasks = {}
            for row in definition_ready:
                for df in definition_ready[row]:
                    tasks[df.id] = db(Task.definition_ready_id == df.id).select()

            return dict(project=project, person_projects=person_projects, stories=stories, definition_ready=definition_ready, tasks=tasks, form_sprint=form_sprint, sprint=sprint)
        else:
            return dict(project=project, person_projects=person_projects, form_sprint=form_sprint, sprint=sprint)
    redirect(URL('projects'))


@auth.requires_login()
def launch_sprint():
    from datetime import datetime
    sprint_id = request.args(0) or redirect(URL('index'))
    sprint = db(Sprint.id==sprint_id).select().first()
    if not sprint.started:
        db(Sprint.id==sprint_id).update(started=datetime.today().date())
    redirect(URL(f='product_backlog', args=sprint_id))


@auth.requires_login()
def board():
    project_id = request.args(0) or redirect(URL('projects'))
    project = db(Project.id == project_id).select().first() or redirect(URL('projects'))
    person_id = _get_person()
    person_projects = _person_projects()

    if project.created_by == person_id:
        stories = db(Story.project_id == project.id).select(orderby=Story.position_dom)
        sprint = db(Sprint.project_id == project.id).select().first()

        if sprint:
            if stories:
                definition_ready = {}
                for story in stories:
                    definition_ready[story.id] = db(Definition_ready.story_id == story.id).select()

                tasks = {}
                for row in definition_ready:
                    for df in definition_ready[row]:
                        tasks[df.id] = db(Task.definition_ready_id == df.id).select()

                return dict(project=project, person_projects=person_projects, stories=stories, definition_ready=definition_ready, tasks=tasks, sprint=sprint)
            else:
                return dict(project=project, person_projects=person_projects, sprint=sprint)
        else:
            redirect(URL(f='product_backlog', args=project_id))
    redirect(URL('projects'))


@auth.requires_login()
def create_update_backlog_itens():
    """Function that creates or updates items. Receive updates if request.vars.dbUpdate and takes the ID to be updated with request.vars.dbID
    """

    if request.vars:
        if request.vars.dbUpdate == "true":
            if request.vars.name == "story":
                db(Story.id == request.vars.dbID).update(
                    title=request.vars.value,
                )
            elif request.vars.name == "definition_ready":
                db(Definition_ready.id == request.vars.dbID).update(
                    title=request.vars.value,
                )
            elif request.vars.name == "task":
                db(Task.id == request.vars.dbID).update(
                    title=request.vars.value,
                )

            return dict(success="success",msg="gravado com sucesso!")

        elif request.vars.dbUpdate == "false":
            if request.vars.name == "story":
                database_id = Story.insert(
                        project_id=request.vars.pk,
                        title=request.vars.value,
                        position_dom=request.vars.order
                        )
            elif request.vars.name == "definition_ready":
                database_id = Definition_ready.insert(
                            story_id=request.vars.pk,
                            title=request.vars.value
                            )
            elif request.vars.name == "task":
                database_id = Task.insert(
                            definition_ready_id=request.vars.pk,
                            title=request.vars.value,
                            status="todo"
                            )

            return dict(success="success",msg="gravado com sucesso!",name=request.vars.name,database_id=database_id)

    else:
        return dict(error="error",msg="erro ao gravar!")


@auth.requires_login()
def remove_item_backlog_itens():

    if request.vars:
        if request.vars.name == "task":
            db(Task.id == request.vars.pk).delete()

        if request.vars.name == "definition_ready":
            db(Definition_ready.id == request.vars.pk).delete()
            definitions_ready_data = db(Definition_ready.id == request.vars.pk).select()

            for df in definitions_ready_data:
                db(Task.definition_ready_id == df.id).delete()

        elif request.vars.name == "story":
            db(Story.id == request.vars.pk).delete()
            definitions_ready_data = db(Definition_ready.story_id == request.vars.pk).select()

            for df in definitions_ready_data:
                db(Definition_ready.id == df.id).delete()
                db(Task.definition_ready_id == df.id).delete()

        return True
    else:
        return False


@auth.requires_login()
def change_ajax_itens():

    if request.vars:
        # update Story Points
        if request.vars.story_points:
            db(Story.id == request.vars.story_id).update(
                story_points=request.vars.story_points,
            )
        # update Benefit
        elif request.vars.benefit:
            db(Story.id == request.vars.story_id).update(
                benefit=request.vars.benefit,
            )
        # must have created some sprint 
        elif request.vars.sprint_id:
            # send story to sprint
            if request.vars.name == "sprint":
                db(Story.id == request.vars.story_id).update(
                    sprint_id=request.vars.sprint_id,
                )
            # send story to backlog
            elif request.vars.name == "backlog":
                db(Story.id == request.vars.story_id).update(
                    sprint_id=None,
                )
            # update order of a story in DOM
            elif request.vars.order == "order":
                import urllib
                for v in request.vars:
                    if v != "order" and v != "sprint_id":
                        parse = urllib.unquote(request.vars[v].encode('ascii')).decode('utf-8')
                        new_list = parse.split("&")
                        story_id = new_list[0].split("=")
                        story_order = new_list[1].split("=")

                        db(Story.id == story_id[1]).update(
                            position_dom=story_order[1],
                        )

        return True
    else:
        return False


@auth.requires_login()
def board_ajax_itens():
    # board page
    if request.vars:
        from datetime import datetime
        # update status of task
        if request.vars.task_status == "inprogress":
            task = db(Task.id == request.vars.task_id).select().first()

            if task.started:
                # if has a date
                db(Task.id == request.vars.task_id).update(
                    status=request.vars.task_status,
                    ended=None,
                )
            else:
                # if no has date yet
                db(Task.id == request.vars.task_id).update(
                    status=request.vars.task_status,
                    started=datetime.today().date(),
                    ended=None,
                )
                pass

        elif request.vars.task_status == "done":
            db(Task.id == request.vars.task_id).update(
                status=request.vars.task_status,
                ended=datetime.today().date()
            )
        elif request.vars.task_status == "todo" or request.vars.task_status == "verification":
            db(Task.id == request.vars.task_id).update(
                status=request.vars.task_status,
                ended=None,
            )
        elif request.vars.task_date:
            d = request.vars.task_date.split("/")
            started_date = "%s-%s-%s" %(d[2], d[1], d[0])

            db(Task.id == request.vars.task_id).update(
                started=datetime.strptime(started_date,'%Y-%m-%d')
            )
        else:
            return False

        return True
    else:
        return False


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


@auth.requires_login()
def _create_person():
    """Function that creates a person
    """
    name = '%s %s' % (auth.user.first_name, auth.user.last_name)
    person_id = Person.insert(name=name)
    db.user_relationship.insert(auth_user_id=auth.user.id, person_id=person_id)
    redirect(URL('projects'))


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
