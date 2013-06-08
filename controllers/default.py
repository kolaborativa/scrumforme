# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a samples controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################


# ===========
#  PAGE HOME
# ===========

def index():
    return dict(form=auth.login())


def nojs():
    return dict(message=T("JavaScript must be enabled for you to use Scrumforme"))


@auth.requires_login()
def _get_person(project_id=''):
    """Function that get data of relationship person of the user logged. Projects, person_id and shared.
    """
    user_relationship = db(db.user_relationship.auth_user_id==auth.user.id).select().first()
    person_id = user_relationship.person_id

    own_projects = db(Project.created_by==person_id).select()
    # own_projects = db(Project.created_by==person_id).select(orderby=Project.position_dom)
    all_person_shared = db(Sharing.person_id==person_id).select()

    id_own_projects = [i.id for i in own_projects]
    all_shared = [i for i in all_person_shared if not i.project_id in id_own_projects]

    shared_with = False
    if project_id:
        for i in all_shared:
            if int(project_id) == i.project_id:
                shared_with = i
                break

    return dict(
                person_id=person_id,
                own_projects=own_projects,
                all_shared_with=all_shared,
                shared_with=shared_with
                )


# ==============
#  PAGE PROJECS
# ==============

@auth.requires_login()
def projects():
    """This function receives the data used in the global class G_projects in
    this header on all pages
    """
    person = _get_person()
    own_projects = person["own_projects"]
    all_shared_with = person["all_shared_with"]
    return dict(own_projects=own_projects,all_shared_with=all_shared_with)


def delete_project():
    """Function that delete a project
    """
    import subprocess
    upload_folder = '%sstatic/uploads' % request.folder

    project_id = int(request.vars['project_id'])
    person = _get_person(project_id)
    person_id = person["person_id"]
    project = db(Project.id==project_id).select().first()

    if project:
        if person_id == project.created_by:
            db(Project.id==project.id).delete()
            # Delete a image of project
            subprocess.call('rm %s/%s' % (upload_folder, project.thumbnail), shell=True)
    redirect(URL('projects'))


# ======================
#  PAGE PRODUCT BACKLOG
# ======================

@auth.requires_login()
def product_backlog():
    response.title = T("Product Backlog")
    project_id = request.args(0) or redirect(URL('projects'))
    project = db(Project.id == project_id).select().first() or redirect(URL('projects'))
    person = _get_person(project_id)
    person_id = person["person_id"]
    shared = person["shared_with"]

    if project.created_by == person_id or shared.person_id == person_id:

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

        have_permission = False
        # if user is a PO or Scrum Master
        role = [1,2]
        if project.created_by == person_id or shared.project_admin == True or shared.role_id in role:
            have_permission = True

        # response message for view
        response.flash = session.message
        try:
            del session.message
        except:
            pass
        sprint = db( (Sprint.project_id == project.id) & (Sprint.ended == None) ).select().first()

        if hasattr(sprint,"started"):
            stories = db( ((Story.project_id == project.id) & (Story.sprint_id == None)) | \
                          ((Story.project_id == project.id) & (Story.sprint_id == sprint.id)) \
                          ).select(orderby=Story.position_dom)
        else:
            stories = db( (Story.project_id == project.id) & \
                          (Story.sprint_id == None) ).select(orderby=Story.position_dom)

        if stories:
            definition_ready = {}
            for story in stories:
                definition_ready[story.id] = db(Definition_ready.story_id == story.id).select()

            tasks = {}
            for row in definition_ready:
                for df in definition_ready[row]:
                    tasks[df.id] = db(Task.definition_ready_id == df.id).select()

            return dict(
                        project=project,
                        stories=stories,
                        definition_ready=definition_ready,
                        tasks=tasks,
                        form_sprint=form_sprint,
                        sprint=sprint,
                        have_permission=have_permission,
                        )
        else:
            return dict(
                        project=project,
                        form_sprint=form_sprint,
                        sprint=sprint,
                        have_permission=have_permission,
                        )

    else:
        redirect(URL('projects'))


