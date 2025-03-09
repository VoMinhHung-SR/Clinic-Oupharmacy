import os

# ...existing code...

DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Ensure ALLOWED_HOSTS is set correctly
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')
if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
    ALLOWED_HOSTS = ['localhost,127.0.0.1,0.0.0.0']

# ...existing code...
