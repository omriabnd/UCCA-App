# Collect the static web files - from the Angular frontend and the Backend static files
import sys
from argparse import ArgumentParser
import os
import shutil
import tempfile


def parse_args():
    parser = ArgumentParser()
    parser.add_argument('output_dir', help="Output directory for all static files")
    parser.add_argument('--frontend-dir', required=False, help='Frontend directory (try to find it automatically otherwise)')
    # parser.add_argument('--backend-image', default='chelem/zippori-backend', help='Backend Docker image')
    parser.add_argument('--force', action='store_true', default=False, help='Force the deletion of the output directory if it already exists')

    return parser.parse_args()


def estimate_frontend():
    # Default frontend dir is 
    # The frontend should be in ../../Client - relative to this script
    current = os.path.abspath(__file__)  # root/deployment/frontend/collect-files.py
    top = os.path.dirname(os.path.dirname(os.path.dirname(current))) # Should be root
    frontend = os.path.join(top, 'Client')

    return frontend


def generate_frontend_files(frontend_dir):
    # Generates the frontend files and returns the directory in which they reside
    cwd = os.curdir
    try:
        os.chdir(frontend_dir)
        os.system("yarn install")
        os.system("yarn run dev-build")
    finally:
        os.chdir(cwd)

    return os.path.join(frontend_dir, 'release')


def copy_frontend_files(src, output):
    shutil.copytree(src, output)


#def generate_backend_files(backend_image, output_dir):
#    log_dir = tempfile.mkdtemp()
#    try:
#        cmd = 'docker run -v %s:/logs -v %s:/static --entrypoint python %s /src/manage.py collectstatic --no-input' % \
#            (log_dir, output_dir, backend_image)
#        print(cmd)
#        os.system(cmd)
#    finally:
#        shutil.rmtree(log_dir)


def run():
    print("Collect Static Files for the UCCA Project")
    args = parse_args()
    output_dir = os.path.abspath(args.output_dir)
    if os.path.isdir(output_dir):
        if not args.force:
            print("Output directory %s must not exist. Or use --force" % args.output_dir, file=sys.stderr)
            return
        print("Deleting output directory %s..." % output_dir)
        shutil.rmtree(output_dir)

    frontend_dir = args.frontend_dir or estimate_frontend()
    if not os.path.isdir(frontend_dir):
        print("Invalid frontend directory %s" % frontend_dir, file=sys.stderr)
        return

    print("Generating frontend files")
    frontend_result_dir = generate_frontend_files(frontend_dir)

    print("Copying frontend files to ", output_dir)
    copy_frontend_files(frontend_result_dir, output_dir)

    # print("Copying backend files to ", output_dir)
    # generate_backend_files(args.backend_image, output_dir)


if __name__ == '__main__':
    run()