# ============
#  PAGE BOARD
# ============

@auth.requires_login()
def board():
    response.title = T("Board")
    project_id = request.args(0) or redirect(URL('projects'))
    project = db(Project.id == project_id).select().first() or redirect(URL('projects'))

    person = _get_person(project_id)
    person_id = person["person_id"]
    shared = person["shared_with"]

    if project.created_by == person_id or shared.person_id == person_id:

        sprint = db( (Sprint.project_id == project.id) & (Sprint.ended == None) ).select().first()

        if hasattr(sprint,"started") and sprint.started:
            stories = db( (Story.project_id == project.id) & \
                          (Story.sprint_id == sprint.id) ).select(orderby=Story.position_dom)
            if stories:
                definition_ready = {}
                for story in stories:
                    if not story.story_points:
                        session.message = T("Put all the story points before going to the Board")
                        redirect(URL(f='product_backlog', args=project_id))
                    definition_ready[story.id] = db(Definition_ready.story_id == story.id).select()

                tasks = {}
                for row in definition_ready:
                    for df in definition_ready[row]:
                        tasks[df.id] = db(Task.definition_ready_id == df.id).select(orderby=~Task.id)

                card_comments = {}
                for row in tasks:
                    for task in tasks[row]:
                        card_comments[task["id"]] = db(Task_comment.task_id == task["id"]).select()

                team_members = db( (db.user_relationship.person_id==Sharing.person_id) & \
                                   (Sharing.project_id == project_id) ) \
                                   .select(Sharing.ALL, db.user_relationship.auth_user_id)

                return dict(project=project,
                            person_id=person_id,
                            team_members=team_members,
                            stories=stories,
                            definition_ready=definition_ready,
                            tasks=tasks,
                            card_comments=card_comments,
                            sprint=sprint
                            )
            else:
                session.message = T("You must create at least one story and move it to the column Sprint")
                redirect(URL(f='product_backlog', args=project_id))
        else:
            session.message = T("You must create and launch the sprint before accessing the Board")
            redirect(URL(f='product_backlog', args=project_id))

    else:
        redirect(URL('projects'))


# ==============
#  PAGE SPRINTS
# ==============

@auth.requires_login()
def sprints():
    response.title = T("Sprints")
    project_id = request.args(0) or redirect(URL('projects'))
    sprints = db( (Sprint.project_id == project_id) & (Sprint.ended != None) ).select(orderby=~Sprint.ended)
    person = _get_person(project_id)
    person_id = person["person_id"]
    shared = person["shared_with"]
    project = db(Project.id==project_id).select().first()

    if project.created_by == person_id or shared.person_id == person_id:
        if sprints:
            stories = {}
            for sprint in sprints:
                stories[sprint.id] = db( (Story.project_id == project_id) & \
                                         (Story.concluded == True) & \
                                         (Story.sprint_id == sprint.id) ).select()

            definition_ready = {}
            for story in stories:
                for i in stories[story]:
                    definition_ready[i.id] = db(Definition_ready.story_id == i.id).select()

            tasks = {}
            for row in definition_ready:
                for df in definition_ready[row]:
                    tasks[df.id] = db(Task.definition_ready_id == df.id).select(orderby=~Task.id)

            card_comments = {}
            for row in tasks:
                for task in tasks[row]:
                    card_comments[task["id"]] = db(Task_comment.task_id == task["id"]).select()

            team_members = db( (db.user_relationship.person_id==Sharing.person_id) & \
                               (Sharing.project_id == project_id) ) \
                               .select(Sharing.ALL, db.user_relationship.auth_user_id)

            return dict(
                        project=project,
                        sprints=sprints,
                        stories=stories,
                        definition_ready=definition_ready,
                        tasks=tasks,
                        card_comments=card_comments,
                        team_members=team_members,
                        )

        else:
            session.message = T("No history of sprints because no sprint ended yet.")
            redirect(URL(f='product_backlog', args=[project_id]))


    redirect(URL('projects'))


# =================
#  PAGE STATISTICS
# =================

