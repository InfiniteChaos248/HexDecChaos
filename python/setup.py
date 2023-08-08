from setuptools import setup
  
setup(
    name='HexDecChaosPy',
    version='0.1',
    description='Python Flask server for HexDecChaos website',
    author='Arjun',
    author_email='chaoticsoftwares@gmail.com',
    packages=['main'],
    install_requires=[
        'flask',
        'flask_cors',
        'apscheduler'      
    ],
)