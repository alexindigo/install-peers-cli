#!/bin/bash -e

if ! [ -e scripts/release.sh ]; then
  echo >&2 "You must scripts/release.sh from the repo root"
  exit 1
fi

if ! [ -z "$(git status --porcelain)" ]; then
  echo >&2 "You have uncommitted changes"
  exit 1
fi

update_version() {
  echo "$(node -p "p=require('./package.json');p.version='${1}';JSON.stringify(p,null,2)")" > package.json
  echo "Updated package.json to ${1}"
}

validate_semver() {
  if ! [[ $1 =~ ^[0-9]\.[0-9]+\.[0-9](-.+)? ]]; then
    echo >&2 "Version $1 is not valid! Use a valid semver like 1.0.0 or 1.0.0-alpha.0"
    exit 1
  fi
}

current_version=$(node -p "require('./package').version")
printf "Current version $current_version\n"
printf "Next version? "
read next_version
validate_semver $next_version

next_ref="v$next_version"

update_version $next_version

git commit -am "Publish $next_ref"

git push origin master

git tag $next_ref
git tag latest -f

git push origin $next_ref
git push origin latest -f

printf "Publishing $next_ref\n"

npm publish