def statistics():
    response.title = T("Statistics")
    project_id = request.args(0) or redirect(URL('projects'))
    project = db(Project.id == project_id).select().first() or redirect(URL('projects'))

    person = _get_person(project_id)
    person_id = person["person_id"]
    shared = person["shared_with"]

    if project.created_by == person_id or shared.person_id == person_id:
        sprint = db(Sprint.project_id == project.id).select().first()
        stories = db((Story.project_id == project.id) & (Story.sprint_id >0)).select()

        if sprint != None and sprint.started:
            if stories:
                least_one_story = False
                for story in stories:
                    # requires at least one story on Sprint
                    if story.sprint_id:
                        least_one_story = True
                        # requires story points for story on Sprint
                        if not story.story_points:
                            session.message = T("Put all the story points before going to the Statistics")
                            redirect(URL(f='product_backlog', args=project_id))

                if not least_one_story:
                    session.message = T("Move at least one story in the column of the Sprint")
                    redirect(URL(f='product_backlog', args=project_id))

                burndown_chart = db(Burndown.sprint_id == sprint.id).select(orderby=Burndown.date_)

                return dict(project=project,
                            sprint=sprint,
                            stories=stories,
                            burndown_chart=burndown_chart
                            )

            else:
                session.message = T("You must create stories for your project")
                redirect(URL(f='product_backlog', args=project_id))

        else:
            session.message = T("You must create and start the sprint before accessing the Statistics")
            redirect(URL(f='product_backlog', args=project_id))

    else:
        redirect(URL('projects'))


# ===========
#  PAGE TEAM
# ===========

@auth.requires_login()
def team():
    response.title = T("Team")
    project_id=request.args(0) or redirect(URL('projects'))
    person = _get_person(project_id)
    person_id = person["person_id"]
    shared = person["shared_with"]

    project = db(Project.id==project_id).select().first()
    roles = db(Role).select()

    team_members = db(  (db.user_relationship.person_id==Sharing.person_id) & \
                        (Sharing.project_id == project_id) ) \
                        .select(Sharing.ALL, db.user_relationship.auth_user_id)

    project_admins = [a.sharing.person_id for a in team_members if a.sharing.project_admin]

    if project.created_by == person_id or shared.person_id == person_id:
        if request.vars:
            if request.vars.project_admin and len(request.vars.keys()) > 1:
                project_admin = request.vars.keys()[0]
                person_id = request.vars.keys()[1]
                role_id = request.vars.values()[1]
                _edit_role(project_id, person_id, role_id, project_admin)

            else:
                person_id = request.vars.keys()[0]
                role_id = request.vars.values()[0]

                _edit_role(project_id, person_id, role_id)

            redirect(URL(f='team', args=[project_id]))

        return dict(
                project=project,
                team_members=team_members,
                roles=roles,
                owner_project=project.created_by == person_id,
                owner_project_person_id=project.created_by,
                project_admin=person_id in project_admins
                )

    redirect(URL('projects'))


@auth.requires_login()
def burndown_chart_test(story_project_id, definition_ready_story):
    from datetime import datetime

    # if story is completed
    if definition_ready_story:

        tasks_date = {}
        for d in definition_ready_story:
            # get the biggest date of each definition of ready
            tasks_date[d.id] = db(Task.definition_ready_id == d.id ) \
                                        .select(Task.ended.max()) \
                                        .first()['_extra']['MAX(task.ended)']

        # get the biggest task date of all definition of ready of this story
        bigger_date = max([tasks_date[x] for x in tasks_date])
        # stories = db(Story.id == story_id).select()
        stories = db((Story.project_id == story_project_id) & (Story.sprint_id >0)).select()

        sprint_id = 0
        concluded_stories = 0
        for story in stories:
            if story.concluded == True:
                concluded_stories += story.story_points
                sprint_id = story.sprint_id

        db_burndown = db(Burndown.date_ == datetime.now()).select().first()

        if db_burndown:
            db(Burndown.id == db_burndown.id).update(
                date_=bigger_date,
                points=concluded_stories,
            )
        else:
            Burndown.insert(
                sprint_id=sprint_id,
                date_=bigger_date,
                points=concluded_stories,
            )

        return True

    else:
        stories = db((Story.project_id == story_project_id) & (Story.sprint_id >0)).select()

        sprint_id = 0
        concluded_stories = 0
        for story in stories:
            sprint_id = story.sprint_id
            if story.concluded == True:
                concluded_stories += story.story_points

        db_burndown = db(Burndown.date_ == datetime.now()).select().first()

        if db_burndown:
            db(Burndown.id == db_burndown.id).update(
                points=concluded_stories,
            )
        else:
            Burndown.insert(
                sprint_id=sprint_id,
                date_=datetime.now(),
                points=concluded_stories,
            )

        return False


