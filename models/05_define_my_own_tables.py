if not "person" in db.tables:
    Person = db.define_table("person",
        Field("name", "string", length=128, default=""),
        format='%(name)s',
        migrate="person.table")

if not "auth_user" in db.tables:
    db.define_table("auth_user",
        Field("type_network", "string", length=128, default=""),
        Field("token", "string", length=128, default=""),
        Field("first_time", "boolean", default=True),
        migrate="auth_user.table")

if not "role" in db.tables:
    Role = db.define_table("role",
        Field("name", "string", length=100, default=None),
        format='%(name)s',
        migrate="role.table")

if not "project" in db.tables:
    Project = db.define_table("project",
        Field("created_by", db.person, default=None),
        Field("name", "string", length=128, default=None),
        Field("date_", "date", default=None),
        Field("description", "string", length=256, default=None),
        Field("url", "string", length=128, default=None),
        format='%(name)s',
        migrate="project.table")

if not "sprint" in db.tables:
    Sprint = db.define_table("sprint",
        Field("project_id", db.project, default=None),
        Field("name", "string", length=128, default=None),
        Field("weeks", "integer", default=None),
        Field("started", "date", default=None),
        Field("ended", "date", default=None),
        format='%(name)s',
        migrate="sprint.table")

if not "story" in db.tables:
    Story = db.define_table("story",
        Field("project_id", db.project, default=None),
        Field("sprint_id", db.sprint, default=None),
        Field("title", "string", length=128, default=None),
        Field("benefit", "string", default=None),
        Field("story_points", "integer", default=None),
        Field("position_dom", "integer", default=None),
        Field("concluded", "boolean", default=None),
        format='%(title)s',
        migrate="story.table")

if not "definition_ready" in db.tables:
    Definition_ready = db.define_table("definition_ready",
        Field("story_id", db.story, default=None),
        Field("title", "string", default=None),
        Field("concluded", "boolean", default=None),
        format='%(title)s',
        migrate="definition_ready.table")

if not "task" in db.tables:
    Task = db.define_table("task",
        Field("definition_ready_id", db.definition_ready, default=None),
        Field("title", "string", length=256, default=None),
        Field("started", "date", default=None),
        Field("ended", "date", default=None),
        Field("position_dom", "integer", default=None),
        Field("status", "string", length=128, default=None),
        Field("owner_task", db.person, default=None),
        format='%(title)s',
        migrate="task.table")

if not "task_comment" in db.tables:
    Task_comment = db.define_table("task_comment",
        Field("task_id", db.task, default=None),
        Field("text_", "string", length=256, default=None),
        Field("date_", "datetime", default=None),
        format='%(text)s',
        migrate="task_comment.table")

if not "user_relationship" in db.tables:
    db.define_table("user_relationship",
        Field("auth_user_id", db.auth_user, default=None),
        Field("person_id", db.person, default=None),
        migrate="user_relationship.table")

if not "sharing" in db.tables:
    Sharing = db.define_table("sharing",
        Field("project_id", db.project, default=None),
        Field("person_id", db.person, default=None),
        Field("role_id", db.role, default=None),
        migrate="sharing.table")

if not "burndown" in db.tables:
    Burndown = db.define_table("burndown",
        Field("sprint_id", db.sprint, default=None),
        Field("date_", "date", default=None),
        Field("points", "integer", length=128, default=None),
        migrate="burndown.table")

""" Relations between tables (remove fields you don't need from requires) """
db.project.created_by.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.sprint.project_id.requires = IS_IN_DB(db, 'project.id', db.project._format)
db.story.project_id.requires = IS_IN_DB(db, 'project.id', db.project._format)
db.story.sprint_id.requires = IS_IN_DB(db, 'sprint.id', db.sprint._format)
db.definition_ready.story_id.requires = IS_IN_DB(db, 'story.id', db.story._format)
db.task.definition_ready_id.requires = IS_IN_DB(db, 'definition_ready.id', db.definition_ready._format)
db.task.owner_task.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.task_comment.task_id.requires = IS_IN_DB(db, 'task.id', db.task._format)
db.user_relationship.auth_user_id.requires = IS_IN_DB(db, 'auth_user.id', db.auth_user._format)
db.user_relationship.person_id.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.sharing.project_id.requires = IS_IN_DB(db, 'project.id', db.project._format)
db.sharing.person_id.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.sharing.role_id.requires = IS_IN_DB(db, 'role.id', db.role._format)
db.burndown.sprint_id.requires = IS_IN_DB(db, 'sprint.id', db.sprint._format)

