#!/usr/bin/env zsh

echo "Plugin Name:"
read -r name

# plugin id is the same as the git repo name and can therefore be inferred
repo=$(git remote -v | head -n1 | sed 's/\.git.*//' | sed 's/.*://')
id=$(echo "$repo" | cut d/ -f2)

# desc can be inferred from github description (not using jq for portability)
desc=$(curl -sL https://api.github.com/repos/chrisgrieser/pseudometa-obsidian-plugin-template | grep "description" | head -n1 | cut -d'"' -f4)

# plugin class can be id in camelcase and therefore also inferred
class=$(echo "$id" | perl -pe 's/-(\w)/\U$1/g')

# current year for license
year=$(date +"%Y")

#───────────────────────────────────────────────────────────────────────────────

# replace them all
# $1: placeholder name as {{mustache-template}}
# $2: the replacement
function replacePlaceholders() {
	# INFO macOS' sed requires sed i '', remove the '' when on Linux or using GNU sed
	LC_ALL=C # prevent byte sequence error for whatever reason
	find . -type f -not -path '*/\.git/*' -not -name ".DS_Store" -not -path '*/node_modules/*' -exec sed -i '' "s/{{$1}}/$2/g" {} \;
}

replacePlaceholders "plugin-name" "$name"
replacePlaceholders "plugin-id" "$id"
replacePlaceholders "plugin-desc" "$desc"
replacePlaceholders "plugin-class" "$class"
replacePlaceholders "year" "$year"

#───────────────────────────────────────────────────────────────────────────────

# make this script delete itself
rm -- "$0"