@auth.requires_login()
def _create_person():
    """Function that creates a person
    """
    name = '%s %s' % (auth.user.first_name, auth.user.last_name)
    person_id = Person.insert(name=name)
    db.user_relationship.insert(auth_user_id=auth.user.id, person_id=person_id)
    redirect(URL('projects'))


@auth.requires_login()
def get_persons_add():
    project_id = request.vars['project_id']
    team = [i.person_id for i in db(Sharing.project_id==project_id).select()]
    term=request.vars.q
    rows = db(Person.name.lower().like(term+'%')).select()
    persons = [{"id": person.id, "title": person.name} for person in rows if not person.id in team ]

    return dict(total= len(persons), persons=persons)


@auth.requires_login()
def add_member():
    if request.vars['persons_id']:

        project_id = request.vars['project_id']
        persons_id = request.vars['persons_id'].split(',')
        person = _get_person(project_id)
        person_id = person["person_id"]

        project = db(Project.id==project_id).select().first()
        shared = db(Sharing.person_id==person_id).select().first()

        if project.created_by == person_id or shared.project_admin == True:
            for person in persons_id:
                Sharing.insert(project_id=project_id,
                               person_id=int(person),
                               )

    redirect(URL(f='team', args=[request.vars['project_id']]))


@auth.requires_login()
def remove_member():
    project_id = request.vars['project_id']
    person_id = request.vars['person_id']
    person = _get_person(project_id)
    my_person_id = person["person_id"]

    project = db(Project.id==project_id).select().first()
    shared = db(Sharing.person_id==my_person_id).select().first()

    # remove task owner
    task_person = db(Task.owner_task == person_id).select()
    if task_person:
        for task in task_person:
            db(Task.owner_task == task.owner_task).update(
                owner_task=None,
            )
    # remove person of a project
    if project.created_by == my_person_id or shared.project_admin == True:
        db((Sharing.project_id==project_id) & (Sharing.person_id==person_id)).delete()

    redirect(URL(f='team', args=[project_id]))



@auth.requires_login()
def _edit_role(project_id, person_id, role_id, project_admin=False):
    try:
        db((Sharing.project_id==project_id) & \
            (Sharing.person_id==person_id)).update(
                                                role_id=role_id,
                                                project_admin=project_admin
                                                )
    except:
        redirect(URL(f='team', args=[project_id]))
    return


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

    if 'login' in request.args or 'register' in request.args:
        form_login = auth.login()
        form_register = auth.register()
        return dict(form_login=form_login, form_register=form_register)

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



# =================
#  BOARD FUNCTIONS
# =================


@auth.requires_login()
def remove_board_task():
    """Receive request.vars.pk, request.vars.definitionready and
    request.vars.project_id
    """
    if request.vars.pk:
        data_task = dict(
                        task_id = request.vars.pk,
                        definitionready_id = request.vars.definitionready,
                        project_id = request.vars.project_id,
                    )

        return _remove_task(data_task)

    else:
        return False


