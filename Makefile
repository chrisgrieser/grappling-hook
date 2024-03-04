.PHONY: build init format check release

# build & open dev-vault
build:
	dev_vault_path="$$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Development" ; \
	plugin_path="$$dev_vault_path/.obsidian/plugins/grappling-hook" && \
	vault_name="$$(basename "$$dev_vault_path")" && \
	node esbuild.config.mjs && \
	cp -f main.js manifest.json styles.css "$$plugin_path" && \
	open "obsidian://open?vault=$$vault_name" && \
	open "obsidian://advanced-uri?vault=$$vault_name&commandid=app%253Areload"

# install dependencies, build, enable git hooks
init:
	npm install && \
	node esbuild.config.mjs
	git config core.hooksPath .githooks

format: 
	npx biome format --write "$$(git rev-parse --show-toplevel)"
	npx markdownlint-cli --fix --ignore="node_modules" "$$(git rev-parse --show-toplevel)"

check:
	zsh ./.githooks/pre-commit

release:
	zsh ./.release.sh

