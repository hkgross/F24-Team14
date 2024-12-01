from django.contrib.auth.hashers import make_password

SALT = "bnd9285n0zmvj82er8l3n63mzo1ur9c8d2mfid89awu34hgbrfja129dd83j9438h"
hashed_password = make_password(password='password', salt=SALT, hasher="sha256")
print(hashed_password)
print('pbkdf2_sha256$600000$bnd9285n0zmvj82er8l3n63mzo1ur9c8d2mfid89awu34hgbrfja129dd83j9438h$Aras1Kb4XVRR3WwRb+yNMHVm2h5X2gZYxavnj+nsqEY=')