@auth.requires_login()
def move_tasks():
    # board page
    from datetime import datetime

    if request.vars.task_status and request.vars.definitionready:
        # update status of task if in progress
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
        # update status of task if in todo or verification
        elif request.vars.task_status == "todo" or request.vars.task_status == "verification":
            db(Task.id == request.vars.task_id).update(
                status=request.vars.task_status,
                ended=None,
            )
        # update status of task if in done
        elif request.vars.task_status == "done":
            db(Task.id == request.vars.task_id).update(
                status=request.vars.task_status,
                ended=datetime.today().date()
            )
        # if the request.vars.task does not meet the requirements
        else:
            return False

        # updates the status of story
        _test_story_completed(request.vars.definitionready, request.vars.task_status)

        # call realtime
        data_realtime = dict(
                    page=request.vars.page,
                    definition_ready_id=request.vars.definitionready,
                    project_id=request.vars.project_id,
                    )
        _realtime_update(data_realtime)

        return True

    else:
        return False


@auth.requires_login()
@service.json
def _team_project():
    if request.vars.project_id:

        team_members = db(  (db.user_relationship.person_id==Sharing.person_id) & \
                            (Sharing.project_id == request.vars.project_id) ) \
                            .select(Sharing.ALL, db.user_relationship.auth_user_id)

        if team_members:
            count = 0
            project = {}
            for member in team_members:
                if member.sharing.role_id:
                    project["%s"%count] = {}

                    project["%s"%count]["person_name"]=member.sharing.person_id.name
                    project["%s"%count]["person_role"]=T(member.sharing.role_id.name)
                    project["%s"%count]["person_id"]=member.sharing.person_id
                    project["%s"%count]["avatar"]=Gravatar(member.user_relationship.auth_user_id.email).thumb

                    count += 1

                elif not member.sharing.role_id:
                    return dict(no_role=True)

            return project

        else:
            return dict(no_team=True)

    else:
        return dict(no_team=True)


@auth.requires_login()
def _edit_owner_task():
    if request.vars.person_id:
        if request.vars.person_id == "remove":
            db(Task.id == request.vars.task_id).update(
                owner_task=None,
            )
        else:
            db(Task.id == request.vars.task_id).update(
                owner_task=request.vars.person_id,
            )

        return True

    else:
        return False


@auth.requires_login()
@service.json
def _card_modal():
    if request.vars.task_id:
        task = db( (Task.id == request.vars.task_id) & \
                   (User_relationship.person_id == Task.owner_task) & \
                   (Sharing.person_id == Task.owner_task) ) \
                   .select(Task.ALL, User_relationship.auth_user_id, Sharing.role_id).first()

        if task:
            task.user_relationship.avatar = Gravatar(task.user_relationship.auth_user_id.email, size=120).thumb
            task.task.started = g_blank_fulldate_check(task.task.started)
            task.sharing.role_name = task.sharing.role_id.name
            task.user_relationship.member_name = "%s %s" \
                            %(task.user_relationship.auth_user_id.first_name, \
                            task.user_relationship.auth_user_id.last_name)

            # comments of this card
            task_comments = db(Task_comment.task_id == request.vars.task_id).select()
            comments ={}
            if task_comments:
                for i in task_comments:
                    person = db( (User_relationship.person_id == i.owner_comment) & \
                           (Sharing.project_id == request.vars.project_id) &\
                           (Sharing.person_id == i.owner_comment) ) \
                           .select(User_relationship.auth_user_id, Sharing.role_id).first()

                    name = "%s %s" %(person.user_relationship.auth_user_id.first_name, \
                                    person.user_relationship.auth_user_id.last_name)
                    comments[i.id] = {
                            "role":T(person.sharing.role_id.name),
                            "avatar":Gravatar(person.user_relationship.auth_user_id.email, size=120).thumb,
                            "name":name,
                            "text":i.text_,
                            "date":i.date_.strftime("%d/%m/%Y %H:%M"),
                            "person_id":i.owner_comment,
                            }

            task["comments"] = comments
            return task

        else:
            return False

    else:
        return False


