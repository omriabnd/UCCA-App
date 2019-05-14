#!/usr/bin/python
from __future__ import print_function
import argparse
import os

def parse_args():
    parser = argparse.ArgumentParser(description='Builds the UCCA Docker Images, and potentially pushes them to Dockerhub')
    parser.add_argument('version', type=str, help='Version number to tag')
    parser.add_argument('--latest', action='store_true', default=False, help='Tag as latest, too')
    parser.add_argument('--push', action='store_true', default=False, help='Push to Dockerhub')
    parser.add_argument('--no-cache', action='store_true', default=False, help='Ignore the Docker cache')
    parser.add_argument('--db', action='store_true', default=False, help='Build DB image as well')

    return parser.parse_args();

def system(cmd):
    print('Executing %s' % cmd)
    if os.system(cmd):
        raise Exception('Command returns a non zero value, aborting')
        
def build_image(image_name, folder, args):
    cwd = os.getcwd()
    try:
        print('Building image %s' % image_name)
        os.chdir(folder)
        system('docker build -t uccaproject/{image_name}:{version} {no_cache} .'.format(
            image_name=image_name, version=args.version, no_cache ='--no-cache' if args.no_cache else ''))
        if args.latest:
            system('docker tag uccaproject/{image_name}:{version}  uccaproject/{image_name}:latest'.format(
                image_name=image_name, version=args.version))
        if args.push:
            system('docker push uccaproject/{image_name}:{version}'.format(image_name=image_name, version=args.version))
            if args.latest:
                system('docker push uccaproject/{image_name}:latest'.format(image_name=image_name))
        print('Done')
    finally:
        os.chdir(cwd)


def run():
    args = parse_args()
    print('Creating docker images for version %s' % args.version)

    if (args.db):
        build_image('ucca-db', 'db', args)
    build_image('ucca-backend', '../Server', args)
    build_image('ucca-frontent', '../Client', args)

if __name__ == '__main__':
    run()