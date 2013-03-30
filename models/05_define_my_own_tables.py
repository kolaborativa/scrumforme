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
        Field("benefit", "integer", default=None),
        Field("story_points", "integer", default=None),
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

if not "card" in db.tables:
    Card = db.define_table("card",
        Field("definition_ready_id", db.definition_ready, default=None),
        Field("title", "string", length=256, default=None),
        Field("started", "datetime", default=None),
        Field("ended", "datetime", default=None),
        Field("position_dom", "integer", default=None),
        Field("status", "string", length=128, default=None),
        Field("owner_card", db.person, default=None),
        format='%(title)s',
        migrate="card.table")

if not "card_comment" in db.tables:
    Card_comment = db.define_table("card_comment",
        Field("card_id", db.card, default=None),
        Field("text_", "string", length=256, default=None),
        Field("date_", "datetime", default=None),
        format='%(text)s',
        migrate="card_comment.table")

if not "user_relationship" in db.tables:
    db.define_table("user_relationship",
        Field("auth_user_id", db.auth_user, default=None),
        Field("person_id", db.person, default=None),
        migrate="user_relationship.table")

""" Relations between tables (remove fields you don't need from requires) """
db.project.created_by.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.sprint.project_id.requires = IS_IN_DB(db, 'project.id', db.project._format)
db.story.project_id.requires = IS_IN_DB(db, 'project.id', db.project._format)
db.story.sprint_id.requires = IS_IN_DB(db, 'sprint.id', db.sprint._format)
db.definition_ready.story_id.requires = IS_IN_DB(db, 'story.id', db.story._format)
db.card.definition_ready_id.requires = IS_IN_DB(db, 'definition_ready.id', db.definition_ready._format)
db.card.owner_card.requires = IS_IN_DB(db, 'person.id', db.person._format)
db.card_comment.card_id.requires = IS_IN_DB(db, 'card.id', db.card._format)
db.user_relationship.auth_user_id.requires = IS_IN_DB(db, 'auth_user.id', db.auth_user._format)
db.user_relationship.person_id.requires = IS_IN_DB(db, 'person.id', db.person._format)