@auth.requires_login()
@service.json
def _card_new_comment_or_update():
    if request.vars.new_comment:
        person = db( (User_relationship.auth_user_id == auth.user.id) & \
                     (Sharing.person_id == request.vars.person_id) ).select().first()
        if person:
            from datetime import datetime
            d = datetime.now()

            new_comment_id = Task_comment.insert(
                                task_id=request.vars.task_id,
                                text_=request.vars.new_comment,
                                date_=d,
                                owner_comment=person.user_relationship.person_id
                            )
            person.user_relationship.avatar = Gravatar(person.user_relationship.auth_user_id.email, size=50).thumb
            person.sharing.role_name = str(T(person.sharing.role_id.name))
            person.user_relationship.member_name = "%s %s" %(person.user_relationship.auth_user_id.first_name,person.user_relationship.auth_user_id.last_name)
            person.comment = request.vars.new_comment
            person.date_comment = d.strftime("%d/%m/%Y %H:%M")
            person.new_comment_id = new_comment_id

        return person

    elif request.vars.update_comment:
        comment = db(Task_comment.id == request.vars.comment_id).select().first()

        if int(comment.owner_comment) == int(request.vars.person_id):
            db(Task_comment.id == request.vars.comment_id).update(
                text_=request.vars.update_comment,
            )

            return request.vars.update_comment

        else:
            return False


    else:
        return False


@auth.requires_login()
@service.json
def _card_delete_comment():
    if request.vars.task_comment_id and not request.vars.task_comment_id == "undefined":
        comment = db(Task_comment.id == request.vars.task_comment_id).select().first()

        if int(comment.owner_comment) == int(request.vars.person_id):
            db(Task_comment.id == request.vars.task_comment_id).delete()

            return True

        else:
            return False

    else:
        return False


@auth.requires_login()
def _delete_all_comments(task_id):
    if task_id:
        all_comments = db(Task_comment.task_id == task_id).select()

        for comment in all_comments:
            db(Task_comment.id == comment.id).delete()

        return True

    else:
        return False


@auth.requires_login()
@service.json
def _update_task_date():
    if request.vars.task_id:
        from datetime import datetime
        db(Task.id == request.vars.task_id).update(
            started=datetime.strptime(request.vars.task_date,'%Y-%m-%d')
        )
        raw_date = request.vars.task_date.split("-")
        date_formated = "%s/%s/%s" %(raw_date[2],raw_date[1],raw_date[0])
        return date_formated

    else:
        return False


@auth.requires_login()
@service.json
def chat_all_users():
    if request.vars.project_id:

        team_members = db(  (db.user_relationship.person_id==Sharing.person_id) & \
                            (Sharing.project_id == request.vars.project_id) ) \
                            .select(Sharing.ALL, db.user_relationship.auth_user_id)

        if team_members:
            project = {}
            for n,member in enumerate(team_members):
                project[n] = {}

                if member.sharing.role_id:
                    project[n]["person_role"]=T(member.sharing.role_id.name)
                else:
                    project[n]["person_role"]=T("No role")

                project[n]["person_name"]=member.sharing.person_id.name
                project[n]["person_id"]=member.sharing.person_id
                project[n]["avatar"]=Gravatar(member.user_relationship.auth_user_id.email).thumb

            return project

        else:
            return dict(no_team=True)

    else:
        return dict(no_team=True)


@auth.requires_login()
@service.json
def send_message_chat_group():
    if request.vars.chat:
        from datetime import datetime

        data_realtime = dict(
            chat=request.vars.chat,
            name=request.vars.name,
            message=request.vars.message,
            time=datetime.now().strftime("%H:%M %d/%m/%Y"),
            avatar=request.vars.avatar,
            project_id=request.vars.project_id,
            )
        _realtime_update(data_realtime)


@auth.requires_login()
@service.json
def user_online_now():
    if request.vars.person_id:
        data_realtime = dict(
            online=request.vars.online,
            person_id=request.vars.person_id,
            project_id=request.vars.project_id,
            )
        _realtime_update(data_realtime)


# ===================
#  BACKLOG FUNCTIONS
# ===================


