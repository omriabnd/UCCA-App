
ROLE_NAMES_ENUM = {
    "ADMIN":"Admin",
    "GUEST":"Guest",
    "PM":"Project Manager",
    "ANNOTATOR":"Annotator"
}

ROLE_NAMES = [
    ('ADMIN','Admin'),
    ('PROJECT_MANAGER','Project Manager'),
    ('ANNOTATOR','Annotator'),
    ('GUEST','Guest')
]
TAB_NAMES = [
    ('USERS','Users'),
    ('PROJECTS','Projects'),
    ('TASKS','Tasks'),
    ('LAYERS','Layers'),
    ('PASSAGES','Passages'),
    ('SOURCES','Sources')
]
LAYER_TYPES = [
    ('ROOT','Root'),
    ('EXTENSION','Extension'),
    ('REFINEMENT','Refinement'),
    ('COARSENING','Coarsening')
]
LAYER_TYPES_JSON = {
    'ROOT':'ROOT',
    'EXTENSION':'EXTENSION',
    'REFINEMENT':'REFINEMENT',
    'COARSENING':'COARSENING'
}
TASK_TYPES = [
    ('TOKENIZATION','Tokenization'),
    ('ANNOTATION','annotation'),
    ('REVIEW','review')
]
TASK_TYPES_JSON = {
    'TOKENIZATION':'TOKENIZATION',
    'ANNOTATION':'ANNOTATION',
    'REVIEW':'REVIEW'
}
PASSAGE_TYPES = [
    ('PUBLIC','Public'),
    ('PRIVATE','Private')
]
RESTRICTION_TYPES = [
    ('REQUIRE_SIBLING','require sibling'),
    ('REQUIRE_CHILD','require child'),
    ('FORBID_SIBILIMG','forbid sibilimg'),
    ('FORBID_CHILD','forbid child'),
    ('FORBID_ANY_CHILD','forbid any child')
]
RESTRICTION_TYPES_JSON = {
    'REQUIRE_SIBLING':'REQUIRE_SIBLING',
    'REQUIRE_CHILD':'REQUIRE_CHILD',
    'FORBID_SIBILIMG':'FORBID_SIBILIMG',
    'FORBID_CHILD':'FORBID_CHILD',
    'FORBID_ANY_CHILD':'FORBID_ANY_CHILD'
}
TASK_STATUS = [
    ('NOT_STARTED','NOT_STARTED'),
    ('ONGOING','ONGOING'),
    ('SUBMITTED','SUBMITTED'),
    ('REJECTED','REJECTED')
]
TASK_STATUS_JSON = {
    'NOT_STARTED':'NOT_STARTED',
    'ONGOING':'ONGOING',
    'SUBMITTED':'SUBMITTED',
    'REJECTED':'REJECTED'
}
SAVE_TYPES = ['draft','submit']

ANNOTATION_UNIT_TYPES = [
    ('IMPLICIT','REGULAR'),
    ('REGULAR','REGULAR')
]
ANNOTATION_GUI_STATUS = [
    ("OPEN","Open"),
    ("HIDDEN","Hidden"),
    ("COLLAPSE","Collapse")
]

TOKEN_MAX_LENGTH = 50

ANNOTATION_UNIT_ID_MAXLENGTH = 200

ORGANIZATION_MAX_LENGTH = 255

TOOLTIPS_MAX_LENGTH = 500

COMMENTS_MAX_LENGTH = 1000

CLUSTER_MAX_LENGTH = 100

DESCRIPTION_MAX_LENGTH = 20000

PASSAGES_TEXT_MAX_LENGTH = 50000

RESTRICTION_CATEGORIES_MAX_LENGTH = 100000
