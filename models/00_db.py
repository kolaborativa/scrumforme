# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

if not request.env.web2py_runtime_gae:
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL('sqlite://storage.sqlite',pool_size=1,check_reserved=['all'])
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore')
    ## store sessions and tickets there
    session.connect(request, response, db=db)
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []
## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'

#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################

from gluon.tools import Auth, Crud, Service, PluginManager, prettydate, Mail
auth = Auth(db)
crud, service, plugins = Crud(db), Service(), PluginManager()

# extra fields
auth.settings.extra_fields['auth_user']= [
        Field("type_network", "string", length=128, default=""),
        Field("token", "string", length=128, default=""),
        Field("first_time", "boolean", default=True),
    ]


## create all tables needed by auth if not custom tables
auth.define_tables(username=False, signature=False)

# hide fields
fields_to_hide = [
'type_network', 'token', 'first_time']

for fieldname in fields_to_hide:
    field = db.auth_user[fieldname]
    field.readable = field.writable = False

## imported variables
from data_config import EMAIL_SERVER, CLIENT_EMAIL, CLIENT_LOGIN

## configure email
mail = Mail()
mail.settings.server = EMAIL_SERVER
mail.settings.sender = CLIENT_EMAIL
mail.settings.login = CLIENT_LOGIN
auth.settings.mailer = mail

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True
auth.settings.register_next= URL('_create_person')
auth.settings.register_fields = ['first_name', 'last_name', 'email', 'password']

auth.settings.login_next = URL('projects')

# import Gravatar
try:
    from gravatar import Gravatar
except ImportError:
    from gluon.contrib.gravatar import Gravatar

## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.rpx_account import use_janrain
use_janrain(auth, filename='private/janrain.key')

#########################################################################
## Define your tables below (or better in another model file) for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