@auth.requires_login()
def launch_or_end_sprint():
    from datetime import datetime

    project_id = request.args(0) or redirect(URL('projects'))
    sprint_id = request.args(1) or redirect(URL('projects'))
    sprint = db(Sprint.id==sprint_id).select().first()

    if not sprint.started:
        db(Sprint.id==sprint_id).update(started=datetime.today().date())

    elif sprint.started:
        stories = db( (Story.sprint_id==sprint_id) & ((Story.concluded == None) | (Story.concluded == False)) ).select()
        for story in stories:
            # send story to backlog
            db(Story.id == story.id).update(sprint_id=None)

        # close sprint
        db(Sprint.id==sprint_id).update(ended=datetime.today().date())

    redirect(URL(f='product_backlog', args=project_id))


@auth.requires_login()
def remove_backlog_itens():

    if request.vars.name == "task":
        data_task = dict(
                        task_id = request.vars.pk,
                        definitionready_id = request.vars.definitionready,
                        project_id = request.vars.project_id,
                    )

        return _remove_task(data_task)

    elif request.vars.name == "definition_ready":
        # delete definition of ready
        db(Definition_ready.id == request.vars.pk).delete()
        all_tasks = db(Task.definition_ready_id == request.vars.pk).select()

        for task in all_tasks:
            # remove all tasks
            db(Task.id == task.id).delete()
            # remove all comments of this task
            _delete_all_comments(task.id)
        # updates the status of story

        return True

    elif request.vars.name == "story":
        db(Story.id == request.vars.pk).delete()
        all_definitions_data = db(Definition_ready.story_id == request.vars.pk).select()

        for df in all_definitions_data:
            db(Definition_ready.id == df.id).delete()
            task = db(Task.definition_ready_id == df.id).select().first()
            # remove task
            db(Task.definition_ready_id == df.id).delete()
            # remove all comments of this task
            _delete_all_comments(task.id)

        return True

    else:
        return False


@auth.requires_login()
def change_stories():

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
                    if v != "order" and v != "sprint_id" and v != "project_id":
                        parse = urllib.unquote(request.vars[v].encode('ascii')).decode('utf-8')
                        new_list = parse.split("&")
                        story_id = new_list[0].split("=")
                        story_order = new_list[1].split("=")

                        db(Story.id == story_id[1]).update(
                            position_dom=story_order[1],
                        )

            # call realtime
            data_realtime = dict(
                page="product_backlog",
                project_id=request.vars.project_id,
                )

            _realtime_update(data_realtime)

        return True
    else:
        return False


# =============================
#  BACKLOG AND BOARD FUNCTIONS
# =============================

@auth.requires_login()
def _edit_project_name():
    db(Project.id == request.vars.dbID).update(
        name=request.vars.value,
    )
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _edit_project_description():
    db(Project.id == request.vars.dbID).update(
        description=request.vars.value,
    )
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _edit_project_url():
    db(Project.id == request.vars.dbID).update(
        url=request.vars.value,
    )
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _create_story():
    database_id = Story.insert(
            project_id=request.vars.pk,
            title=request.vars.value,
            position_dom=request.vars.order
            )
    return dict(success="success",msg="successfully saved!",name=request.vars.name,database_id=database_id)


@auth.requires_login()
def _create_definition_ready():
    database_id = Definition_ready.insert(
            story_id=request.vars.pk,
            title=request.vars.value
            )
    return dict(success="success",msg="successfully saved!",name=request.vars.name,database_id=database_id)


@auth.requires_login()
def _create_task():
    database_id = Task.insert(
            definition_ready_id=request.vars.pk,
            title=request.vars.value,
            status="todo"
            )
    # updates the status of story
    _test_story_completed(request.vars.definitionready, "todo")
    # call realtime
    _create_task_realtime()

    return dict(success="success",msg="successfully saved!",name=request.vars.name,database_id=database_id)


