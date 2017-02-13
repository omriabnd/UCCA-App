__author__ = 'Yarin'
def get_random_user(numOfResults):
    params = {'results': numOfResults}
    r = requests.get('http://api.randomuser.me', params=params)
    users = r.json()
    users_list = {'users ':users['results']}