@auth.requires_login()
def _edit_story():
    db(Story.id == request.vars.dbID).update(
        title=request.vars.value,
    )
    _update_item_realtime()
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _edit_definition_ready():
    db(Definition_ready.id == request.vars.dbID).update(
        title=request.vars.value,
    )
    _update_item_realtime()
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _edit_task():
    db(Task.id == request.vars.dbID).update(
        title=request.vars.value,
    )
    _update_item_realtime()
    return dict(success="success",msg="successfully saved!")


@auth.requires_login()
def _create_task_realtime():
    data_realtime = dict(
                page=request.vars.page,
                definition_ready_id=request.vars.definitionready,
                project_id=request.vars.project_id,
                )

    _realtime_update(data_realtime)


@auth.requires_login()
def _update_item_realtime():
    data_realtime = dict(
                page=request.vars.page,
                project_id=request.vars.project_id,
                )

    _realtime_update(data_realtime)


@auth.requires_login()
@service.json
def create_or_update_itens():
    """Function that creates or updates items. Receive updates if request.vars.dbUpdate
    and takes the ID to be updated with request.vars.dbID
    """

    if request.vars:
         # updating tasks
        if request.vars.dbUpdate == "true":
            update = {
                "story" : _edit_story,
                "definition_ready" : _edit_definition_ready,
                "task" : _edit_task,
                "project_name" : _edit_project_name,
                "project_description" : _edit_project_description,
                "project_url" : _edit_project_url,
            }

            return update[request.vars.name]()

        # creating tasks
        elif request.vars.dbUpdate == "false":
            create = {
                "story" : _create_story,
                "definition_ready" : _create_definition_ready,
                "task" : _create_task,
            }

            return create[request.vars.name]()

        else:
            return dict(error="error",msg="error writing!")

    else:
        return dict(error="error",msg="error writing!")



# ====================
#  INTERNAL FUNCTIONS
# ====================


@auth.requires_login()
def _remove_task(data):
    if data:
        db(Task.id == data["task_id"]).delete()
        # remove all comments of this task
        _delete_all_comments(data["task_id"])
        # updates the status of story
        _test_story_completed(data["definitionready_id"], "remove")

        # call realtime
        data_realtime = dict(
                        page="board",
                        definition_ready_id=data["definitionready_id"],
                        project_id=data["project_id"],
                        )
        _realtime_update(data_realtime)

        return True
    else:
        return False


@auth.requires_login()
def _realtime_update(element):
    try:
        from gluon.contrib.websocket_messaging import websocket_send
        import json

        data = json.dumps(element)
        projectID = "project%s" %element["project_id"]
        websocket_send('http://localhost:8888', data, 'mykey', projectID)
    except:
        pass


@auth.requires_login()
def _test_story_completed(definition_ready_id, status):

    definition = db(Definition_ready.id == definition_ready_id).select().first()
    story = db(Story.id == definition.story_id).select().first()

    if status == "done" or status == "remove":
        tasks_definition_ready = db(Task.definition_ready_id == definition_ready_id).select()
        tasks_len = len(tasks_definition_ready)
        tasks_ended = 0

        for t in tasks_definition_ready:
            if t.ended:
                tasks_ended += 1

        # updates the status of definition of ready to concluded
        if tasks_ended == tasks_len:
            db(Definition_ready.id == definition_ready_id).update(
                concluded=True,
            )

            definition_ready_story = db(Definition_ready.story_id == definition.story_id).select()
            definitions_len = len(definition_ready_story)
            definitions_concluded = 0

            for d in definition_ready_story:
                if d.concluded:
                    definitions_concluded += 1

            # updates the status of story to concluded
            if definitions_len == definitions_concluded:
                db(Story.id == definition.story_id).update(
                    concluded=True,
                )

                # add points in the date of sprint
                burndown_chart_test(story.project_id, definition_ready_story)

                return True

            else:
                return False

    elif status == "todo" or status == "inprogress":
        # changes the Definition of Ready status for uncompleted
        db(Definition_ready.id == definition_ready_id).update(
            concluded=False,
        )
        # changes the Story status for uncompleted
        db(Story.id == story.id).update(
            concluded=False,
        )

        # add points in the date of sprint
        burndown_chart_test(story.project_id, False)

        return False

